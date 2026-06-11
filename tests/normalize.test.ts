import { describe, expect, it } from "vitest";
import {
  normalizeBrandName,
  normalizeClassType,
  parseAlcoholContent,
  parseNetContents,
} from "../lib/normalize";

describe("normalization utilities", () => {
  it("normalizes brand name punctuation and case", () => {
    expect(normalizeBrandName("STONE'S THROW")).toBe("stones throw");
    expect(normalizeBrandName("Stone's Throw")).toBe("stones throw");
  });

  it("normalizes class/type variants", () => {
    expect(normalizeClassType("Red table wine")).toBe("red wine");
  });

  it("parses alcohol content percentage", () => {
    const parsed = parseAlcoholContent("13.5% Alc/Vol");

    expect(parsed.percentValue).toBe(13.5);
    expect(parsed.normalizedDisplay).toBe("13.50% alc/vol");
  });

  it("parses net contents in milliliters", () => {
    const parsed = parseNetContents("750 mL");

    expect(parsed.milliliters).toBe(750);
    expect(parsed.normalizedDisplay).toBe("750 ml");
  });
});
