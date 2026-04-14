(function initAgencyUtils(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.AgencyUtils = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function agencyUtilsFactory() {
  function toPositiveNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) && num > 0 ? num : null;
  }

  function compactMoney(value) {
    if (!Number.isFinite(value)) return "";
    const trimmed = Number(value).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
    return `$${trimmed}`;
  }

  function normalizeSqftValues(values) {
    if (!Array.isArray(values)) return [];
    const normalized = values
      .map((value) => toPositiveNumber(value))
      .filter((value) => value != null)
      .map((value) => Number(value.toFixed(2)));
    return Array.from(new Set(normalized)).sort((a, b) => a - b);
  }

  function parseSqftValuesFromDescription(description = "") {
    const values = [];
    const source = String(description);
    const regex =
      /\$?\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)\s*(?:(?:\/|per\s+)?sq\.?\s*(?:ft|feet)\.?|square\s+foot(?:age)?)/gi;
    let match = regex.exec(source);
    while (match) {
      const parsed = toPositiveNumber(String(match[1]).replace(/,/g, ""));
      if (parsed != null) {
        values.push(Number(parsed.toFixed(2)));
      }
      match = regex.exec(source);
    }
    return Array.from(new Set(values)).sort((a, b) => a - b);
  }

  function deriveSqftValues(agency = {}) {
    const structured = normalizeSqftValues(agency.rebate_sqft_values);
    if (structured.length) return structured;

    const min = toPositiveNumber(agency.rebate_sqft_min);
    const max = toPositiveNumber(agency.rebate_sqft_max);
    if (min != null || max != null) {
      return Array.from(new Set([min, max].filter((value) => value != null))).sort((a, b) => a - b);
    }

    return parseSqftValuesFromDescription(agency.rebate_description);
  }

  function formatRebateSqftLabel(agency = {}) {
    const values = deriveSqftValues(agency);
    if (!values.length) return "";
    if (values.length === 1) return `${compactMoney(values[0])}/sq ft`;
    return `${compactMoney(values[0])}-${compactMoney(values[values.length - 1])}/sq ft`;
  }

  function buildAgencyDisplayData(agency = {}) {
    const rebateSqftValues = deriveSqftValues(agency);
    const rebateSqftMin =
      toPositiveNumber(agency.rebate_sqft_min) ??
      (rebateSqftValues.length ? rebateSqftValues[0] : null);
    const rebateSqftMax =
      toPositiveNumber(agency.rebate_sqft_max) ??
      (rebateSqftValues.length ? rebateSqftValues[rebateSqftValues.length - 1] : null);

    return {
      name: agency.display_name || agency.agency_name || agency.name || "",
      display_name: agency.display_name || "",
      agency_name: agency.agency_name || agency.name || "",
      nft_policy: agency.nft_policy || "",
      rebate_url: agency.rebate_url || "",
      rebate_description: agency.rebate_description || "",
      rebate_sqft_values: rebateSqftValues,
      rebate_sqft_min: rebateSqftMin,
      rebate_sqft_max: rebateSqftMax,
      rebate_sqft_label: formatRebateSqftLabel({
        ...agency,
        rebate_sqft_values: rebateSqftValues,
        rebate_sqft_min: rebateSqftMin,
        rebate_sqft_max: rebateSqftMax,
      }),
      has_commercial_rebate:
        typeof agency.has_commercial_rebate === "boolean"
          ? agency.has_commercial_rebate
          : null,
    };
  }

  return {
    buildAgencyDisplayData,
    formatRebateSqftLabel,
    parseSqftValuesFromDescription,
  };
});
