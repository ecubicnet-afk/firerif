import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/api/auth",
  "/api/stripe/webhook",
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
  "/dream",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Allow API routes that need auth to handle their own auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

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
