import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "quriousacademy.com";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
        const url = req.nextUrl.clone();
        url.pathname = `/p/${subdomain}`;
        return NextResponse.rewrite(url);
      }
      const port = req.nextUrl.port;
      const mainHost = isProd
        ? ROOT_DOMAIN
        : `localhost${port ? `:${port}` : ""}`;
      const proto = req.nextUrl.protocol;
      return NextResponse.redirect(
        new URL(`${proto}//${mainHost}${pathname}${req.nextUrl.search}`)
      );
    }
  }

  // ── Auth guards (main domain) ──────────────────────────────────────────────
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";

  if (pathname.startsWith("/admin") || pathname.startsWith("/teacher")) {
    const token = await getToken({ req, secret });
    const role = token?.role as string | undefined;

    if (pathname.startsWith("/admin")) {
      if (!token) return NextResponse.redirect(new URL("/login?from=admin", req.url));
      if (role !== "admin") return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }

    if (pathname.startsWith("/teacher")) {
      if (!token) return NextResponse.redirect(new URL("/login?from=teacher", req.url));
      if (role !== "teacher" && role !== "admin")
        return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }
  }
}

export const config = {
  matcher: [
    "/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)",
  ],
};
