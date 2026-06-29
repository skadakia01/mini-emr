import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const PORTAL_ROUTES = ["/dashboard", "/appointments", "/prescriptions"]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Portal: require patient session
  if (PORTAL_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    const token = await getToken({ req })
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Admin: require admin session cookie (skip /admin/login and /api/admin/*)
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login") &&
    !pathname.startsWith("/api/admin")
  ) {
    const adminSession = req.cookies.get("admin_session")?.value
    if (!adminSession || adminSession !== process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard", "/appointments", "/prescriptions", "/admin/:path*"],
}
