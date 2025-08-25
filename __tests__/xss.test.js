const createDOMPurify = require('dompurify');

let renderLoading, renderError, renderResult;

describe('XSS sanitization', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '<div id="result"></div>';
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
    const { window } = global;
    global.DOMPurify = createDOMPurify(window);
    ({ renderLoading, renderError, renderResult } = require('../script.js'));
  });

  test('renderLoading sanitizes address', () => {
    const payload = '<img src=x onerror=alert(1) />';
    renderLoading(payload);
    const html = document.getElementById('result').innerHTML;
    expect(html).not.toMatch(/onerror/);
    expect(html).not.toMatch(/<img/);
  });

  test('renderError sanitizes message and address', () => {
    const payload = '<img src=x onerror=alert(1) />';
    renderError(payload, payload, 0);
    const html = document.getElementById('result').innerHTML;
    expect(html).not.toMatch(/onerror/);
    expect(html).not.toMatch(/<img/);
  });

  test('renderResult sanitizes dynamic fields', () => {
    const payload = '<img src=x onerror=alert(1) />';
    renderResult(payload, {
      city: payload,
      census_tract: payload,
      zip: payload,
      county: payload,
      environmental_hardships: [payload],
      alerts: [payload],
    }, 0);
    const html = document.getElementById('result').innerHTML;
    expect(html).not.toMatch(/onerror/);
    expect(html).not.toMatch(/<img/);
  });
});
