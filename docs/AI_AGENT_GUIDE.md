# AI Agent Guide
Last updated June 11 2026 3:05 PM

## Purpose

This project is a standalone prototype called **AI-Powered Alcohol Label Verification App**.

It is designed for compliance-style review of alcohol beverage labels. The current version is intentionally simple and uses an AI extraction route with a controlled mock fallback path for local development.

The app now runs real AI-based extraction through an API route at `app/api/extract/route.ts`. Mock extracted values remain available as a development fallback.

The app does five things:

1. Accepts one uploaded label image.
2. Accepts manually entered application data.
3. Sends the uploaded image to an extraction API.
4. Compares submitted application values against extracted values.
5. Displays comparison outcomes and a separate government warning validation result.

Current field contract is seven fields: brandName, classTypeDesignation, alcoholContent, netContents, producerBottlerName, countryOfOrigin, governmentWarning.

This is a **decision-support prototype**, not a legal determination engine.

## Tech Stack

- Next.js App Router
- TypeScript
- React client components
- Tailwind CSS
- Vitest for unit tests
- No database
- No authentication
- OpenAI API key required for production AI extraction

## High-Level Architecture

The app is intentionally shallow. There is one main page, a small set of presentational components, one extraction API route, one mock fallback data source, shared types, and pure utility functions for normalization and comparison.

```mermaid
flowchart TD
    A[User uploads image] --> B[app/page.tsx state]
    C[User enters form data] --> B
    D[Use demo data] --> B
  B --> E[Run analysis]
  E --> F[/api/extract route]
  F --> G[OpenAI vision model]
  G --> H[ExtractedFieldMap response]
  E --> I[buildAnalysisOutput in lib/compare.ts]
  H --> I
  J[data/mockData.ts fallback extracted fields] --> I
  K[lib/normalize.ts] --> I
  I --> L[AnalysisOutput object]
  L --> M[ResultsPanel]
  M --> N[Comparison table and notes]
  M --> O[WarningValidationCard]
```

## Folder Structure

### App shell

- [app/page.tsx](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/app/page.tsx)
  Main stateful workflow container. Owns upload state, form state, analysis state, and orchestration.
- [app/api/extract/route.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/app/api/extract/route.ts)
  API route that validates the uploaded image, calls an OpenAI vision-capable model, and returns `ExtractedFieldMap` JSON.

### UI components

- [components/UploadSection.tsx](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/components/UploadSection.tsx)
  Upload UI, preview, and Run Analysis button.
- [components/UploadForm.tsx](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/components/UploadForm.tsx)
  Compatibility re-export of UploadSection.
- [components/ApplicationForm.tsx](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/components/ApplicationForm.tsx)
  Controlled form for application values.
- [components/ResultsPanel.tsx](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/components/ResultsPanel.tsx)
  Handles empty/loading/error/result rendering.
- [components/WarningValidationCard.tsx](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/components/WarningValidationCard.tsx)
  Dedicated government warning validation display.

### Data and types

- [data/mockData.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/data/mockData.ts)
  Holds empty form defaults, demo form values, and mocked extracted label fields.
- [types/label.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/types/label.ts)
  Shared domain model for fields, comparisons, extracted values, and analysis output.

### Core logic

- [lib/normalize.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/lib/normalize.ts)
  Pure normalization and parsing helpers.
- [lib/compare.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/lib/compare.ts)
  Pure comparison logic and the top-level analysis builder.

### Compatibility layers

- [utils/normalization.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/utils/normalization.ts)
- [utils/comparison.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/utils/comparison.ts)

These re-export the lib implementations so older imports still work.

### Tests

- [tests/normalize.test.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/tests/normalize.test.ts)
- [tests/compare.test.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/tests/compare.test.ts)

## Runtime Flow

## 1. Initial render

The page starts in an empty state inside [app/page.tsx](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/app/page.tsx).

State variables:

- `applicationData`: controlled form values, initialized from `EMPTY_APPLICATION_DATA`
- `fileName`: name of uploaded image
- `previewUrl`: browser object URL for image preview
- `selectedFile`: stored `File` object for API upload
- `isAnalyzing`: loading state for the analysis step
- `analysisResults`: final `AnalysisOutput` or `null`
- `errorMessage`: user-facing error string or `null`

