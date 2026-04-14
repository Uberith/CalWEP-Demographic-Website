const {
  buildAgencyDisplayData,
  formatRebateSqftLabel,
  parseSqftValuesFromDescription,
} = require("../agency-utils");

describe("agency rebate normalization", () => {
  test("prefers structured sqft values for EBMUD", () => {
    const agency = {
      display_name: "East Bay Mud",
      agency_name: "East Bay Municipal Utility District",
      rebate_description:
        "Standard lawn conversion rebate is $1.00/sq. ft. Super rebate is $2.00 sq. ft. $15,000 every two years for commercial properties.",
      rebate_sqft_values: [1.0, 2.0],
      rebate_sqft_min: 1.0,
      rebate_sqft_max: 2.0,
      has_commercial_rebate: true,
    };

    expect(buildAgencyDisplayData(agency)).toMatchObject({
      name: "East Bay Mud",
      rebate_sqft_values: [1, 2],
      rebate_sqft_min: 1,
      rebate_sqft_max: 2,
      rebate_sqft_label: "$1-$2/sq ft",
      has_commercial_rebate: true,
    });
  });

  test("parses sqft amounts from description without reading dollar caps as sqft", () => {
    const description =
      "Standard lawn conversion rebate is $1.00/sq. ft. Super rebate is $2.00 sq. ft. $15,000 every two years for commercial properties.";

    expect(parseSqftValuesFromDescription(description)).toEqual([1, 2]);
    expect(formatRebateSqftLabel({ rebate_description: description })).toBe("$1-$2/sq ft");
  });

  test("does not invent a sqft amount from non-sqft dollar caps", () => {
    const description = "Commercial properties are capped at $15,000 every two years.";

    expect(parseSqftValuesFromDescription(description)).toEqual([]);
    expect(formatRebateSqftLabel({ rebate_description: description })).toBe("");
  });
});
