# Comparison Engine Audit

Date: 2026-06-11

References reviewed:
- [docs/AI_AGENT_GUIDE.md](docs/AI_AGENT_GUIDE.md)
- [README.md](README.md)
- [docs/PRD.md](docs/PRD.md)

Code reviewed:
- [lib/compare.ts](lib/compare.ts)
- [lib/normalize.ts](lib/normalize.ts)
- [utils/comparison.ts](utils/comparison.ts)
- [utils/normalization.ts](utils/normalization.ts)
- [app/page.tsx](app/page.tsx)
- [app/api/extract/route.ts](app/api/extract/route.ts)
- [components/ResultsPanel.tsx](components/ResultsPanel.tsx)
- [components/WarningValidationCard.tsx](components/WarningValidationCard.tsx)
- [data/mockData.ts](data/mockData.ts)
- [types/label.ts](types/label.ts)

Validation run:
- npm run test -> 9/9 tests passed

## 1) Full Data Flow Trace

```mermaid
flowchart TD
  A[ApplicationForm values] --> B[app/page.tsx: applicationData state]
  C[Image upload] --> D[app/api/extract/route.ts POST]
  D --> E[sanitizeExtractedPayload -> ExtractedFieldMap]
  E --> F[app/page.tsx toExtractedFieldMap]
  F --> G[buildAnalysisOutput in lib/compare.ts]
  B --> G
  H[MOCK_EXTRACTED_FIELDS fallback] --> G

  G --> I[Field normalization in lib/normalize.ts]
  G --> J[Field-specific comparators in lib/compare.ts]
  J --> K[ComparisonResult[] categories + confidence + reasons]
  G --> L[validateGovernmentWarning]
  G --> M[AnalysisOutput]

  M --> N[components/ResultsPanel.tsx]
  N --> O[Comparison table rows]
  N --> P[Reason cards + normalized values]
  N --> Q[WarningValidationCard]
```

