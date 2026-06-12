# AI-Powered Alcohol Label Verification App (Prototype)

Standalone decision-support prototype for compliance agents reviewing alcohol beverage labels.

Related docs:
- PRD: docs/PRD.md
- Agent guide: docs/AI_AGENT_GUIDE.md
- Comparison audit: docs/COMPARISON_AUDIT.md

## Technology stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Vitest
- App Router API route for extraction: app/api/extract/route.ts
- OpenAI Responses API (vision-capable model)
- Mock extracted-data fallback for development
- No authentication
- No database

## What this prototype does

1. Upload one label image.
2. Enter application values manually (or load demo data).
3. Run analysis by sending the image to /api/extract.
4. Compare extracted values against submitted values.
5. Review field-by-field comparison and a dedicated Government Warning validation card.

If extraction is unavailable, the app can fall back to mock extracted values in non-production (or when forced by env var).

The extraction route reads model output from the OpenAI Responses API path output[0].content[0].text and parses it into the extracted-field contract used by the app.

This app is a decision-support prototype only and does not provide final legal determination.

## Current extracted/comparison fields

- Brand name
- Class/type designation
- Alcohol content
- Net contents
- Producer/bottler name
- Country of origin
- Government warning statement

## Project structure

app/
- page.tsx
- api/extract/route.ts

components/
- UploadForm.tsx
- UploadSection.tsx
- ApplicationForm.tsx
- ResultsPanel.tsx
- WarningValidationCard.tsx
- WarningCheckCard.tsx

lib/
- normalize.ts
- compare.ts

utils/
- normalization.ts
- comparison.ts

types/
- label.ts

data/
- mockData.ts
- mockExtractedLabel.ts

## Run locally

1. Install dependencies:

npm install

2. Set up environment variables by creating .env.local in the project root:

OPENAI_API_KEY=your_openai_api_key_here

3. Start the development server:

npm run dev

Open http://localhost:3000.

## Validation commands

npm run test
npm run lint
npm run build

## Manual QA flow

1. Click Use demo data or enter custom text.
2. Upload any sample label image.
3. Click Run analysis.
4. Confirm comparison rows show Match, Likely Match, Mismatch, Missing, or Needs Human Review.
5. Confirm Government Warning Validation shows:
- Pass/Fail status
- Confidence percentage
- Exact warning text check
- Uppercase GOVERNMENT WARNING check
- Validation notes

If extraction fails while fallback is allowed, confirm a user-facing fallback message appears and results still render.

## API keys and environment

Real extraction requires an OpenAI API key.

Environment variables:
- OPENAI_API_KEY: required for real AI extraction
- OPENAI_VISION_MODEL: optional model override (route default is gpt-4.1-mini)
- NEXT_PUBLIC_USE_MOCK_EXTRACTION: optional; set true to force mock fallback mode

Behavior:
- Production expects real extraction (valid OPENAI_API_KEY).
- Non-production allows mock fallback if extraction fails.

## Deployment

This repository is Vercel-friendly and can be deployed directly as a standard Next.js application.
