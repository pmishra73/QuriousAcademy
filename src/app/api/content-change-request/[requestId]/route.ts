import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendMail, ADMIN } from "@/lib/mailer";
import { createCoupon } from "@/lib/coupon";

type Params = { params: Promise<{ requestId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;
  if (!session || (role !== "admin" && role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId } = await params;
  const { action, note } = await req.json();
  // action: "admin_approve" | "admin_reject" | "owner_confirm" | "owner_decline" | "final_approve" | "final_reject"

  const cr = await db.contentChangeRequest.findUnique({ where: { id: requestId } });
  if (!cr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Permission checks
  if ((action === "owner_confirm" || action === "owner_decline") && role !== "admin" && cr.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if ((action === "admin_approve" || action === "admin_reject" || action === "final_approve" || action === "final_reject") && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let newStatus = cr.status;
  let emailJob: (() => Promise<void>) | null = null;

  if (action === "admin_approve" && cr.status === "pending_admin") {
    // If admin owns the content (ownerId empty or no teacher found), skip to owner_confirmed
    const owner = cr.ownerId ? await db.user.findUnique({ where: { id: cr.ownerId }, select: { email: true, name: true } }) : null;
    if (!owner) {
      newStatus = "owner_confirmed"; // admin is the owner — skip owner step
    } else {
    newStatus = "pending_owner";
    emailJob = () => sendMail({
        to: owner.email,
        subject: `Edit request forwarded to you: "${cr.contentTitle}"`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:520px;padding:28px">
            <h2>Hi ${owner.name},</h2>
            <p>A user has suggested an edit on your content <strong>${cr.contentTitle}</strong>, and the admin has reviewed and forwarded it to you.</p>
            <div style="background:#f3f4ff;border:1px solid #dde;border-radius:10px;padding:16px 20px;margin:20px 0">
              <div style="font-size:12px;color:#666;margin-bottom:6px">Suggestion from ${cr.requestorName}</div>
              <div style="font-size:14px;color:#1a1a2e;line-height:1.6">${cr.suggestion}</div>
            </div>
            <p>Please log in to your teacher dashboard and confirm whether you'll make this change.</p>
            <a href="https://quriousacademy.com/teacher/change-requests" style="display:inline-block;background:#5b7cfa;color:white;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none">View Request →</a>
          </div>
        `,
      }).catch(console.error);
    }
  } else if (action === "admin_reject" && cr.status === "pending_admin") {
    newStatus = "rejected";
  } else if (action === "owner_confirm" && cr.status === "pending_owner") {
    newStatus = "owner_confirmed";
    // Notify admin that owner confirmed
    emailJob = () => sendMail({
      to: ADMIN,
      subject: `Owner confirmed edit on "${cr.contentTitle}" — ready for final review`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;background:#0a0e1a;color:#eef2ff;padding:28px;border-radius:12px">
          <div style="font-size:18px;font-weight:700;margin-bottom:12px">Owner Confirmed Change</div>
          <p style="color:#9ba8c4;font-size:14px">The content owner has confirmed they will make the requested edit on <strong style="color:#eef2ff">${cr.contentTitle}</strong>.</p>
          ${note ? `<p style="font-size:13px;color:#9ba8c4">Owner note: ${note}</p>` : ""}
          <a href="https://quriousacademy.com/admin/content" style="display:inline-block;margin-top:16px;background:#5b7cfa;color:white;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none">Do Final Review →</a>
        </div>
      `,
    }).catch(console.error);
  } else if (action === "owner_decline" && cr.status === "pending_owner") {
    newStatus = "rejected";
  } else if (action === "final_approve" && cr.status === "owner_confirmed") {
    newStatus = "approved";
    // Send thank-you + coupon to requestor
    emailJob = async () => {
      let couponCode = "";
      try {
        couponCode = await createCoupon({ reason: "content_edit_thanks" });
      } catch {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        couponCode = `QA-${Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")}`;
      }
      await sendMail({
        to: cr.requestorEmail,
        subject: `Thank you for improving Qurious Academy content!`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px">
            <h2 style="margin-bottom:8px">Hi ${cr.requestorName},</h2>
            <p style="color:#555;line-height:1.7">
              Your suggestion on <strong>${cr.contentTitle}</strong> has been reviewed, accepted, and the content has been updated. Thank you for helping make Qurious Academy better!
            </p>
            <div style="margin:28px 0;padding:20px 24px;background:#f3f4ff;border:2px dashed #5b7cfa;border-radius:10px;text-align:center">
              <div style="font-size:12px;color:#5b7cfa;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px">Your reward</div>
              <div style="font-size:32px;font-weight:800;letter-spacing:0.15em;color:#1a1a2e">${couponCode}</div>
              <div style="font-size:13px;color:#666;margin-top:8px">10% off · Valid for 1 year · One use only</div>
            </div>
            <p style="color:#555;line-height:1.7">Use this code at checkout on any course enrollment.</p>
            <a href="https://quriousacademy.com/courses" style="display:inline-block;margin-top:12px;background:#5b7cfa;color:white;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none">Browse Courses →</a>
            <p style="color:#aaa;font-size:12px;margin-top:28px">— The Qurious Academy Team · hello@quriousacademy.com</p>
          </div>
        `,
      }).catch(console.error);
    };
  } else if (action === "final_reject" && cr.status === "owner_confirmed") {
    newStatus = "rejected";
  } else {
    return NextResponse.json({ error: "Invalid action for current status" }, { status: 400 });
  }

  const updated = await db.contentChangeRequest.update({
    where: { id: requestId },
    data: {
      status: newStatus,
      ...(note ? (action.startsWith("admin") || action === "final_approve" || action === "final_reject" ? { adminNote: note } : { ownerNote: note }) : {}),
      ...(action.includes("reject") ? { rejectedBy: role === "admin" ? "admin" : "owner" } : {}),
    },
  });

  if (emailJob) await emailJob();
  return NextResponse.json(updated);
}
