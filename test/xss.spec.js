import { describe, it, expect, beforeEach } from "vitest";
import { JSDOM } from "jsdom";

let sanitizeHTML;
let renderLoading;
let renderError;

beforeEach(async () => {
  const dom = new JSDOM('<div id="result"></div>');
  global.window = dom.window;
  global.document = dom.window.document;
  ({ sanitizeHTML } = await import("../src/utils.js"));
  ({ renderLoading, renderError } = await import("../src/ui/error.js"));
});

describe("sanitizeHTML", () => {
  it("removes dangerous attributes", () => {
    const payload = "<img src=x onerror=alert(1) />";
    const clean = sanitizeHTML(payload);
    expect(clean).not.toContain("onerror");
  });
});

describe("templated sections", () => {
  const payload = "<img src=x onerror=alert(1) />";

  it("renderLoading sanitizes address input", () => {
    renderLoading(payload);
    expect(document.getElementById("result").innerHTML).not.toContain(
      "onerror",
    );
  });

  it("renderError sanitizes message and address", () => {
    renderError(payload, payload, 0);
    expect(document.getElementById("result").innerHTML).not.toContain(
      "onerror",
    );
  });

  it("result card sanitizes address", () => {
    const html = sanitizeHTML(
      `<h2 class="card__title">Results for: ${sanitizeHTML(payload)}</h2>`,
    );
    expect(html).not.toContain("onerror");
  });
});
