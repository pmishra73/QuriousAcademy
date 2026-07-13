import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { exchangeCodeForToken } from "@/lib/linkedin";

export async function GET(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;
  if (!session || role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get("li_oauth_state")?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/admin/settings/linkedin?error=invalid_state", req.url));
  }

  try {
    const token = await exchangeCodeForToken(code);
    await db.linkedInIntegration.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        tokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
        connectedByUserId: userId,
      },
      update: {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        tokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
        connectedByUserId: userId,
      },
    });
  } catch (err) {
    console.error("LinkedIn OAuth callback failed:", err);
    return NextResponse.redirect(new URL("/admin/settings/linkedin?error=token_exchange_failed", req.url));
  }

  const res = NextResponse.redirect(new URL("/admin/settings/linkedin?connected=1", req.url));
  res.cookies.delete("li_oauth_state");
  return res;
}
