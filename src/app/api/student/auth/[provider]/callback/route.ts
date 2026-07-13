import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProvider, isProviderConfigured } from "@/lib/student-oauth";
import { createStudentSession } from "@/lib/student-session";

function redirectUriFor(provider: string) {
  const base = process.env.NEXTAUTH_URL ?? "https://quriousacademy.com";
  return `${base.replace(/\/$/, "")}/api/student/auth/${provider}/callback`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const config = getProvider(provider);
  if (!config || !isProviderConfigured(provider)) {
    return NextResponse.json({ error: "Provider not available" }, { status: 404 });
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get(`student_oauth_state_${provider}`)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/student/login?error=invalid_state", req.url));
  }

  try {
    const token = await config.exchangeCode(code, redirectUriFor(provider));
    const profile = await config.fetchProfile(token.access_token);
    if (!profile.email) throw new Error("Provider did not return an email address");

    const student = await db.student.upsert({
      where: { email: profile.email },
      create: { email: profile.email, name: profile.name, image: profile.picture },
      update: { name: profile.name ?? undefined, image: profile.picture ?? undefined },
    });

    await createStudentSession(student.id);
  } catch (err) {
    console.error(`Student OAuth (${provider}) callback failed:`, err);
    return NextResponse.redirect(new URL("/student/login?error=oauth_failed", req.url));
  }

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.delete(`student_oauth_state_${provider}`);
  return res;
}
