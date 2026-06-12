# AI-Powered Alcohol Label Verification App (Prototype)

This App supports compliance agents in reviewing alcohol beverage labels.

Related docs: PRD: docs/PRD.md

## How this App works

1. Click "Choose File" to **upload a label image** (alcohol beverage label).
2. Enter **Application Values** manually (or click to load demo data, e.g. Brand Name = Stone's; Net contents=750 mL ...etc).
3. Click **"Run analysis"**
4. The App will compare extracted values (from the uploaded image) against submitted values (Application Values).
5. **Results pane**: will show field-by-field comparison and its result, e.g. matched, not matched, need human review..etc.

If extraction is unavailable, the app can fall back to mock extracted values in non-production (or when forced by env var).

The extraction route reads model output from the OpenAI Responses API path output[0].content[0].text and parses it into the extracted-field contract used by the app.

This app is a decision-support to the human agent only, the agent makes final decision.

## Extracted/comparison fields

- Brand name
- Class/type designation
- Alcohol content
- Net contents
- Producer/bottler name
- Country of origin
- Government warning statement

## How to run it locally in dev environment

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

## Deployment

This repository is Vercel-friendly and can be deployed directly as a standard Next.js application.
