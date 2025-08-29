CalWEP Community Insights Tool

A lightweight, static web app for exploring community demographics, language needs, and environmental indicators for locations in California.

This repo contains the static site, a minimal CORS/proxy server for local development, and optional mobile wrappers.

Getting Started
- Open `index.html` directly in your browser, or serve the folder with a static server: `npx http-server .`
- The app points API requests to `https://api.calwep.org` via the `<meta name="api-base">` tag in `index.html`.

Development Options
- Static only:
  - `npx http-server .`
  - Uses production API at `https://api.calwep.org`.
- Dev server (static + proxy):
  - `node dev-server.js`
  - Proxies common routes (`/api`, `/demographics`, `/lookup`, `/census-tracts`) to an upstream API base.
  - Env vars: `PORT` (default 5173), `STATIC_DIR` (default `.`), `API_BASE` (default `https://api.calwep.org`), `ALLOW_ORIGINS` (hostnames or regex).
- Simple CORS proxy:
  - Install once if needed: `npm init -y && npm i express`
  - Run: `node server.js` (proxies everything to `https://api.calwep.org`)
  - Env vars: `PORT` (default 3000), `ALLOW_ORIGINS` (hostnames or regex)

Configuration
- API base:
  - Frontend reads from `<meta name="api-base">` in `index.html`.
  - `dev-server.js` injects/re-writes this tag to the dev origin for local proxying.
  - For production, keep it set to `https://api.calwep.org`.
- Keys and secrets:
  - `config.js` holds frontend config like `GOOGLE_MAPS_KEY`.
  - Do not commit real secrets. Prefer environment variables and server-side injection in production.

Project Structure
- Root: `index.html`, `style.css`, `script.js`, `config.js`.
- Servers: `dev-server.js` (dev static + proxy), `server.js` (simple CORS proxy).
- Mobile wrappers: `android/`, `ios/`.
- No build step; static assets are served directly.

Commands
- Static site: open `index.html` or `npx http-server .`
- Dev server: `node dev-server.js`
- CORS proxy: `node server.js`

Testing
- No formal test suite yet.
- If adding tests: place under `tests/` as `*.spec.js` (Jest for utilities; consider Playwright for basic UI flows).

Security & Deployment Notes
- CORS: update allowed origins when deploying to new domains (`ALLOW_ORIGINS` for dev/proxy). The production API enforces its own CORS.
- Secrets: avoid committing API keys; prefer env vars and server-side injection.
- External calls: the app also queries public data sources (e.g., Census, ArcGIS). These are not proxied through `api.calwep.org` unless required by your deployment.

Troubleshooting
- API errors: ensure `<meta name="api-base">` matches your environment, or run `dev-server.js` so the tag is injected to the local origin.
- CORS issues: add your dev hostname to `ALLOW_ORIGINS` and restart; check browser network logs for details.
- Maps not loading: confirm `GOOGLE_MAPS_KEY` is valid in `config.js` and that your domain is allowed in Google Cloud console.

