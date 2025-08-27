# Repository Guidelines

## Project Structure & Module Organization
- Root app: `index.html`, `style.css`, `script.js`, `config.js`.
- CORS proxy: `server.js` (Express) for API requests to `https://nftapi.cyberwiz.io`.
- Mobile wrappers: `android/` and `ios/` directories for platform-specific builds.
- No separate build output; static assets are served directly.

## Build, Test, and Development Commands
- Run static site: open `index.html` in a browser or `npx http-server .`.
- Start CORS proxy: `node server.js` (requires Node 18+). If needed, install: `npm init -y && npm i express`.
- Configure keys: set values in `config.js` (e.g., `GOOGLE_MAPS_KEY`). Avoid committing secrets; prefer env vars for production.

## Coding Style & Naming Conventions
- JavaScript: 2-space indent, semicolons, `camelCase` for variables/functions, `UPPER_SNAKE_CASE` for constants.
- HTML/CSS: use `kebab-case` for ids/classes; keep inline scripts minimal—put logic in `script.js`.
- Patterns: keep functions small and pure where possible; prefer `const`/`let` over `var`.

## Testing Guidelines
- Current state: no formal test suite.
- If adding tests: place under `tests/`; name `*.spec.js`. Use Jest for utilities in `script.js`; consider Playwright for basic UI flows.

## Commit & Pull Request Guidelines
- Commits: prefer Conventional Commits (e.g., `feat:`, `fix:`, `chore:`) as seen in history; use imperative, concise subjects.
- PRs: include a clear description, linked issues, reproduction steps, and screenshots/gifs for UI changes. Call out changes to API endpoints, CORS, or config.

## Security & Configuration Tips
- Secrets: do not commit API keys. Use environment variables and inject via server or CI. Review `config.js` before pushing.
- CORS: update `ALLOWED_ORIGINS` in `server.js` when deploying to new domains.
- External calls: `script.js` reads API base from `<meta name="api-base">`; ensure it matches your environment.

