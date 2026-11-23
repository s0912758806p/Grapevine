import "server-only";

/** Minimal GitHub GraphQL / REST client. Tokens are always passed in, never read from the client. */

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

const HEADERS = { "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "grapevine-forum" };

export async function graphql<T>(query: string, variables: Record<string, unknown>, token: string): Promise<T> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...HEADERS, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) throw new GitHubError(`GitHub GraphQL returned ${res.status}`, res.status);
  const json = (await res.json()) as { data?: T; errors?: { message: string; type?: string }[] };
  if (json.errors?.length) {
    const forbidden = json.errors.some((e) => e.type === "FORBIDDEN");
    throw new GitHubError(json.errors.map((e) => e.message).join("; "), forbidden ? 403 : undefined);
  }
  if (!json.data) throw new GitHubError("GitHub GraphQL returned no data");
  return json.data;
}

export async function rest<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { ...HEADERS, Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: "no-store",
  });
  if (res.status === 404) throw new GitHubError("Not found", 404);
  if (!res.ok) throw new GitHubError(`GitHub REST ${path} returned ${res.status}`, res.status);
  return (await res.json()) as T;
}
