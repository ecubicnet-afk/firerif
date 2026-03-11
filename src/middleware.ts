import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/api/auth",
  "/api/stripe/webhook",
  "/api/setup",
];

const adminPaths = ["/admin"];

const memberPaths = [
  "/dashboard",
  "/live",
  "/courses",
  "/qa",
  "/budget",
  "/assets",
  "/vision",
  "/todos",
  "/community",
];

// API routes that require authentication
const protectedApiPaths = [
  "/api/questions",
  "/api/budget",
  "/api/assets",
  "/api/vision",
  "/api/todos",
  "/api/stripe/checkout",
  "/api/stripe/portal",
];

// API routes that require admin role
const adminApiPaths = [
  "/api/admin",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Allow static assets
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  // Protected API routes - return 401 instead of redirect
  if (pathname.startsWith("/api/")) {
    // Admin API routes
    if (adminApiPaths.some((p) => pathname.startsWith(p))) {
      if (!token) {
        return NextResponse.json({ error: "未認証" }, { status: 401 });
      }
      if (token.role !== "ADMIN") {
        return NextResponse.json({ error: "権限がありません" }, { status: 403 });
      }
      return NextResponse.next();
    }

    // Protected member API routes
    if (protectedApiPaths.some((p) => pathname.startsWith(p))) {
      if (!token) {
        return NextResponse.json({ error: "未認証" }, { status: 401 });
      }
      return NextResponse.next();
    }

    // Unknown API routes - block by default
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // No token → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin paths → check role
  if (adminPaths.some((p) => pathname.startsWith(p))) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Member paths → check subscription
  if (memberPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (
      token.subscriptionStatus !== "ACTIVE" &&
      token.subscriptionStatus !== "TRIALING"
    ) {
      return NextResponse.redirect(
        new URL("/register?resubscribe=true", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
