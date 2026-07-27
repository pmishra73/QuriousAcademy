import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { escHtml, safeHref } from "@/lib/html-escape";

function gcalLink(title: string, start: Date, meetingLink: string | null) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(start.getTime() + 90 * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: meetingLink ? `Join here: ${meetingLink}` : "Check your email for the meeting link.",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;
  if (role !== "teacher" && role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, title, scheduledAt, meetingLink, notes } = await req.json();

  // Teachers can only create sessions for their own assigned courses
  if (role === "teacher") {
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const assignment = await db.courseAssignment.findFirst({ where: { teacherId: userId, courseId } });
    if (!assignment) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const scheduledDate = new Date(scheduledAt);

  const s = await db.session.create({
    data: { courseId, title, scheduledAt: scheduledDate, meetingLink: meetingLink || null, notes: notes || null },
  });

  // Email all confirmed students enrolled in this course
  const enrollments = await db.enrollment.findMany({
    where: { courseId, status: "confirmed" },
    select: { studentName: true, studentEmail: true },
  });

  const calLink = gcalLink(title, scheduledDate, meetingLink ?? null);
  const dateStr = scheduledDate.toLocaleString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
  });

  const emailPromises = enrollments.map(({ studentName, studentEmail }) =>
    sendMail({
      to: studentEmail,
      subject: `Upcoming Class: ${title}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a2e">
          <h2 style="color:#5b7cfa">Upcoming Class Scheduled</h2>
          <p>Hi ${studentName},</p>
          <p>A new class has been scheduled for your course.</p>
          <table style="border-collapse:collapse;width:100%;margin:16px 0">
            <tr><td style="padding:8px 0;color:#666;width:100px">Session</td><td style="padding:8px 0;font-weight:600">${title}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Date &amp; Time</td><td style="padding:8px 0;font-weight:600">${dateStr} IST</td></tr>
            ${meetingLink ? `<tr><td style="padding:8px 0;color:#666">Meeting Link</td><td style="padding:8px 0"><a href="${safeHref(meetingLink)}" style="color:#5b7cfa">${escHtml(meetingLink)}</a></td></tr>` : ""}
            ${notes ? `<tr><td style="padding:8px 0;color:#666">Notes</td><td style="padding:8px 0">${escHtml(notes)}</td></tr>` : ""}
          </table>
          <a href="${calLink}" style="display:inline-block;background:#5b7cfa;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:8px 0">
            Add to Google Calendar
          </a>
          <p style="margin-top:24px;color:#666;font-size:13px">See you there!<br>— Qurious Academy</p>
        </div>
      `,
    }).catch(() => null)
  );

  await Promise.allSettled(emailPromises);

  return NextResponse.json({ ok: true, id: s.id, emailed: enrollments.length });
}
