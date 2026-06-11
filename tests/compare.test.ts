import { describe, expect, it } from "vitest";
import {
  compareAlcoholContent,
  compareBrandName,
  compareClassType,
  compareNetContents,
} from "../lib/compare";

describe("comparison utilities", () => {
  it("returns Likely Match for brand name case and punctuation normalization", () => {
    const result = compareBrandName("STONE'S THROW", "Stone's Throw", 0.97);

    expect(result.category).toBe("Likely Match");
    expect(result.confidence).toBeGreaterThan(0.85);
    expect(result.notes.join(" ")).toContain("normalization");
  });

  it("returns Match for equivalent net contents formatting", () => {
    const result = compareNetContents("750 ML", "750 mL", 0.92);

    expect(result.category).toBe("Match");
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it("returns Missing when extracted class/type is empty", () => {
    const result = compareClassType("Red Wine", "", 0.7);

    expect(result.category).toBe("Missing");
    expect(result.needsHumanReview).toBe(true);
  });

  it("returns Needs Human Review for close but non-equivalent alcohol content", () => {
    const result = compareAlcoholContent("13.5% Alc/Vol", "13.0% alc vol", 0.8);

    expect(result.category).toBe("Needs Human Review");
    expect(result.needsHumanReview).toBe(true);
  });

  it("returns Mismatch for clearly different alcohol content", () => {
    const result = compareAlcoholContent("13.5% Alc/Vol", "10.0% alc vol", 0.95);

    expect(result.category).toBe("Mismatch");
    expect(result.needsHumanReview).toBe(true);
  });
});
