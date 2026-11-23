/**
 * Only same-site relative paths are allowed as post-login destinations, so the
 * sign-in flow can't be turned into an open redirect.
 */
export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  if (value.startsWith("/api/") || value === "/login") return "/";
  return value;
}
