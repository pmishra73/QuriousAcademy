import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

export default auth((req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as { role?: string } | undefined;

  // ── Subdomain routing ──────────────────────────────────────────────────────
  const host = req.headers.get("host") ?? "";
  const hostname = host.split(":")[0];

  const isProd = hostname.endsWith(".quriousacademy.com") && hostname.split(".").length === 3;
  const isLocalDev = hostname.endsWith(".localhost") && hostname.split(".").length === 2;

  if (isProd || isLocalDev) {
    const subdomain = hostname.split(".")[0];
    if (subdomain && subdomain !== "www" && subdomain !== "api") {
      const url = req.nextUrl.clone();
      url.pathname = `/p/${subdomain}${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // ── Auth guards ────────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!user) return NextResponse.redirect(new URL("/login?from=admin", req.url));
    if (user.role !== "admin") return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
  }

  if (pathname.startsWith("/teacher")) {
    if (!user) return NextResponse.redirect(new URL("/login?from=teacher", req.url));
    if (user.role !== "teacher" && user.role !== "admin")
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)",
  ],
};
