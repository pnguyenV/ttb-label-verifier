# AI-Powered Alcohol Label Verification App (Prototype)

Standalone decision-support prototype for compliance agents reviewing alcohol beverage labels.

## The PRD is here: .\ttb-label-verifier\docs\PRD.md

## Technology Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- App Router API route for AI extraction (`app/api/extract/route.ts`)
- OpenAI vision-capable model integration
- Mock extracted-data fallback for development
- No authentication
- No database

## What this prototype does

1. Upload one label image.
2. Enter application values manually (or load demo data).
3. Run analysis by sending the image to `/api/extract`.
4. Compare extracted values against submitted values.
5. Review field-by-field comparison and a dedicated Government Warning validation card.

If extraction is unavailable, the app can fall back to mock extracted values during development.

The extraction route reads model text output from the OpenAI Responses API structure (`output[0].content[0].text`) and parses it into the app's extracted-field contract.

This app is a decision-support prototype only and does not provide final legal determination.

## Project structure

```
app/
	page.tsx
	api/
		extract/
			route.ts

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

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables. Create a `.env.local` file in the project root:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

3. Start the development server:
```bash
npm run dev
```

Open http://localhost:3000.

## Validation commands

```bash
npm run lint
npm run build
```

## Manual QA flow

1. Click Use demo data or enter custom text.
2. Upload any sample label image.
3. Click Run analysis.
4. Confirm table shows Match, Likely Match, Mismatch, Missing, or Needs Human Review.
5. Confirm Government Warning Validation shows:
	 - Pass/Fail status
	 - Confidence percentage
	 - Exact warning text check
	 - Uppercase "GOVERNMENT WARNING" check
	 - Validation notes

If running with fallback enabled and extraction fails, confirm a user-facing fallback message appears and results still render.

## API keys and environment

Real extraction requires an OpenAI API key.

Set these in your environment:

- `OPENAI_API_KEY` (required for AI extraction text value from the uploaded images)
- `OPENAI_VISION_MODEL` (optional, defaults in route)
- `NEXT_PUBLIC_USE_MOCK_EXTRACTION` (optional; set to `true` to force mock fallback mode)

In local development, add the API KEY to `.env.local`.

Behavior:

- Production expects real extraction (a valid `OPENAI_API_KEY`).
- Non-production allows mock fallback if extraction fails.

## Deployment

This repository is Vercel-friendly and can be deployed directly as a standard Next.js application.
