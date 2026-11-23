/**
 * GET /api/auth/callback — GitHub redirects here after the member approves.
 * Verifies `state`, exchanges the code for user tokens, loads the profile and
 * stores everything in the encrypted session cookie.
 */
import { NextResponse, type NextRequest } from "next/server";
import { exchangeCode, fetchGitHubUser } from "@/lib/github/oauth";
import { safeReturnTo } from "@/lib/github/return-to";
import { SESSION_COOKIE, sealSession, sessionCookieOptions } from "@/lib/session";

const OAUTH_COOKIE = "gv_oauth";

function fail(request: NextRequest, reason: string) {
  const res = NextResponse.redirect(new URL(`/login?error=${reason}`, request.url));
  res.cookies.delete({ name: OAUTH_COOKIE, path: "/api/auth" });
  return res;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (params.get("error")) return fail(request, "denied");

  let saved: { state?: string; returnTo?: string } = {};
  try {
    saved = JSON.parse(request.cookies.get(OAUTH_COOKIE)?.value ?? "{}");
  } catch {
    return fail(request, "state");
  }
  const code = params.get("code");
  if (!code || !saved.state || params.get("state") !== saved.state) return fail(request, "state");

  try {
    const tokens = await exchangeCode(code);
    const user = await fetchGitHubUser(tokens.accessToken);
    const res = NextResponse.redirect(new URL(safeReturnTo(saved.returnTo), request.url));
    res.cookies.set(SESSION_COOKIE, await sealSession({ ...user, ...tokens }), sessionCookieOptions);
    res.cookies.delete({ name: OAUTH_COOKIE, path: "/api/auth" });
    return res;
  } catch (err) {
    console.error("GitHub sign-in failed:", err instanceof Error ? err.message : err);
    return fail(request, "github");
  }
}
