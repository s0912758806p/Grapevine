/**
 * GET /api/auth/login?returnTo=/t/123 — starts GitHub App sign-in.
 * Stores a random `state` (CSRF protection) and the return path in a
 * short-lived httpOnly cookie, then redirects to GitHub.
 */
import { NextResponse, type NextRequest } from "next/server";
import { githubApp } from "@/lib/config";
import { authorizeUrl } from "@/lib/github/oauth";
import { safeReturnTo } from "@/lib/github/return-to";

const OAUTH_COOKIE = "gv_oauth";

export async function GET(request: NextRequest) {
  if (!githubApp()) return NextResponse.redirect(new URL("/login?error=not-configured", request.url));
  const state = Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString("base64url");
  const returnTo = safeReturnTo(request.nextUrl.searchParams.get("returnTo"));
  const res = NextResponse.redirect(authorizeUrl(state));
  res.cookies.set(OAUTH_COOKIE, JSON.stringify({ state, returnTo }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 600,
  });
  return res;
}
