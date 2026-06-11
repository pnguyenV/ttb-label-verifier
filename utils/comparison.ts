import {
  AnalysisOutput,
  ApplicationData,
  ComparisonCategory,
  ComparisonResult,
  ExtractedField,
  ExtractedFieldMap,
  FieldKey,
  REQUIRED_FIELD_LABELS,
  WarningValidationResult,
} from "@/types/label";
import {
  isBlank,
  normalizeGeneralText,
  normalizeGovernmentWarning,
  tokenSimilarity,
} from "@/utils/normalization";

function categorizeGeneralField(
  normalizedApplication: string,
  normalizedExtracted: string,
  confidence: number,
): { category: ComparisonCategory; needsHumanReview: boolean; reason: string } {
  if (normalizedApplication === normalizedExtracted) {
    return {
      category: "Match",
      needsHumanReview: false,
      reason: "Normalized values are equivalent.",
    };
  }

  const similarity = tokenSimilarity(normalizedApplication, normalizedExtracted);

  if (similarity >= 0.82) {
    return {
      category: "Likely Match",
      needsHumanReview: confidence < 0.75,
      reason:
        "Values are very similar after normalization but not identical.",
    };
  }

  if (similarity >= 0.65) {
    return {
      category: "Needs Human Review",
      needsHumanReview: true,
      reason: "Values partially overlap and require manual review.",
    };
  }

  return {
    category: "Mismatch",
    needsHumanReview: true,
    reason: "Values differ materially after normalization.",
  };
}

function compareSingleField(
  key: FieldKey,
  applicationValue: string,
  extractedValue: string,
  confidence: number,
): ComparisonResult {
  const label = REQUIRED_FIELD_LABELS[key];
  const hasApplicationValue = !isBlank(applicationValue);
  const hasExtractedValue = !isBlank(extractedValue);

  const normalizedApplication =
    key === "governmentWarning"
      ? normalizeGovernmentWarning(applicationValue)
      : normalizeGeneralText(applicationValue);

  const normalizedExtracted =
    key === "governmentWarning"
      ? normalizeGovernmentWarning(extractedValue)
      : normalizeGeneralText(extractedValue);

  if (!hasApplicationValue && !hasExtractedValue) {
    return {
      key,
      label,
      applicationValue,
      extractedValue,
      normalizedApplication,
      normalizedExtracted,
      category: "Missing",
      confidence,
      needsHumanReview: true,
      reason: "Both application and extracted values are missing.",
    };
  }

  if (!hasExtractedValue) {
    return {
      key,
      label,
      applicationValue,
      extractedValue,
      normalizedApplication,
      normalizedExtracted,
      category: "Missing",
      confidence,
      needsHumanReview: true,
      reason: "No value was extracted from the label.",
    };
  }

  if (!hasApplicationValue) {
    return {
      key,
      label,
      applicationValue,
      extractedValue,
      normalizedApplication,
      normalizedExtracted,
      category: "Needs Human Review",
      confidence,
      needsHumanReview: true,
      reason: "Application value is missing.",
    };
  }

  if (key === "governmentWarning") {
    const strictMatch = normalizedApplication === normalizedExtracted;

    return {
      key,
      label,
      applicationValue,
      extractedValue,
      normalizedApplication,
      normalizedExtracted,
      category: strictMatch ? "Match" : "Mismatch",
      confidence,
      needsHumanReview: !strictMatch,
      reason: strictMatch
        ? "Government warning matches under strict comparison."
        : "Government warning differs and requires strict compliance review.",
    };
  }

  const categorized = categorizeGeneralField(
    normalizedApplication,
    normalizedExtracted,
    confidence,
  );

  return {
    key,
    label,
    applicationValue,
    extractedValue,
    normalizedApplication,
    normalizedExtracted,
    category: categorized.category,
    confidence,
    needsHumanReview: categorized.needsHumanReview,
    reason: categorized.reason,
  };
}

function validateGovernmentWarning(
  applicationValue: string,
  extractedValue: string,
  confidence: number,
): WarningValidationResult {
  const exactWarningTextMatch =
    normalizeGovernmentWarning(applicationValue) ===
    normalizeGovernmentWarning(extractedValue);
  const uppercaseHeadingPresent = /\bGOVERNMENT WARNING\b/.test(extractedValue);

  const notes: string[] = [];

  if (exactWarningTextMatch) {
    notes.push("Exact warning text matches after normalization.");
  } else {
    notes.push("Warning text does not exactly match expected application content.");
  }

  if (uppercaseHeadingPresent) {
    notes.push('Heading "GOVERNMENT WARNING" appears in uppercase.');
  } else {
    notes.push('Heading "GOVERNMENT WARNING" is missing or not uppercase.');
  }

  return {
    status: exactWarningTextMatch && uppercaseHeadingPresent ? "Pass" : "Fail",
    confidence,
    exactWarningTextMatch,
    uppercaseHeadingPresent,
    applicationValue,
    extractedValue,
    notes,
  };
}

export function buildAnalysisOutput(
  applicationData: ApplicationData,
  extracted: ExtractedFieldMap,
): AnalysisOutput {
  const keys = Object.keys(REQUIRED_FIELD_LABELS) as FieldKey[];

  const extractedFields: ExtractedField[] = keys.map((key) => {
    const extractedEntry = extracted[key];
    const raw = extractedEntry?.value ?? "";

    return {
      key,
      label: REQUIRED_FIELD_LABELS[key],
      extractedValue: raw,
      normalizedExtracted:
        key === "governmentWarning"
          ? normalizeGovernmentWarning(raw)
          : normalizeGeneralText(raw),
      confidence: extractedEntry?.confidence ?? 0,
    };
  });

  const comparisons = keys.map((key) =>
    compareSingleField(
      key,
      applicationData[key] ?? "",
      extracted[key]?.value ?? "",
      extracted[key]?.confidence ?? 0,
    ),
  );

  const warningValidation = validateGovernmentWarning(
    applicationData.governmentWarning ?? "",
    extracted.governmentWarning?.value ?? "",
    extracted.governmentWarning?.confidence ?? 0,
  );

  return {
    extractedFields,
    comparisons,
    warningValidation,
    analyzedAt: new Date().toISOString(),
  };
}
