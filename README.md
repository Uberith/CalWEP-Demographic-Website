# CalWEP Demographic Website

This project helps water agency staff explore neighborhood-level demographics and environmental conditions.

## Accessibility

- Semantic landmarks with `<header>`, `<nav>`, `<main>`, and `<footer>` improve screen reader navigation.
- A skip link allows keyboard users to jump directly to the main content.
- Automated audits:
  - `node run-axe.js` outputs `axe-report.json` using axe-core.
  - Serve the site locally (`npx http-server -p 8080`) and run `npx lighthouse http://localhost:8080/index.html --chrome-flags="--no-sandbox --headless" --output=json --output-path=lighthouse-report.json`.
- These audits verify color contrast, keyboard navigation, and ARIA usage per WCAG 2.1.

## Google Maps API Key

The site uses the Google Maps JavaScript API and loads the key from an environment variable.

### Local development

1. Copy `.env.example` to `.env` and set your key:
   ```bash
   MAPS_API_KEY=your_google_maps_api_key
   ```
2. The server loads this file via [dotenv](https://www.npmjs.com/package/dotenv). The key is exposed to the frontend at `/api/maps-key`.
3. Start the development server with `npm start`.

### Production (Render, Heroku, etc.)

- In your hosting provider's dashboard, add an environment variable named `MAPS_API_KEY` with your key. The variable is available to the server at runtime; no `.env` file is needed.
- Do **not** commit real keys to Git. `.env` is already ignored by `.gitignore`.

### Security considerations

- Restrict the Google Maps key to allowed domains/IPs and enable usage quotas in the Google Cloud Console.
- Monitor usage and regenerate the key if it becomes compromised.
