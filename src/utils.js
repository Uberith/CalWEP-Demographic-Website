export function escapeHTML(str = "") {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
