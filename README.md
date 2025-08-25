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

The site uses the Google Maps JavaScript API and reads the key from the `MAPS_API_KEY` environment variable at runtime. The key is accessed on the server via `process.env.MAPS_API_KEY` and should never be committed to source control.

### Local development

1. Copy `.env.example` to `.env` and set your key:
   ```bash
   MAPS_API_KEY=your_google_maps_api_key
   ```
2. Run `npm run dev` for a development server or `npm run build` to generate static assets. The key is injected at runtime; avoid embedding it directly into the frontend.

### Production (Render, Heroku, etc.)

- Configure an environment variable named `MAPS_API_KEY` before building the site.
- Do **not** commit real keys to Git. `.env` is already ignored by `.gitignore`.

### Security considerations

- Restrict the Google Maps key to allowed domains/IPs and enable usage quotas in the Google Cloud Console.
- Monitor usage and regenerate the key if it becomes compromised.
- When frontend code needs Google Maps data, proxy the request through your server. The server can append the API key from `process.env.MAPS_API_KEY` (exposed as `databaseUrl`) so the browser never sees the secret.

## Accessing environment variables

Environment variables can be read from the local machine in many languages:

- **JavaScript**
  ```js
  const databaseUrl = process.env.MAPS_API_KEY;
  ```
- **Python**
  ```python
  import os
  database_url = os.environ.get('MAPS_API_KEY')
  ```
- **Ruby**
  ```ruby
  database_url = ENV['MAPS_API_KEY']
  ```
- **Go**

  ```go
  package main
  import "os"

  func main() {
      databaseUrl := os.Getenv("MAPS_API_KEY")
  }
  ```

- **Elixir**
  ```elixir
  database_url = System.get_env("MAPS_API_KEY")
  ```
