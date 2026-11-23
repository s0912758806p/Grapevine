import "server-only";

/**
 * Member session: an encrypted (JWE, A256GCM) httpOnly cookie holding the
 * member's public profile and their GitHub App user-to-server tokens.
 *
 * - `getViewer()` returns only display fields and never refreshes tokens, so it
 *   is safe to call while rendering (inside a <Suspense> boundary).
 * - `getWriteSession()` is for Server Actions / Route Handlers: it refreshes an
 *   expiring access token and rewrites the cookie.
 */
import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import { githubApp } from "./config";
import { refreshAccessToken, type TokenSet } from "./github/oauth";

export const SESSION_COOKIE = "gv_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // refresh tokens last ~6 months; re-login monthly

export interface Viewer {
  login: string;
  name: string;
  avatarUrl: string;
}

interface SessionPayload extends Viewer, TokenSet {}

async function key(): Promise<Uint8Array | null> {
  const app = githubApp();
  if (!app) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(app.sessionSecret));
  return new Uint8Array(digest);
}

export async function sealSession(payload: SessionPayload): Promise<string> {
  const k = await key();
  if (!k) throw new Error("GitHub sign-in is not configured");
  return new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .encrypt(k);
}

async function unseal(value: string): Promise<SessionPayload | null> {
  const k = await key();
  if (!k) return null;
  try {
    const { payload } = await jwtDecrypt(value, k);
    if (typeof payload.login !== "string" || typeof payload.accessToken !== "string") return null;
    return payload as unknown as SessionPayload;
  } catch {
    return null; // tampered, expired, or encrypted with an old secret
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};

export async function getViewer(): Promise<Viewer | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const session = await unseal(raw);
  if (!session) return null;
  return { login: session.login, name: session.name, avatarUrl: session.avatarUrl };
}

export type WriteSession = { viewer: Viewer; accessToken: string } | { error: "signed-out" | "expired" };

/** Returns a usable access token, refreshing it (and the cookie) when it is about to expire. */
export async function getWriteSession(): Promise<WriteSession> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  const session = raw ? await unseal(raw) : null;
  if (!session) return { error: "signed-out" };

  const viewer = { login: session.login, name: session.name, avatarUrl: session.avatarUrl };
  const now = Date.now();
  if (session.accessTokenExpiresAt - now > 5 * 60_000) return { viewer, accessToken: session.accessToken };

  if (!session.refreshToken || session.refreshTokenExpiresAt <= now) {
    store.delete(SESSION_COOKIE);
    return { error: "expired" };
  }
  try {
    const tokens = await refreshAccessToken(session.refreshToken);
    store.set(SESSION_COOKIE, await sealSession({ ...viewer, ...tokens }), sessionCookieOptions);
    return { viewer, accessToken: tokens.accessToken };
  } catch {
    store.delete(SESSION_COOKIE);
    return { error: "expired" };
  }
}