### Observed control points
- Extraction map build in UI: [app/page.tsx](app/page.tsx#L30)
- Analysis entrypoint: [lib/compare.ts](lib/compare.ts#L414)
- Warning validation split path: [lib/compare.ts](lib/compare.ts#L379), [lib/compare.ts](lib/compare.ts#L449)
- Warning removed from main table: [components/ResultsPanel.tsx](components/ResultsPanel.tsx#L59)

## 2) Comparison Correctness by Result Type

## Match
Rules observed:
- Brand: exact raw string equality only: [lib/compare.ts](lib/compare.ts#L117)
- Class/type: normalized values equal: [lib/compare.ts](lib/compare.ts#L161)
- Alcohol: parsed numeric delta <= 0.05: [lib/compare.ts](lib/compare.ts#L194)
- Net contents: parsed ml delta <= 1: [lib/compare.ts](lib/compare.ts#L256)
- Government warning (comparison row only): normalized warning text equal: [lib/compare.ts](lib/compare.ts#L314)

## Likely Match
Rules observed:
- Generic similarity path when similarity >= 0.9: [lib/compare.ts](lib/compare.ts#L80)
- Brand normalization equality (case/punctuation): [lib/compare.ts](lib/compare.ts#L128)
- Alcohol numeric delta <= 0.25: [lib/compare.ts](lib/compare.ts#L203)
- Net contents ml delta <= 5: [lib/compare.ts](lib/compare.ts#L268)

## Mismatch
Rules observed:
- Generic similarity path for similarity < 0.72: [lib/compare.ts](lib/compare.ts#L99)
- Alcohol numeric delta > 0.5: [lib/compare.ts](lib/compare.ts#L222)
- Net contents ml delta > 15: [lib/compare.ts](lib/compare.ts#L287)
- Government warning comparison row: strict normalized inequality: [lib/compare.ts](lib/compare.ts#L314)

## Missing
Rules observed:
- Both values blank -> Missing: [lib/compare.ts](lib/compare.ts#L41)
- Extracted blank -> Missing: [lib/compare.ts](lib/compare.ts#L50)

## Needs Human Review
Rules observed:
- Application blank but extracted present: [lib/compare.ts](lib/compare.ts#L59)
- Generic similarity in [0.72, 0.9): [lib/compare.ts](lib/compare.ts#L89)
- Alcohol numeric delta <= 0.5 and > 0.25: [lib/compare.ts](lib/compare.ts#L212)
- Net contents ml delta <= 15 and > 5: [lib/compare.ts](lib/compare.ts#L277)

### Edge case observations
- Government warning comparison path does not emit Missing or Needs Human Review categories; only Match/Mismatch.
- Similarity path is token overlap only; phrase-order and synonym differences can degrade unexpectedly.

## 3) Field-by-Field Behavior Verification

## Brand Name
Path:
- normalizeBrandName: [lib/normalize.ts](lib/normalize.ts#L25)
- compareBrandName: [lib/compare.ts](lib/compare.ts#L107)

Behavior:
- Exact raw equality -> Match
- Normalized equality -> Likely Match
- Else token similarity thresholds

Assessment:
- Works for punctuation/case variants.
- Aligns with PRD examples for likely-match behavior.

## Class/Type Designation
Path:
- normalizeClassType removes table, maps vin -> wine: [lib/normalize.ts](lib/normalize.ts#L35)
- compareClassType: [lib/compare.ts](lib/compare.ts#L148)

Behavior:
- Normalized equality -> Match
- Else similarity thresholds

Assessment:
- Good baseline for minor wording variations.
- Token synonyms beyond current replacements are not handled.

## Alcohol Content
Path:
- parseAlcoholContent: [lib/normalize.ts](lib/normalize.ts#L53)
- compareAlcoholContent: [lib/compare.ts](lib/compare.ts#L182)

Behavior:
- Numeric parse first; compare by delta thresholds.
- Fallback to normalized text similarity if parse fails.

Assessment:
- Correct for typical ABV strings.
- Tolerance thresholds are explicit and deterministic.

## Net Contents
Path:
- parseNetContents: [lib/normalize.ts](lib/normalize.ts#L75)
- compareNetContents: [lib/compare.ts](lib/compare.ts#L244)

Behavior:
- Unit parse to ml (L, mL, oz/fl oz).
- Compare ml delta thresholds.
- Fallback to text similarity on parse failure.

Assessment:
- Correct for common container formats.

## Producer/Bottler Name
Path:
- Generic normalization + generic similarity in compareSingleField default path: [lib/compare.ts](lib/compare.ts#L356)

Behavior:
- No field-specific comparator.
- Uses token overlap thresholds only.

Assessment:
- Works for many punctuation/casing edits.
- May misclassify near matches where legal entity tokens differ in meaningful ways.

## Country Of Origin
Path:
- Generic normalization + generic similarity in compareSingleField default path: [lib/compare.ts](lib/compare.ts#L356)

Behavior:
- No country synonym/canonical mapping.

Assessment:
- High risk of false mismatch for equivalents like USA vs United States.

## Government Warning
Paths:
- Comparison row logic: [lib/compare.ts](lib/compare.ts#L314)
- Dedicated validator: [lib/compare.ts](lib/compare.ts#L379)
- UI card: [components/WarningValidationCard.tsx](components/WarningValidationCard.tsx#L7)

Behavior:
- Separate pass/fail validator checks:
1. normalized text equality between application and extracted values
2. uppercase heading presence in extracted text via regex GOVERNMENT WARNING

Assessment:
- Separation is implemented correctly.
- Validation does not compare against the statutory required warning text, only against user-entered application content.

## 4) Normalization Behavior Verification

Sample checks requested:

1. STONE'S THROW vs Stone's Throw
- normalizeBrandName strips apostrophes and lowercases.
- Both normalize to stones throw.
- compareBrandName yields Likely Match (not Match unless raw strings are exactly equal).
- Status is consistent with current code and PRD likely-match interpretation.

2. 750 ML vs 750mL
- parseNetContents recognizes numeric + unit with optional space.
- Both parse to 750 ml.
- compareNetContents returns Match.

3. 13.5% Alc/Vol vs 13.5% ALC VOL
- parseAlcoholContent matches percent first in both cases.
- Both parse to 13.5.
- compareAlcoholContent returns Match by delta threshold.

Conclusion: these normalization cases behave correctly under implemented rules.

## 5) Confidence Behavior Verification

Where confidence originates:
- From extraction payload confidence in route sanitation: [app/api/extract/route.ts](app/api/extract/route.ts#L43)
- Re-validated in UI mapping: [app/page.tsx](app/page.tsx#L30)
- Mock fallback confidence from fixture: [data/mockData.ts](data/mockData.ts#L24)

How confidence is used:
- Confidence value is used to compute displayed confidence score formulas in comparator outcomes.
- Confidence does not directly choose category thresholds for most fields.
- Category is primarily value-difference based (exact/normalized/similarity/delta).
- Exception: missing-path confidence scaling changes score only, not category branch itself.

UI behavior:
- Confidence is displayed as percentage chips: [components/ResultsPanel.tsx](components/ResultsPanel.tsx#L132)
- Warning card also displays confidence percentage: [components/WarningValidationCard.tsx](components/WarningValidationCard.tsx#L30)

Judgment:
- Confidence is mostly a display/explanatory score, not a decision gate.
- This partially diverges from PRD wording for Needs Human Review as confidence-insufficient classification.

## 6) Findings and Bugs

Severity: High
1. Government warning can Pass without verifying statutory required text.
- Evidence: validator compares application warning text against extracted warning text, not against canonical legal warning text: [lib/compare.ts](lib/compare.ts#L384)
- Risk: user-entered incorrect warning could still pass if extraction matches that same incorrect text.

2. Country equivalent names are not normalized (USA vs United States).
- Evidence: country uses generic similarity path with no country-specific canonicalization: [lib/compare.ts](lib/compare.ts#L356)
- Risk: false mismatches on common equivalents.

Severity: Medium
3. PRD intent for Needs Human Review driven by low confidence is not explicitly implemented.
- Evidence: no branch like if confidence < threshold then Needs Human Review.
- Risk: low-confidence extraction can still be categorized Match/Likely Match without automatic review flag.

4. Uppercase heading check is looser than PRD statement.
- Evidence: regex checks GOVERNMENT WARNING but not mandatory colon formatting GOVERNMENT WARNING: [lib/compare.ts](lib/compare.ts#L389)
- Risk: may pass heading formatting that PRD implies should fail.

5. Dual sanitization/mapping logic can drift.
- Evidence: sanitizeExtractedPayload in API and toExtractedFieldMap in page duplicate contract handling: [app/api/extract/route.ts](app/api/extract/route.ts#L43), [app/page.tsx](app/page.tsx#L30)
- Risk: inconsistent normalization/trim/confidence handling over time.

Severity: Low
6. Results loading copy says running mock extraction even when real extraction is used.
- Evidence: [components/ResultsPanel.tsx](components/ResultsPanel.tsx#L76)
- Risk: user confusion only.

7. Compatibility wrappers exist and are minimal pass-throughs.
- Evidence: [utils/comparison.ts](utils/comparison.ts), [utils/normalization.ts](utils/normalization.ts), [components/UploadForm.tsx](components/UploadForm.tsx), [components/WarningCheckCard.tsx](components/WarningCheckCard.tsx)
- Risk: low; mostly harmless compatibility layer, but contributes mild duplication surface.

## 7) Recommended Fixes

1. Add canonical government warning source text and validate extracted warning against that canonical text (not user input alone).
2. Add country canonicalization map (for example usa, u.s.a., united states -> united states) in normalization and use field-specific country comparator.
3. Introduce confidence guardrails that force Needs Human Review below a configurable threshold.
4. Tighten heading check to enforce uppercase GOVERNMENT WARNING: including colon when required.
5. Consolidate extraction payload sanitation into one shared utility used by both route and page.
6. Update loading text to extraction in progress wording not mock-specific.

## 8) Overall Assessment

Comparison engine is generally deterministic, readable, and uses actual application and extracted values in all key paths. Core normalization and numeric comparison behavior for brand, alcohol content, and net contents is correct for common scenarios.

Main correctness risk is compliance-level government warning validation and country normalization. These should be fixed before relying on outputs for high-confidence compliance review decisions.