On the first render, the results panel shows the empty state because `analysisResults` is `null`.

## 2. Upload flow

The upload component is rendered by [components/UploadSection.tsx](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/components/UploadSection.tsx).

When a file is chosen:

1. The file is passed to `handleFileChange` in [app/page.tsx](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/app/page.tsx).
2. Any previous `previewUrl` is revoked with `URL.revokeObjectURL`.
3. A new object URL is created with `URL.createObjectURL`.
4. The file name and preview URL are stored in state.
5. The preview image appears in the upload card.

If the component unmounts or the preview URL changes, `useEffect` cleanup revokes the object URL to avoid leaks.

## 3. Form flow

[components/ApplicationForm.tsx](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/components/ApplicationForm.tsx) renders all required fields dynamically from `REQUIRED_FIELD_LABELS` in [types/label.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/types/label.ts).

This matters because adding a new field usually starts in one place:

1. Add it to `REQUIRED_FIELD_LABELS`
2. Add it to the mock data objects
3. Adjust comparison logic if the field needs special handling
4. UI updates automatically for the form loop

The government warning field is the only textarea. Everything else is a text input.

The `Use demo data` button loads `DEMO_APPLICATION_DATA` from [data/mockData.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/data/mockData.ts).

## 4. Run analysis

The `Run analysis` button calls `runAnalysis` in [app/page.tsx](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/app/page.tsx).

Behavior:

1. If no file was uploaded, the function sets an error message and stops.
2. It sets `isAnalyzing` to `true`.
3. It sends a multipart request with `image` to `/api/extract`.
4. It receives extraction JSON and maps/sanitizes to `ExtractedFieldMap`.
5. It calls `buildAnalysisOutput(applicationData, extractedFields)`.
6. It stores the returned `AnalysisOutput` in `analysisResults`.
7. It clears the loading state.

If extraction fails, the app falls back to `MOCK_EXTRACTED_FIELDS` in non-production or when `NEXT_PUBLIC_USE_MOCK_EXTRACTION=true`.

## Extraction API Contract

The extraction route is [app/api/extract/route.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/app/api/extract/route.ts).

Current behavior:

1. Validates multipart input includes one `image` file.
2. Rejects missing or non-image uploads with HTTP 400.
3. Sends image + extraction instructions to OpenAI Responses API.
4. Reads generated text from `output[0].content[0].text`.
5. Parses model JSON and sanitizes into `ExtractedFieldMap`.
6. Returns HTTP 500 with user-friendly messages for extraction or parsing failures.

Route response shape remains `ExtractedFieldMap` for compatibility with existing comparison and rendering logic.

## Core Analysis Flow

The core analysis entry point is `buildAnalysisOutput` in [lib/compare.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/lib/compare.ts).

It performs three jobs:

1. Builds normalized `extractedFields`
2. Builds `comparisons` for every required field
3. Builds a separate `warningValidation` result for government warning compliance checks

Returned object shape:

- `extractedFields`: normalized extracted data for display
- `comparisons`: one comparison result per field
- `warningValidation`: dedicated pass/fail warning validation summary
- `analyzedAt`: timestamp

## Domain Types

The main domain types live in [types/label.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/types/label.ts).

Most important ones:

- `FieldKey`: canonical field key union derived from `REQUIRED_FIELD_LABELS`
- `ApplicationData`: submitted form values keyed by field
- `ExtractedFieldMap`: extracted values keyed by field
- `ComparisonCategory`: Match, Likely Match, Mismatch, Missing, Needs Human Review
- `ComparisonResult`: one field comparison including normalized values and reason text
- `WarningValidationResult`: separate government warning pass/fail model
- `AnalysisOutput`: top-level result model used by the UI

Other agents should treat these types as the primary contract between UI and logic.

## Normalization Layer

[lib/normalize.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/lib/normalize.ts) contains pure, unit-testable normalization helpers.

### General text normalization

`normalizeGeneralText`:

- lowercases text
- removes apostrophes
- strips punctuation into spaces
- collapses whitespace

