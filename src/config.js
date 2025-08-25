/**
 * Resolve the base URL for API requests based on the current hostname.
 *
 * - Any domain containing "cyberwiz.io" uses https://nftapi.cyberwiz.io
 * - Any domain containing "calwep.org" uses https://api.calwep.org
 * - All other hosts fall back to DEFAULT_API_BASE (currently CyberWiz).
 *
 * To support additional deployment environments, extend DOMAIN_API_MAP
 * with new entries (e.g. { "staging.example.com": "https://api.example.com" }).
 */

// Change this constant if a different default backend should be used.
const DEFAULT_API_BASE = "https://nftapi.cyberwiz.io";

// Map partial hostnames to their corresponding API bases.
const DOMAIN_API_MAP = {
  "cyberwiz.io": "https://nftapi.cyberwiz.io",
  "calwep.org": "https://api.calwep.org",
};

export function resolveApiBaseUrl(hostname = window.location.hostname) {
  for (const [domain, api] of Object.entries(DOMAIN_API_MAP)) {
    if (hostname.includes(domain)) return api;
  }
  return DEFAULT_API_BASE;
}

// Determine the API base once at startup and log it for diagnostics.
export const API_BASE_URL = resolveApiBaseUrl();
console.log("Resolved API_BASE_URL:", API_BASE_URL);
