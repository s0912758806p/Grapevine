import "server-only";

/**
 * GitHub App user authorization (web application flow).
 * https://docs.github.com/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app
 *
 * A GitHub App needs no OAuth scopes: the member's token can only do what the
 * App's permissions allow (Discussions: read & write) on repos where the App is
 * installed, i.e. the forum repo. Tokens expire after 8 hours and are refreshed
 * with the refresh token (valid ~6 months) when token expiration is enabled.
 */
import { githubApp, SITE_URL } from "../config";

export interface TokenSet {
  accessToken: string;
  /** Epoch ms. Far future when the App has token expiration disabled. */
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number;
}

export const CALLBACK_PATH = "/api/auth/callback";
const NEVER = Date.UTC(2100, 0, 1);

function requireApp() {
  const app = githubApp();
  if (!app) throw new Error("GitHub sign-in is not configured (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SESSION_SECRET)");
  return app;
}

export function authorizeUrl(state: string, origin = SITE_URL): string {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", requireApp().clientId);
  url.searchParams.set("redirect_uri", `${origin}${CALLBACK_PATH}`);
  url.searchParams.set("state", state);
  url.searchParams.set("allow_signup", "true");
  return url.toString();
}

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  error?: string;
  error_description?: string;
}

export function toTokenSet(json: TokenResponse, now = Date.now()): TokenSet {
  if (!json.access_token) throw new Error(json.error_description ?? json.error ?? "GitHub returned no access token");
  return {
    accessToken: json.access_token,
    accessTokenExpiresAt: json.expires_in ? now + json.expires_in * 1000 : NEVER,
    refreshToken: json.refresh_token ?? "",
    refreshTokenExpiresAt: json.refresh_token_expires_in ? now + json.refresh_token_expires_in * 1000 : json.refresh_token ? NEVER : 0,
  };
}

async function tokenRequest(params: Record<string, string>): Promise<TokenSet> {
  const { clientId, clientSecret } = requireApp();
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, ...params }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub token endpoint returned ${res.status}`);
  return toTokenSet((await res.json()) as TokenResponse);
}

export function exchangeCode(code: string, origin = SITE_URL): Promise<TokenSet> {
  return tokenRequest({ code, redirect_uri: `${origin}${CALLBACK_PATH}` });
}

export function refreshAccessToken(refreshToken: string): Promise<TokenSet> {
  return tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken });
}

export async function fetchGitHubUser(accessToken: string): Promise<{ login: string; name: string; avatarUrl: string }> {
  const res = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub /user returned ${res.status}`);
  const user = (await res.json()) as { login: string; name: string | null; avatar_url: string };
  return { login: user.login, name: user.name || user.login, avatarUrl: user.avatar_url };
}
