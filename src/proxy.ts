import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Proxy always runs on the Node.js runtime (unlike the old "middleware"
// convention, which defaulted to Edge) — that's what lets `auth`'s
// jwt/session callbacks hit Prisma via the pg driver adapter.
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;
  const isLoginPage = path.startsWith("/login");

  if (path === "/") {
    return NextResponse.redirect(new URL(isLoggedIn ? "/dashboard" : "/login", req.nextUrl));
  }
  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