Used for broad text-field comparison.

### Brand normalization

`normalizeBrandName` currently behaves like general text normalization.

Example:

- `STONE'S THROW` -> `stones throw`
- `Stone's Throw` -> `stones throw`

### Class/type normalization

`normalizeClassType` builds on general normalization and also removes or translates selected tokens:

- removes `table`
- converts `vin` to `wine`

This is intentionally small and conservative.

### Alcohol parsing

`parseAlcoholContent` extracts numeric ABV-like values from strings such as:

- `13.5%`
- `13.5% Alc/Vol`
- `13.5 alc vol`
- `13.5 ABV`

It returns:

- `percentValue`
- `normalizedDisplay`

If parsing fails, it falls back to normalized text.

### Net contents parsing

`parseNetContents` parses units such as:

- `mL`
- `L`
- `oz`
- `fl oz`

It normalizes to milliliters and returns:

- `milliliters`
- `normalizedDisplay`

### Government warning normalization

`normalizeGovernmentWarning` is stricter and only normalizes case and whitespace. It does not aggressively strip content, because this field is treated as compliance-sensitive.

### Token similarity

`tokenSimilarity` computes a token overlap score between normalized strings. It is used when exact or parsed equivalence is not enough.

## Comparison Layer

[lib/compare.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/lib/compare.ts) contains the comparison engine.

### Field-specific comparator functions

These are exported and unit-testable:

- `compareBrandName`
- `compareClassType`
- `compareAlcoholContent`
- `compareNetContents`

They all return the same internal shape:

- `category`
- `confidence`
- `notes`
- `needsHumanReview`

### Outcome categories

Possible outcomes:

- `Match`
- `Likely Match`
- `Mismatch`
- `Missing`
- `Needs Human Review`

### How each field is compared

#### Brand name

`compareBrandName` prefers:

1. exact raw string match -> `Match`
2. normalized text match -> `Likely Match`
3. token similarity thresholds -> likely review or mismatch

This intentionally allows the example:

- `STONE'S THROW` vs `Stone's Throw` -> `Likely Match`

#### Class/type designation

`compareClassType` uses class-specific normalization first, then token similarity.

Example:

- `Red Wine` vs `Red table wine` should normalize near the same meaning.

#### Alcohol content

`compareAlcoholContent` tries numeric parsing first, then compares delta thresholds:

- very small delta -> `Match`
- small delta -> `Likely Match`
- medium delta -> `Needs Human Review`
- larger delta -> `Mismatch`

If it cannot parse numbers, it falls back to text similarity.

#### Net contents

`compareNetContents` tries unit parsing first and normalizes to milliliters.

This allows:

- `750 ML` vs `750 mL` -> `Match`

If parsing fails, it falls back to text similarity.

### Shared helpers inside compare.ts

- `missingOutcome` handles blank-value cases
- `buildSimilarityOutcome` maps similarity scores to categories
- `toRange` clamps confidence between 0 and 1

## Government Warning Validation

Government warning logic is intentionally separate from the main field comparison UI.

Two related things happen:

1. The warning field still gets a normal comparison result inside `comparisons`
2. A separate dedicated compliance-style result is produced by `validateGovernmentWarning`

`validateGovernmentWarning` checks:

- exact warning text equivalence between submitted application value and extracted value, after warning-specific normalization
- presence of uppercase `GOVERNMENT WARNING` in extracted text

Current limitation:

- this does not validate against a canonical statutory warning source
- heading check does not enforce `GOVERNMENT WARNING:` colon formatting

It returns:

- `status`: Pass or Fail
- `confidence`
- `exactWarningTextMatch`
- `uppercaseHeadingPresent`
- `notes`

The dedicated UI for this result is [components/WarningValidationCard.tsx](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/components/WarningValidationCard.tsx).

## UI Rendering Flow

[components/ResultsPanel.tsx](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/components/ResultsPanel.tsx) is the main output renderer.

It handles four states:

1. Loading
2. Error
3. Empty
4. Results

When results exist:

