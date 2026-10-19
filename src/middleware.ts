import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow Next.js internal files, static assets, images, audio, uploads, and voice-engine APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/audio") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/voice-engine") ||
    pathname.startsWith("/api/admin") ||
    pathname === "/api/currencies" ||
    pathname === "/api/admin/login" ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check User Authentication Session
  const sessionCookie = request.cookies.get("voxera_session")?.value;
  let isUserAuthenticated = false;

  if (sessionCookie) {
    try {
      const parsed = JSON.parse(sessionCookie);
      if (parsed.userId || parsed.email) {
        isUserAuthenticated = true;
      }
    } catch {
      isUserAuthenticated = false;
    }
  }

  // Check Admin Authentication
  const adminCookie = request.cookies.get("voxera_admin_authenticated")?.value;
  const isAdminAuthenticated = adminCookie === "true";

  // 2. Admin Routes Protection
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (isAdminAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    if (!isAdminAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // 3. User Login Page
  if (pathname === "/login") {
    if (isUserAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard/assistants", request.url));
    }
    return NextResponse.next();
  }

  // 4. Strict Protection: Without login, no page can be accessed! (Admins are also authenticated)
  if (!isUserAuthenticated && !isAdminAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 5. If logged in and visiting root landing page "/", redirect to dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard/assistants", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
