import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as { role?: string } | undefined;

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
  matcher: ["/admin/:path*", "/teacher/:path*"],
};
