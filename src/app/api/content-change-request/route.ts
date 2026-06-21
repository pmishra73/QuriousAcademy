import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMail, ADMIN } from "@/lib/mailer";

// POST — public: anyone submits a change suggestion
export async function POST(req: NextRequest) {
  const { contentType, contentId, contentTitle, ownerId, requestorName, requestorEmail, suggestion } = await req.json();

  if (!contentType || !contentId || !requestorName?.trim() || !requestorEmail?.trim() || !suggestion?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const request = await db.contentChangeRequest.create({
    data: {
      contentType,
      contentId,
      contentTitle,
      ownerId,
      requestorName: requestorName.trim(),
      requestorEmail: requestorEmail.trim(),
      suggestion: suggestion.trim(),
    },
  });

  // Notify admin
  await sendMail({
    to: ADMIN,
    subject: `New edit suggestion on "${contentTitle}"`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;background:#0a0e1a;color:#eef2ff;padding:28px;border-radius:12px">
        <div style="font-size:18px;font-weight:700;margin-bottom:16px">Edit Suggestion Received</div>
        <table style="width:100%;border-collapse:collapse">
          ${[["Content", `${contentType}: ${contentTitle}`], ["From", `${requestorName} (${requestorEmail})`], ["Suggestion", suggestion]]
            .map(([k, v]) => `<tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#9ba8c4;font-size:13px;width:30%">${k}</td><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:14px">${v}</td></tr>`).join("")}
        </table>
        <a href="https://quriousacademy.com/admin/content" style="display:inline-block;margin-top:20px;background:#5b7cfa;color:white;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none">Review in Admin →</a>
      </div>
    `,
  }).catch(console.error);

  return NextResponse.json({ ok: true, id: request.id }, { status: 201 });
}

// GET — admin only: list all requests
export async function GET() {
  const requests = await db.contentChangeRequest.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(requests);
}
