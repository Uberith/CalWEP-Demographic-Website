import { describe, it, expect } from "vitest";
import { formatDuration } from "../src/utils.js";

describe("formatDuration", () => {
  it("formats milliseconds into minutes and seconds", () => {
    expect(formatDuration(65000)).toBe("1 Minute and 5 Seconds");
  });
});
