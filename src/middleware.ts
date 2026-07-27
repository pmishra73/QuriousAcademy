import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "quriousacademy.com";

export default auth((req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as { role?: string } | undefined;

  // ── Subdomain routing ──────────────────────────────────────────────────────
  const host = req.headers.get("host") ?? "";
  const hostname = host.split(":")[0];

  const rootParts = ROOT_DOMAIN.split(".").length;
  const isProd =
    hostname.endsWith(`.${ROOT_DOMAIN}`) &&
    hostname !== `www.${ROOT_DOMAIN}` &&
    hostname.split(".").length === rootParts + 1;
  const isLocalDev =
    hostname.endsWith(".localhost") && hostname.split(".").length === 2;

  if (isProd || isLocalDev) {
    const subdomain = hostname.split(".")[0];
    if (subdomain && subdomain !== "www" && subdomain !== "api") {
      if (pathname === "/" || pathname === "") {
        // Internally rewrite root to the unified profile page
        const url = req.nextUrl.clone();
        url.pathname = `/p/${subdomain}`;
        return NextResponse.rewrite(url);
      }
      // All other paths (e.g. /courses/123) → redirect to main domain so
      // relative links in the profile page continue to work
      const port = req.nextUrl.port;
      const mainHost = isProd
        ? ROOT_DOMAIN
        : `localhost${port ? `:${port}` : ""}`;
      const proto = req.nextUrl.protocol; // "https:" or "http:"
      return NextResponse.redirect(
        new URL(`${proto}//${mainHost}${pathname}${req.nextUrl.search}`)
      );
    }
  }

  // ── Auth guards (main domain) ──────────────────────────────────────────────
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
    "/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)",
  ],
};
