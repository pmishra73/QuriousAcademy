import { NextRequest, NextResponse } from "next/server";
import { getMergedVariants } from "@/lib/courseOverrides";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const all = await getMergedVariants();
  const v = all.find((c) => c.id === courseId);

  if (!v) {
    return new NextResponse("Course not found", { status: 404 });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${v.title} — Course Brochure | Qurious Academy</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #f8f9fc; color: #1a1d29; line-height: 1.6; }

    .page { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; }

    /* Header */
    .header { background: linear-gradient(135deg, #0d1117 0%, #151a2b 60%, #1a1136 100%); color: white; padding: 52px 48px 44px; border-radius: 16px; margin-bottom: 36px; position: relative; overflow: hidden; }
    .header::before { content: ''; position: absolute; top: -80px; right: -80px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(91,124,250,0.25) 0%, transparent 70%); }
    .header-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8b9fff; background: rgba(91,124,250,0.12); border: 1px solid rgba(91,124,250,0.3); padding: 4px 14px; border-radius: 100px; margin-bottom: 20px; }
    .header h1 { font-size: 36px; font-weight: 800; line-height: 1.2; margin-bottom: 12px; letter-spacing: -0.02em; }
    .header .tagline { font-size: 16px; color: rgba(255,255,255,0.65); margin-bottom: 28px; }
    .header-meta { display: flex; flex-wrap: wrap; gap: 10px; }
    .meta-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); padding: 5px 14px; border-radius: 8px; color: rgba(255,255,255,0.8); }

    /* Sections */
    .section { background: white; border: 1px solid #e8eaf0; border-radius: 14px; padding: 32px; margin-bottom: 24px; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8b9ab3; margin-bottom: 18px; }
    .overview { font-size: 15px; line-height: 1.75; color: #374151; }

    /* Outcomes */
    .outcomes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .outcome-item { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; line-height: 1.5; }
    .outcome-dot { width: 20px; height: 20px; background: #eef0ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; color: #5b7cfa; font-size: 11px; font-weight: 700; }

    /* Sessions */
    .session-item { border-left: 2px solid #e8eaf0; padding: 0 0 24px 20px; margin-bottom: 4px; position: relative; }
    .session-item:last-child { padding-bottom: 0; }
    .session-item::before { content: ''; position: absolute; left: -5px; top: 4px; width: 8px; height: 8px; background: #5b7cfa; border-radius: 50%; }
    .session-num { font-size: 10px; font-weight: 700; color: #5b7cfa; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
    .session-title { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
    .topic-list { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; }
    .topic-pill { font-size: 12px; background: #f3f4f8; padding: 3px 10px; border-radius: 6px; color: #4b5563; }

    /* Includes */
    .includes-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .include-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; }
    .check { color: #10b981; font-size: 14px; font-weight: 700; }

    /* Price card */
    .price-card { background: linear-gradient(135deg, #5b7cfa 0%, #8b6ff7 100%); color: white; border-radius: 14px; padding: 32px; text-align: center; margin-bottom: 24px; }
    .price-amount { font-size: 48px; font-weight: 800; line-height: 1; letter-spacing: -0.03em; margin-bottom: 8px; }
    .price-note { font-size: 13px; opacity: 0.8; margin-bottom: 24px; }
    .enroll-btn { display: inline-block; background: white; color: #5b7cfa; font-weight: 700; font-size: 15px; padding: 14px 36px; border-radius: 10px; text-decoration: none; letter-spacing: 0.01em; }

    /* Certificate */
    .certificate-banner { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #f59e0b; border-radius: 10px; padding: 16px 20px; display: flex; align-items: center; gap: 14px; font-size: 14px; color: #78350f; }

    /* Footer */
    .footer { text-align: center; color: #9ba3b4; font-size: 12px; margin-top: 48px; padding-top: 24px; border-top: 1px solid #e8eaf0; }

    @media print {
      body { background: white; }
      .page { padding: 20px; }
    }
  </style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div class="header-badge">${v.type.replace(/-/g, " ")}</div>
    <h1>${v.title}</h1>
    <p class="tagline">${v.tagline}</p>
    <div class="header-meta">
      <span class="meta-pill">📅 ${v.duration}</span>
      <span class="meta-pill">📶 ${v.level}</span>
      <span class="meta-pill">🎙 ${v.deliveryMode}</span>
      <span class="meta-pill">👤 ${v.instructor}</span>
    </div>
  </div>

  <!-- Overview -->
  <div class="section">
    <div class="section-title">About this course</div>
    <p class="overview">${v.content.overview}</p>
    ${v.content.prerequisites ? `<p style="margin-top:16px;font-size:13px;color:#6b7280;"><strong>Prerequisites:</strong> ${v.content.prerequisites}</p>` : ""}
  </div>

  <!-- What you'll learn -->
  <div class="section">
    <div class="section-title">What you'll learn</div>
    <div class="outcomes-grid">
      ${v.content.outcomes.map((o, i) => `
        <div class="outcome-item">
          <div class="outcome-dot">${i + 1}</div>
          <span>${o}</span>
        </div>
      `).join("")}
    </div>
  </div>

  <!-- Curriculum -->
  <div class="section">
    <div class="section-title">Curriculum · ${v.content.sessions.length} sessions</div>
    ${v.content.sessions.map((s) => `
      <div class="session-item">
        <div class="session-num">Session ${s.session}</div>
        <div class="session-title">${s.title}</div>
        <ul class="topic-list">
          ${s.topics.map((t) => `<li class="topic-pill">${t}</li>`).join("")}
        </ul>
      </div>
    `).join("")}
  </div>

  <!-- What's included -->
  <div class="section">
    <div class="section-title">What's included</div>
    <div class="includes-list">
      ${v.content.includes.map((item) => `
        <div class="include-item"><span class="check">✓</span> ${item}</div>
      `).join("")}
    </div>
  </div>

  ${v.effectiveScheduleDates.length > 0 ? `
  <!-- Upcoming batches -->
  <div class="section">
    <div class="section-title">Upcoming batches</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${v.effectiveScheduleDates.slice(0, 4).map((d) => `
        <div style="display:flex;align-items:center;gap:10px;font-size:14px;padding:10px 14px;background:#f8f9fc;border-radius:8px;border:1px solid #e8eaf0;">
          <span style="color:#5b7cfa;font-size:16px">📅</span> ${d}
        </div>
      `).join("")}
    </div>
  </div>
  ` : ""}

  <!-- Certificate -->
  <div class="certificate-banner">
    <span style="font-size:24px">🎓</span>
    <p>${v.content.certificate}</p>
  </div>

  <!-- Pricing + CTA -->
  <div class="price-card">
    <div class="price-amount">₹${v.price.toLocaleString("en-IN")}</div>
    <p class="price-note">${v.deliveryMode} · ${v.duration}${v.recordedPrice ? ` · Recorded version available at ₹${v.recordedPrice.toLocaleString("en-IN")}` : ""}</p>
    <a href="https://quriousacademy.com/enroll?course=${v.id}" class="enroll-btn">Enrol Now →</a>
  </div>

  <div class="footer">
    <strong>Qurious Academy</strong> · hello@quriousacademy.com · quriousacademy.com<br />
    Where curiosity meets clarity.
  </div>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
