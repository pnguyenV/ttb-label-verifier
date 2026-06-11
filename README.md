# AI-Powered Alcohol Label Verification App (Prototype)

Standalone decision-support prototype for compliance agents reviewing alcohol beverage labels.
(Doc for this project: https://docs.google.com/document/d/1Pw51TQ1d8jmL2Q7xyygVTdVnu_FsArVyb8S3NlGQMuM/edit?tab=t.0)

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Mocked extraction data (no API integration)
- No authentication
- No database

## What this prototype does

1. Upload one label image.
2. Enter application values manually (or load demo data).
3. Run mock analysis with static extracted JSON.
4. Compare extracted values against submitted values.
5. Review field-by-field comparison and a dedicated Government Warning validation card.

This app is a decision-support prototype only and does not provide final legal determination.

## Project structure

```
app/
	page.tsx

components/
	UploadForm.tsx
	UploadSection.tsx
	ApplicationForm.tsx
	ResultsPanel.tsx
	WarningValidationCard.tsx
	WarningCheckCard.tsx

lib/
	normalize.ts
	compare.ts

utils/
	normalization.ts
	comparison.ts

types/
	label.ts

data/
	mockData.ts
	mockExtractedLabel.ts
```

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Validation commands

```bash
npm run lint
npm run build
```

## Manual QA flow

1. Click Use demo data.
2. Upload any sample label image.
3. Click Run mock analysis.
4. Confirm table shows Match, Likely Match, Mismatch, Missing, or Needs Human Review.
5. Confirm Government Warning Validation shows:
	 - Pass/Fail status
	 - Confidence percentage
	 - Exact warning text check
	 - Uppercase "GOVERNMENT WARNING" check
	 - Validation notes

## API keys and environment

No API keys are required. No environment variables are required for the current mock workflow.

## Deployment

This repository is Vercel-friendly and can be deployed directly as a standard Next.js application.
