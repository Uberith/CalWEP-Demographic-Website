import createDOMPurify from "dompurify";

export function sanitizeHTML(str = "") {
  if (str === null || str === undefined) return "";
  const purifier = createDOMPurify(window);
  return purifier.sanitize(String(str));
}

export function nowStamp() {
  return new Date().toLocaleString();
}

export function formatDuration(ms = 0) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mLabel = minutes === 1 ? "Minute" : "Minutes";
  const sLabel = seconds === 1 ? "Second" : "Seconds";
  return `${minutes} ${mLabel} and ${seconds} ${sLabel}`;
}

export function deepMerge(target = {}, ...sources) {
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  for (const src of sources) {
    if (!isObj(src)) continue;
    for (const [key, val] of Object.entries(src)) {
      if (isObj(val)) {
        target[key] = deepMerge(isObj(target[key]) ? target[key] : {}, val);
      } else {
        target[key] = val;
      }
    }
  }
  return target;
}
