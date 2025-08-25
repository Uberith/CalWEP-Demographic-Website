/**
 * Resolve the base URL for API requests based on the current hostname.
 * - cyberwiz.io domains use https://nftapi.cyberwiz.io
 * - calwep.org domains use https://api.calwep.org
 * - all other hosts (e.g. localhost) default to relative `/api` paths.
 *
 * Extend the switch below to support additional environments in the future
 * (for example, `staging.example.com`).
 */
export function resolveApiBaseUrl(hostname = window.location.hostname) {
  if (hostname.endsWith("cyberwiz.io")) return "https://nftapi.cyberwiz.io";
  if (hostname.endsWith("calwep.org")) return "https://api.calwep.org";
  // Default: use relative paths for local development.
  return "";
}

// Determine the API base once at startup and log it for diagnostics.
export const API_BASE_URL = resolveApiBaseUrl();
console.log("Resolved API_BASE_URL:", API_BASE_URL || "/api");
