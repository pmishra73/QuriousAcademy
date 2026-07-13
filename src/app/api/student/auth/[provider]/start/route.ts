import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getProvider, isProviderConfigured } from "@/lib/student-oauth";

function redirectUriFor(provider: string) {
  const base = process.env.NEXTAUTH_URL ?? "https://quriousacademy.com";
  return `${base.replace(/\/$/, "")}/api/student/auth/${provider}/callback`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!getProvider(provider) || !isProviderConfigured(provider)) {
    return NextResponse.json({ error: "Provider not available" }, { status: 404 });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const config = getProvider(provider)!;
  const res = NextResponse.redirect(config.buildAuthorizeUrl(state, redirectUriFor(provider)));
  res.cookies.set(`student_oauth_state_${provider}`, state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}
