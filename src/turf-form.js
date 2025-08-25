import { fetchFullDatabase } from "./database.js";
import { renderError } from "./ui/error.js";

async function init() {
  const out = document.getElementById("databaseDump");
  try {
    const data = await fetchFullDatabase();
    out.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    renderError(err.message, "", 0);
  }
}

window.addEventListener("DOMContentLoaded", init);
