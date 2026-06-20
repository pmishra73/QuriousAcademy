"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import * as LucideIcons from "lucide-react";
import { courses } from "@/lib/courses";
import { variants } from "@/lib/variants";
import { getUpcomingDates } from "@/lib/dates";
import Link from "next/link";

function CourseIcon({ name, size = 32 }: { name: string; size?: number }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>)[name];
  if (!Icon) return <span style={{ fontSize: size }}>{name.includes(" ") || name.length < 3 ? name : "📘"}</span>;
  return <Icon size={size} strokeWidth={1.5} />;
}

// Extend window for Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  modal: { ondismiss: () => void };
}
interface RazorpayInstance { open(): void; }

function useRazorpay() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (document.getElementById("razorpay-script")) { setLoaded(true); return; }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
  }, []);
  return loaded;
}

function EnrollForm() {
  const params = useSearchParams();
  const courseId = params.get("course") || "";
  const razorpayReady = useRazorpay();

  // Find in both variants and old courses
  const variant = variants.find((v) => v.id === courseId);
  const oldCourse = courses.find((c) => c.id === courseId);
  const courseTitle = variant?.title ?? oldCourse?.title ?? "";
  const coursePrice = variant?.price ?? oldCourse?.price ?? 0;
  const courseDuration = variant?.duration ?? oldCourse?.duration ?? "";
  const courseInstructor = variant?.instructor ?? oldCourse?.instructor ?? "";
  const courseBadge = variant?.icon ?? oldCourse?.badge ?? "📘";

  const [form, setForm] = useState({ name: "", email: "", phone: "", courseId });
  const [batchDate, setBatchDate] = useState("");
  const [coupon, setCoupon] = useState("");

  // Compute upcoming batches for the selected live variant
  const selectedVariant = variants.find((v) => v.id === form.courseId);
  const isLive = selectedVariant?.deliveryMode === "Live";
  const upcomingBatches = selectedVariant && isLive ? getUpcomingDates(selectedVariant.schedule) : [];
  const [couponState, setCouponState] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [couponMsg, setCouponMsg] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const discountedPrice = couponState === "valid"
    ? Math.round((variants.find(v => v.id === form.courseId)?.price ?? courses.find(c => c.id === form.courseId)?.price ?? 0) * 0.9)
    : null;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponState("checking");
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponState("valid");
        setCouponMsg("Coupon applied — 10% off!");
      } else {
        setCouponState("invalid");
        setCouponMsg(data.reason ?? "Invalid coupon");
      }
    } catch {
      setCouponState("invalid");
      setCouponMsg("Could not verify coupon. Try again.");
    }
  };

  // Reset batch when course changes
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (k === "courseId") setBatchDate("");
  };

  const inp: React.CSSProperties = {
    width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
    color: "var(--foreground)", borderRadius: 8, padding: "12px 14px",
    fontSize: 14, outline: "none", fontFamily: "inherit",
  };
  const lbl: React.CSSProperties = {
    fontSize: 12, color: "var(--text-muted)", display: "block",
    marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em",
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      setErrMsg("Please fill in all fields before proceeding to payment.");
      return;
    }
    if (isLive && upcomingBatches.length > 0 && !batchDate) {
      setErrMsg("Please select a batch date to continue.");
      return;
    }
    if (!razorpayReady) {
      setErrMsg("Payment gateway is loading. Please try again in a moment.");
      return;
    }
    setErrMsg("");
    setStatus("loading");

    try {
      // Step 1: Create order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: form.courseId, couponCode: couponState === "valid" ? coupon.trim() : "" }),
      });

      if (!orderRes.ok) throw new Error("Failed to create order");
      const order = await orderRes.json();
      setStatus("idle");

      // Step 2: Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Qurious Academy",
        description: order.courseName,
        order_id: order.orderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#5b7cfa" },
        handler: async (response) => {
          setStatus("loading");
          // Step 3: Verify payment server-side
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              studentName: form.name,
              studentEmail: form.email,
              studentPhone: form.phone,
              courseId: form.courseId,
              couponCode: couponState === "valid" ? coupon.trim() : "",
              finalAmount: order.finalAmount,
              batchDate: batchDate || undefined,
            }),
          });

          if (verifyRes.ok) {
            setStatus("success");
          } else {
            setStatus("error");
            setErrMsg("Payment received but verification failed. Please contact us with your payment ID: " + response.razorpay_payment_id);
          }
        },
        modal: {
          ondismiss: () => setStatus("idle"),
        },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrMsg("Something went wrong. Please try again or contact hello@quriousacademy.com");
    }
  };

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, margin: "0 auto 24px",
        }}>✓</div>
        <h2 style={{ fontSize: 32, marginBottom: 12 }}>You're enrolled!</h2>
        <p style={{ color: "var(--text-dim)", fontSize: 16, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 12px" }}>
          Payment confirmed. We've sent a confirmation to <strong>{form.email}</strong> with the class joining details.
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 36 }}>
          Expect the joining link within a few hours.
        </p>
        <Link href="/courses" style={{
          background: "var(--primary)", color: "white", padding: "12px 28px",
          borderRadius: 8, fontWeight: 500, fontSize: 14,
        }}>
          Browse more courses →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px" }}>
      <Link href={courseId ? `/courses` : "/courses"} style={{ fontSize: 13, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 36 }}>
        ← Back to Courses
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 48, alignItems: "start" }}>
        {/* Form */}
        <div>
          <div className="tag" style={{ display: "inline-flex", marginBottom: 20 }}>Enrollment</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,42px)", marginBottom: 12 }}>Complete your enrollment</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 15, marginBottom: 36, lineHeight: 1.7 }}>
            Fill in your details below. You'll be taken to a secure Razorpay checkout to complete payment.
          </p>

          <form onSubmit={handlePayment} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={lbl}>Full Name *</label>
                <input style={inp} value={form.name} onChange={set("name")} placeholder="Your full name" required />
              </div>
              <div>
                <label style={lbl}>Phone Number *</label>
                <input style={inp} type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" required />
              </div>
            </div>

            <div>
              <label style={lbl}>Email Address *</label>
              <input style={inp} type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required />
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                Confirmation and class joining link will be sent here.
              </p>
            </div>

            {/* Coupon field */}
            <div>
              <label style={lbl}>Coupon Code</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ ...inp, flex: 1, textTransform: "uppercase", letterSpacing: "0.08em" }}
                  value={coupon}
                  onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponState("idle"); setCouponMsg(""); }}
                  placeholder="QA-XXXXXX"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={!coupon.trim() || couponState === "checking"}
                  style={{
                    padding: "12px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                    border: "1px solid var(--border)", background: "var(--surface-2)",
                    color: "var(--text-dim)", cursor: coupon.trim() ? "pointer" : "not-allowed",
                    fontFamily: "inherit", whiteSpace: "nowrap",
                  }}
                >
                  {couponState === "checking" ? "Checking…" : "Apply"}
                </button>
              </div>
              {couponMsg && (
                <p style={{ fontSize: 12, marginTop: 6, color: couponState === "valid" ? "#34d399" : "#f97316" }}>
                  {couponState === "valid" ? "✓ " : "✗ "}{couponMsg}
                </p>
              )}
              {couponState === "idle" && !couponMsg && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  Got a coupon from a course unlock? Enter it here for 10% off.
                </p>
              )}
            </div>

            <div>
              <label style={lbl}>Course</label>
              <select
                style={{ ...inp, background: "var(--surface-2)" }}
                value={form.courseId}
                onChange={set("courseId")}
                required
              >
                <option value="">Select a course</option>
                <optgroup label="Masterclasses">
                  {variants.filter(v => v.type === "masterclass").map(v => (
                    <option key={v.id} value={v.id}>{v.title} — ₹{v.price.toLocaleString("en-IN")}</option>
                  ))}
                </optgroup>
                <optgroup label="Weekend Cohorts">
                  {variants.filter(v => v.type === "cohort").map(v => (
                    <option key={v.id} value={v.id}>{v.title} — ₹{v.price.toLocaleString("en-IN")}</option>
                  ))}
                </optgroup>
                <optgroup label="Sprint Courses (4 weeks)">
                  {variants.filter(v => v.type === "sprint").map(v => (
                    <option key={v.id} value={v.id}>{v.title} — ₹{v.price.toLocaleString("en-IN")}</option>
                  ))}
                </optgroup>
                <optgroup label="Deep Dives (6–12 weeks)">
                  {variants.filter(v => v.type === "deep-dive").map(v => (
                    <option key={v.id} value={v.id}>{v.title} — ₹{v.price.toLocaleString("en-IN")}</option>
                  ))}
                </optgroup>
                <optgroup label="Full Courses (6–8 months)">
                  {variants.filter(v => v.type === "full-course").map(v => (
                    <option key={v.id} value={v.id}>{v.title} — ₹{v.price.toLocaleString("en-IN")}</option>
                  ))}
                </optgroup>
                <optgroup label="Interview Preparation">
                  {variants.filter(v => v.type === "interview-prep").map(v => (
                    <option key={v.id} value={v.id}>{v.title} — ₹{v.price.toLocaleString("en-IN")}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Batch picker for live courses */}
            {isLive && upcomingBatches.length > 0 && (
              <div>
                <label style={lbl}>Select Batch *</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {upcomingBatches.map((batch) => (
                    <label key={batch} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 14px", borderRadius: 8, cursor: "pointer",
                      border: `1px solid ${batchDate === batch ? "var(--primary)" : "var(--border)"}`,
                      background: batchDate === batch ? "rgba(91,124,250,0.08)" : "var(--surface-2)",
                      fontSize: 13,
                    }}>
                      <input
                        type="radio"
                        name="batchDate"
                        value={batch}
                        checked={batchDate === batch}
                        onChange={(e) => setBatchDate(e.target.value)}
                        style={{ accentColor: "var(--primary)" }}
                      />
                      <span>{batch}</span>
                    </label>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  Live classes run on fixed schedules. Pick the batch that works for you.
                </p>
              </div>
            )}

            {/* Recorded option note for live courses that have a recorded variant */}
            {isLive && selectedVariant?.recordedPrice && (
              <div style={{
                fontSize: 13, color: "var(--text-muted)", padding: "10px 14px",
                background: "var(--surface-2)", borderRadius: 8,
                border: "1px solid var(--border)", lineHeight: 1.6,
              }}>
                Can&apos;t make the live batch? A <strong>recorded version</strong> is available at ₹{selectedVariant.recordedPrice.toLocaleString("en-IN")}.{" "}
                <a href="/contact" style={{ color: "var(--primary)", textDecoration: "none" }}>Contact us</a> to purchase.
              </div>
            )}

            {errMsg && (
              <div style={{
                fontSize: 13, color: "#f97316", padding: "12px 16px",
                background: "rgba(249,115,22,0.08)", borderRadius: 8,
                border: "1px solid rgba(249,115,22,0.2)", lineHeight: 1.6,
              }}>
                {errMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                marginTop: 4, background: "var(--primary)", color: "white",
                padding: "15px", borderRadius: 8, fontWeight: 600, fontSize: 15,
                cursor: status === "loading" ? "not-allowed" : "pointer",
                border: "none", fontFamily: "inherit",
                opacity: status === "loading" ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
            >
              {status === "loading" ? (
                <>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Processing...
                </>
              ) : (
                `Pay ₹${(discountedPrice ?? variants.find(v => v.id === form.courseId)?.price ?? courses.find(c => c.id === form.courseId)?.price ?? 0).toLocaleString("en-IN")} with Razorpay →`
              )}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Secured by</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#528FF0" }}>Razorpay</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>· UPI · Cards · Net Banking · Wallets</span>
            </div>
          </form>
        </div>

        {/* Order summary */}
        <div style={{ position: "sticky", top: 80 }}>
          {form.courseId ? (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 14, color: "var(--primary)" }}><CourseIcon name={courseBadge} size={32} /></div>
              <h3 style={{ fontSize: 18, marginBottom: 6 }}>{courseTitle}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "16px 0", paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
                {[
                  ["Instructor", courseInstructor],
                  ["Duration", courseDuration],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--text-muted)" }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Total</span>
                <div style={{ textAlign: "right" }}>
                  {discountedPrice && (
                    <div style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "line-through" }}>
                      ₹{coursePrice.toLocaleString("en-IN")}
                    </div>
                  )}
                  <span style={{ fontSize: 26, fontWeight: 700, color: discountedPrice ? "#34d399" : "var(--foreground)" }}>
                    ₹{(discountedPrice ?? coursePrice).toLocaleString("en-IN")}
                  </span>
                  {discountedPrice && (
                    <div style={{ fontSize: 11, color: "#34d399", marginTop: 2 }}>10% coupon applied ✓</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, color: "var(--text-muted)", fontSize: 14 }}>
              Select a course above to see the summary.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
            {[
              { icon: "🔒", text: "256-bit SSL encrypted payment" },
              { icon: "✓", text: "Instant confirmation email" },
              { icon: "↩", text: "Refund within 48 hrs of first class if unsatisfied" },
            ].map((f) => (
              <div key={f.text} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "var(--text-muted)" }}>
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function EnrollPage() {
  return (
    <Suspense fallback={<div style={{ padding: 80, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}>
      <EnrollForm />
    </Suspense>
  );
}