1. It filters out `governmentWarning` from the normal comparison table.
2. It renders the remaining comparisons in a table.
3. It renders a detail card for each non-warning comparison, including:
   - reason text
   - human-review marker
   - normalized application and extracted values
4. It renders `WarningValidationCard` separately.

This separation is important. Other agents should preserve it unless the product requirements change.

## Mock Data Fallback Behavior

Primary extraction comes from [app/api/extract/route.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/app/api/extract/route.ts).

Fallback extraction uses mocked values from [data/mockData.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/data/mockData.ts) when:

- environment is non-production, or
- `NEXT_PUBLIC_USE_MOCK_EXTRACTION=true`.

**Extraction Source Display:**

The extraction source is displayed to users in the results header as a lightweight indicator:

- On OpenAI success: `Extraction Source: OpenAI Vision`
- On mock fallback: `Extraction Source: Mock Data (Fallback)`

This transparency allows reviewers to understand whether results came from real AI extraction or development fallback data. The indicator is shown only when results are available and not during analysis.

Important detail: the mocked brand value is:

- `STONE'S THROW`

while the demo application value is:

- `Stone's Throw`

That means current default demo behavior intentionally produces a non-perfect brand comparison. Any agent changing demo behavior should understand that this affects visible result states.

Required environment variables for AI extraction:

- `OPENAI_API_KEY` (required for real extraction)
- `OPENAI_VISION_MODEL` (optional override, defaults in route)

## Testing Strategy

Unit tests live in:

- [tests/normalize.test.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/tests/normalize.test.ts)
- [tests/compare.test.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/tests/compare.test.ts)

Vitest is configured in [vitest.config.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/vitest.config.ts).

Current tests cover:

- brand normalization
- class/type normalization
- alcohol parsing
- net contents parsing
- brand comparison expected `Likely Match`
- net contents expected `Match`
- `Missing`
- `Needs Human Review`
- `Mismatch`

Run commands:

```bash
npm run test
npm run lint
npm run build
```

## Safe Extension Points For Future Agents

### Add a new field

Start in [types/label.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/types/label.ts):

1. Add the field to `REQUIRED_FIELD_LABELS`
2. Update `EMPTY_APPLICATION_DATA` and `DEMO_APPLICATION_DATA`
3. Update `MOCK_EXTRACTED_FIELDS`
4. Add comparison logic if special handling is needed
5. Add tests

### Extend or swap extraction providers

The extraction insertion point is now the API route [app/api/extract/route.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/app/api/extract/route.ts).

Preferred upgrade path:

1. keep request/response contract as `ExtractedFieldMap`
2. swap provider logic inside the route
3. keep `buildAnalysisOutput` input shape unchanged
4. keep UI components unchanged

This preserves the existing comparison and rendering pipeline.

### Refine comparison intelligence

Most comparison sophistication should be added in [lib/normalize.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/lib/normalize.ts) and [lib/compare.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/lib/compare.ts), not in UI components.

Preferred rule:

- keep UI dumb
- keep comparison logic pure
- keep types centralized

## Constraints To Preserve

Other agents should preserve these project constraints unless explicitly told otherwise:

- no auth
- no database
- Vercel-friendly deployment
- accessible, obvious UI for non-technical users
- mobile responsiveness
- good empty/loading/error states
- local development can run with fallback mock extraction
- government warning validation stays visibly separate from normal comparison results

## Recommended Mental Model

If another AI agent needs to understand this project quickly, the shortest accurate mental model is:

1. [app/page.tsx](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/app/page.tsx) is the orchestrator.
2. [app/api/extract/route.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/app/api/extract/route.ts) handles extraction and returns `ExtractedFieldMap`.
3. [data/mockData.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/data/mockData.ts) supplies development fallback extracted values and demo form values.
4. [types/label.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/types/label.ts) defines the contract.
5. [lib/normalize.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/lib/normalize.ts) parses and normalizes values.
6. [lib/compare.ts](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/lib/compare.ts) converts inputs into `AnalysisOutput`.
7. [components/ResultsPanel.tsx](/c:/OpenProjects/App-Assigment1/ttb-label-verifier/components/ResultsPanel.tsx) renders the final decision-support view.

That is the real code flow of the app.