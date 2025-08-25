import { buildApiUrl, fetchJsonWithDiagnostics } from "./api.js";

// Fetch the full dataset for compliance forms.
export async function fetchFullDatabase() {
  const url = buildApiUrl("/demographics", { all: 1 });
  return fetchJsonWithDiagnostics(url);
}
