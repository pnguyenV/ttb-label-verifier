# AI-Powered Label Verification Tool (Evaluation Prototype)

This repository contains a functional standalone prototype designed to evaluate how artificial intelligence can streamline the compliance review workflow for federal beverage label applications.

![AI-Powered Label Verification Tool Dashboard Interface Preview](public/app-screenshot.png)

<br>

### Quick-Start Tip: 
The App includes 2 **Sample Label links** below the upload area. <br>Click *Label 1* or *Label 2* to preview a test image in a newtab, then save it locally if you want to upload it for analysis.

**Live System URL:** `https://ttb.myappnow.net`  
**Core Specification:** [Product Requirements Document](docs/PRD.md)
<br><br>

## Summary

This system serves as a **Human-in-the-Loop Decision Support Tool**. It automates the repetitive extraction and textual tasks, highlighting discrepancies so human compliance experts can focus on complex edge-case evaluations and final determinations. 
<br><br>

## Technical Architecture & Design Decisions

The prototype uses a simple, lightweight architecture to support fast iteration and easy review.

### Architectural Blueprint
* **Frontend & Application Core:** Next.js and TypeScript.
* **Styling & Interface:** Tailwind CSS.
* **AI Orchestration Layer:** OpenAI vision-capable models are called through a secure API route (`app/api/extract/route.ts`).
* **Data Strategy:** The prototype uses in-memory handling for this phase and does not depend on a database.

### Engineering Tradeoffs & Prioritization

To keep the prototype within the evaluation timeline, the following architectural tradeoffs were made:

| Architectural Focus | Implementation Strategy |
| --- | --- |
| Data Persistence | In-memory execution only; no database or session caching. |
| Identity / Access | Publicly accessible endpoint; no authentication layer. |
| Data & Scope | Prioritized a single-image and single-application workflow to validate the AI vision pipeline and core comparison logic first. Future iterations can add batch processing, concurrent scaling, and more complex workflows. |
| Government Warning Formatting | Validates warning text and uppercase "GOVERNMENT WARNING" presence, but does not currently detect bold formatting. |
<br>


## User Flow

1. Click **Choose File** to upload a label image.
2. Enter **application values** manually, or click **Use demo data** to auto-fill the form with test values such as Brand Name = Stone's Throw and Net Contents = 750 mL.
3. Click **Run analysis**.
4. The app compares extracted values from the uploaded image against the submitted application values.
5. The results pane shows field-by-field comparison results such as Match, Mismatch, or Needs Human Review.

- If extraction is unavailable, the app can fall back to mock extracted values in this version.
- The extraction route reads model output from the OpenAI Responses API path output[0].content[0].text and parses it into the extracted-field contract used by the app.
- This app is a decision-support to the human agent only, the agent makes final decision.

## Extracted/comparison fields

- Brand name
- Class/type designation
- Alcohol content
- Net contents
- Producer/bottler name
- Country of origin
- Government warning statement
<br><br>

## To run this App locally in development environment:
Follow these steps to spin up the local development server.

### Prerequisites
* Node.js (v22.x or higher recommended)
* npm v10.x

### 1. Clone & Install Dependencies
**Bash or cmd prompt:**
git clone https://github.com/pnguyenV/ttb-label-verifier.git
cd ttb-label-verifier
npm install

### 2. Configure Environment Variables 
Create .env.local file in the project root if not already exists
Replace your_openai_api_key_here with a valid OpenAI API key:  OPENAI_API_KEY=your_openai_api_key_here

**Note**: The application currently uses OpenAI Vision for label image extraction and requires a valid OpenAI API key and internet connectivity to perform OCR and label validation functions.  The Other vision-capable AI providers (for example, Anthropic, Google Gemini, or Azure OpenAI) could be integrated in the future with minimal changes.

### 3. Start the development server:
npm run dev
Open the application on your browser http://localhost:3000.

## Validation commands
npm run test
npm run lint
npm run build

## API keys and environment

Real extraction requires an OpenAI API key.

Environment variables:
- OPENAI_API_KEY: required for real AI extraction
- NEXT_PUBLIC_USE_MOCK_EXTRACTION: optional; set true to force mock fallback mode

Behavior:
- Production expects real extraction (valid OPENAI_API_KEY).
- Non-production allows mock fallback if extraction fails.

## Project structure

app/
- globals.css
- layout.tsx
- page.tsx
- api/extract/route.ts

components/
- ApplicationForm.tsx
- ResultsPanel.tsx
- UploadForm.tsx
- UploadSection.tsx
- WarningCheckCard.tsx
- WarningValidationCard.tsx

data/
- mockData.ts
- mockExtractedLabel.ts

docs/
- PRD.md

lib/
- compare.ts
- normalize.ts

tests/
- compare.test.ts
- normalize.test.ts

types/
- label.ts

utils/
- comparison.ts
- normalization.ts

## Deployment

This app can be run locally in a development environment or deployed through a cloud service.
