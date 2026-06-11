import { NextResponse } from "next/server";
import { ExtractedFieldMap, FieldKey } from "@/types/label";

const EXTRACTION_KEYS: FieldKey[] = [
  "brandName",
  "classTypeDesignation",
  "alcoholContent",
  "netContents",
  "producerBottlerName",
  "countryOfOrigin",
  "governmentWarning",
];

const SYSTEM_PROMPT =
  "You extract required alcohol beverage label fields from one uploaded image. Return JSON only, no markdown, no explanations. If a field is not visible, return null for value and 0 confidence. Do not guess values that are not clearly visible.";

const USER_PROMPT = `Extract these fields from the label image:
- Brand Name
- Class/Type Designation
- Alcohol Content
- Net Contents
- Producer/Bottler Name
- Country of Origin
- Government Warning Statement

Return ONLY JSON with this exact shape and keys:
{
  "brandName": { "value": string | null, "confidence": number },
  "classTypeDesignation": { "value": string | null, "confidence": number },
  "alcoholContent": { "value": string | null, "confidence": number },
  "netContents": { "value": string | null, "confidence": number },
  "producerBottlerName": { "value": string | null, "confidence": number },
  "countryOfOrigin": { "value": string | null, "confidence": number },
  "governmentWarning": { "value": string | null, "confidence": number }
}

Rules:
- JSON only.
- Confidence must be between 0 and 1.
- Use null value and confidence 0 if not found.
- Do not include keys beyond the required seven fields.`;

function sanitizeExtractedPayload(payload: unknown): ExtractedFieldMap {
  const map = {} as ExtractedFieldMap;
  const candidate = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};

  for (const key of EXTRACTION_KEYS) {
    const entry = candidate[key];

    if (!entry || typeof entry !== "object") {
      map[key] = null;
      continue;
    }

    const valueCandidate = (entry as Record<string, unknown>).value;
    const confidenceCandidate = (entry as Record<string, unknown>).confidence;

    const value =
      typeof valueCandidate === "string"
        ? valueCandidate.trim()
        : valueCandidate === null
          ? ""
          : "";

    const confidence =
      typeof confidenceCandidate === "number" && Number.isFinite(confidenceCandidate)
        ? Math.max(0, Math.min(1, confidenceCandidate))
        : 0;

    map[key] = {
      value,
      confidence,
    };
  }

  return map;
}

function parseModelJson(rawText: string): unknown {
  const trimmed = rawText.trim();

  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    const lines = trimmed.split("\n");
    const withoutFence = lines.slice(1, -1).join("\n");
    return JSON.parse(withoutFence);
  }

  return JSON.parse(trimmed);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Please upload an image before running extraction." },
        { status: 400 },
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "The uploaded file must be an image." },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    // console.log("OPENAI_API_KEY exists:", !!apiKey); // debugging, confirm if the key is picked up from .env.local, it also prints clue from OpenAI credit maxed out error
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Extraction service is not configured yet. Add OPENAI_API_KEY to run AI extraction.",
        },
        { status: 500 },
      );
    }

    const model = process.env.OPENAI_VISION_MODEL ?? "gpt-4.1-mini";
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const imageDataUrl = `data:${image.type};base64,${base64}`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: SYSTEM_PROMPT }],
          },
          {
            role: "user",
            content: [
              { type: "input_text", text: USER_PROMPT },
              {
                type: "input_image",
                image_url: imageDataUrl,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenAI extraction error:", errorBody);
      return NextResponse.json(
        {
          error:
            "We could not extract fields from this image right now. Please try again.",
        },
        { status: 500 },
      );
    }

    const data = (await response.json()) as unknown;
    // Turn this on to debug to see  raw response from OpenAI, 
    //   it might contain clues for extraction failure like malformed JSON or low confidence results. 
    // console.log("OPENAI RESPONSE:", JSON.stringify(data, null, 2));

    let outputText = "";
    const dataRecord = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
    const outputItems = dataRecord && Array.isArray(dataRecord.output) ? dataRecord.output : null;

    // Extract text from Responses API structure: output[0].content[0].text
    if (outputItems && outputItems.length > 0) {
      const firstOutput = outputItems[0];
      if (firstOutput && typeof firstOutput === "object") {
        const firstOutputRecord = firstOutput as Record<string, unknown>;
        const contentItems = Array.isArray(firstOutputRecord.content)
          ? firstOutputRecord.content
          : null;

        if (contentItems && contentItems.length > 0) {
          const firstContent = contentItems[0];
          if (
            firstContent &&
            typeof firstContent === "object" &&
            "text" in firstContent
          ) {
            const textValue = (firstContent as Record<string, unknown>).text;
            outputText = typeof textValue === "string" ? textValue : "";
          }
        }
      }
    }

    console.log("Extracted outputText:", outputText);

    if (!outputText.trim()) {
      return NextResponse.json(
        {
          error:
            "Extraction returned an empty result. Please retry with a clearer label image.",
        },
        { status: 500 },
      );
    }

    let parsed: unknown;
    try {
      parsed = parseModelJson(outputText);
    } catch {
      return NextResponse.json(
        {
          error:
            "Extraction result was not valid JSON. Please retry with a clearer image.",
        },
        { status: 500 },
      );
    }

    const extracted = sanitizeExtractedPayload(parsed);
    return NextResponse.json(extracted);
  } catch (error) {
    console.error("Extraction route failure:", error);
    return NextResponse.json(
      {
        error:
          "Something went wrong while extracting label fields. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
