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

The site uses the Google Maps JavaScript API and reads the key from the `VITE_MAPS_API_KEY` environment variable at build time.

### Local development

1. Copy `.env.example` to `.env` and set your key:
   ```bash
   VITE_MAPS_API_KEY=your_google_maps_api_key
   ```
2. Run `npm run dev` for a development server or `npm run build` to generate static assets. The key is embedded directly into the frontend.

### Production (Render, Heroku, etc.)

- Configure an environment variable named `VITE_MAPS_API_KEY` before building the site.
- Do **not** commit real keys to Git. `.env` is already ignored by `.gitignore`.

### Security considerations

- Restrict the Google Maps key to allowed domains/IPs and enable usage quotas in the Google Cloud Console.
- Monitor usage and regenerate the key if it becomes compromised.

## Accessing environment variables

Environment variables can be read from the local machine in many languages:

- **JavaScript**
  ```js
  const databaseUrl = process.env.DATABASE_URL;
  ```
- **Python**
  ```python
  import os
  database_url = os.environ.get('DATABASE_URL')
  ```
- **Ruby**
  ```ruby
  database_url = ENV['DATABASE_URL']
  ```
- **Go**

  ```go
  package main
  import "os"

  func main() {
      databaseURL := os.Getenv("DATABASE_URL")
  }
  ```

- **Elixir**
  ```elixir
  database_url = System.get_env("DATABASE_URL")
  ```
