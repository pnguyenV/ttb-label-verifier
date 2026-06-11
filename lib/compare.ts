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
	normalizeBrandName,
	normalizeClassType,
	normalizeGeneralText,
	normalizeGovernmentWarning,
	parseAlcoholContent,
	parseNetContents,
	tokenSimilarity,
} from "@/lib/normalize";

interface FieldComparisonOutcome {
	category: ComparisonCategory;
	confidence: number;
	notes: string[];
	needsHumanReview: boolean;
}

function toRange(value: number, min = 0, max = 1): number {
	return Math.min(max, Math.max(min, value));
}

function missingOutcome(
	applicationValue: string,
	extractedValue: string,
	extractionConfidence: number,
): FieldComparisonOutcome {
	if (isBlank(applicationValue) && isBlank(extractedValue)) {
		return {
			category: "Missing",
			confidence: 0,
			notes: ["Both application and extracted values are missing."],
			needsHumanReview: true,
		};
	}

	if (isBlank(extractedValue)) {
		return {
			category: "Missing",
			confidence: 0,
			notes: ["No value was extracted from the label."],
			needsHumanReview: true,
		};
	}

	if (isBlank(applicationValue)) {
		return {
			category: "Needs Human Review",
			confidence: toRange(extractionConfidence * 0.7),
			notes: ["Application value is missing."],
			needsHumanReview: true,
		};
	}

	return {
		category: "Needs Human Review",
		confidence: toRange(extractionConfidence),
		notes: ["Missing-value fallback path triggered."],
		needsHumanReview: true,
	};
}

function buildSimilarityOutcome(
	similarity: number,
	extractionConfidence: number,
	likelyReason: string,
	mismatchReason: string,
): FieldComparisonOutcome {
	if (similarity >= 0.9) {
		return {
			category: "Likely Match",
			confidence: toRange(0.88 + extractionConfidence * 0.1),
			notes: [likelyReason],
			needsHumanReview: false,
		};
	}

	if (similarity >= 0.72) {
		return {
			category: "Needs Human Review",
			confidence: toRange(0.65 + extractionConfidence * 0.1),
			notes: ["Values partially overlap and should be checked manually."],
			needsHumanReview: true,
		};
	}

	return {
		category: "Mismatch",
		confidence: toRange(0.7 + extractionConfidence * 0.2),
		notes: [mismatchReason],
		needsHumanReview: true,
	};
}

export function compareBrandName(
	applicationValue: string,
	extractedValue: string,
	extractionConfidence: number,
): FieldComparisonOutcome {
	if (isBlank(applicationValue) || isBlank(extractedValue)) {
		return missingOutcome(applicationValue, extractedValue, extractionConfidence);
	}

	const rawApp = applicationValue.trim();
	const rawExt = extractedValue.trim();
	if (rawApp === rawExt) {
		return {
			category: "Match",
			confidence: toRange(0.95 + extractionConfidence * 0.05),
			notes: ["Brand names match exactly."],
			needsHumanReview: false,
		};
	}

	const normalizedApplication = normalizeBrandName(applicationValue);
	const normalizedExtracted = normalizeBrandName(extractedValue);
	if (normalizedApplication === normalizedExtracted) {
		return {
			category: "Likely Match",
			confidence: toRange(0.86 + extractionConfidence * 0.1),
			notes: [
				"Brand names match after case/punctuation normalization.",
				"Example: STONE'S THROW vs Stone's Throw.",
			],
			needsHumanReview: false,
		};
	}

	const similarity = tokenSimilarity(normalizedApplication, normalizedExtracted);
	return buildSimilarityOutcome(
		similarity,
		extractionConfidence,
		"Brand names are close after normalization.",
		"Brand names differ materially after normalization.",
	);
}

export function compareClassType(
	applicationValue: string,
	extractedValue: string,
	extractionConfidence: number,
): FieldComparisonOutcome {
	if (isBlank(applicationValue) || isBlank(extractedValue)) {
		return missingOutcome(applicationValue, extractedValue, extractionConfidence);
	}

	const normalizedApplication = normalizeClassType(applicationValue);
	const normalizedExtracted = normalizeClassType(extractedValue);

	if (normalizedApplication === normalizedExtracted) {
		return {
			category: "Match",
			confidence: toRange(0.9 + extractionConfidence * 0.1),
			notes: ["Class/type values match after normalization."],
			needsHumanReview: false,
		};
	}

	const similarity = tokenSimilarity(normalizedApplication, normalizedExtracted);
	return buildSimilarityOutcome(
		similarity,
		extractionConfidence,
		"Class/type designation is likely equivalent.",
		"Class/type designation differs after normalization.",
	);
}

export function compareAlcoholContent(
	applicationValue: string,
	extractedValue: string,
	extractionConfidence: number,
): FieldComparisonOutcome {
	if (isBlank(applicationValue) || isBlank(extractedValue)) {
		return missingOutcome(applicationValue, extractedValue, extractionConfidence);
	}

	const appParsed = parseAlcoholContent(applicationValue);
	const extParsed = parseAlcoholContent(extractedValue);

	if (appParsed.percentValue !== null && extParsed.percentValue !== null) {
		const delta = Math.abs(appParsed.percentValue - extParsed.percentValue);

		if (delta <= 0.05) {
			return {
				category: "Match",
				confidence: toRange(0.92 + extractionConfidence * 0.08),
				notes: ["Alcohol content percentages are effectively identical."],
				needsHumanReview: false,
			};
		}

		if (delta <= 0.25) {
			return {
				category: "Likely Match",
				confidence: toRange(0.84 + extractionConfidence * 0.1),
				notes: ["Alcohol content values are very close."],
				needsHumanReview: false,
			};
		}

		if (delta <= 0.5) {
			return {
				category: "Needs Human Review",
				confidence: toRange(0.7 + extractionConfidence * 0.1),
				notes: ["Alcohol content values are close but not equivalent."],
				needsHumanReview: true,
			};
		}

		return {
			category: "Mismatch",
			confidence: toRange(0.78 + extractionConfidence * 0.12),
			notes: ["Alcohol content values differ beyond tolerance."],
			needsHumanReview: true,
		};
	}

	const similarity = tokenSimilarity(
		normalizeGeneralText(applicationValue),
		normalizeGeneralText(extractedValue),
	);
	return buildSimilarityOutcome(
		similarity,
		extractionConfidence,
		"Alcohol content text is likely equivalent.",
		"Alcohol content text differs materially.",
	);
}

export function compareNetContents(
	applicationValue: string,
	extractedValue: string,
	extractionConfidence: number,
): FieldComparisonOutcome {
	if (isBlank(applicationValue) || isBlank(extractedValue)) {
		return missingOutcome(applicationValue, extractedValue, extractionConfidence);
	}

	const appParsed = parseNetContents(applicationValue);
	const extParsed = parseNetContents(extractedValue);

	if (appParsed.milliliters !== null && extParsed.milliliters !== null) {
		const deltaMl = Math.abs(appParsed.milliliters - extParsed.milliliters);

		if (deltaMl <= 1) {
			return {
				category: "Match",
				confidence: toRange(0.93 + extractionConfidence * 0.07),
				notes: [
					"Net contents values are equivalent after unit normalization.",
					"Example: 750 ML vs 750 mL.",
				],
				needsHumanReview: false,
			};
		}

		if (deltaMl <= 5) {
			return {
				category: "Likely Match",
				confidence: toRange(0.84 + extractionConfidence * 0.1),
				notes: ["Net contents values are very close after conversion."],
				needsHumanReview: false,
			};
		}

		if (deltaMl <= 15) {
			return {
				category: "Needs Human Review",
				confidence: toRange(0.69 + extractionConfidence * 0.12),
				notes: ["Net contents are close but outside strict tolerance."],
				needsHumanReview: true,
			};
		}

		return {
			category: "Mismatch",
			confidence: toRange(0.8 + extractionConfidence * 0.12),
			notes: ["Net contents differ after unit normalization."],
			needsHumanReview: true,
		};
	}

	const similarity = tokenSimilarity(
		normalizeGeneralText(applicationValue),
		normalizeGeneralText(extractedValue),
	);
	return buildSimilarityOutcome(
		similarity,
		extractionConfidence,
		"Net contents text is likely equivalent.",
		"Net contents text differs materially.",
	);
}

function compareSingleField(
	key: FieldKey,
	applicationValue: string,
	extractedValue: string,
	extractionConfidence: number,
): ComparisonResult {
	const label = REQUIRED_FIELD_LABELS[key];

	if (key === "governmentWarning") {
		const normalizedApplication = normalizeGovernmentWarning(applicationValue);
		const normalizedExtracted = normalizeGovernmentWarning(extractedValue);
		const strictMatch = normalizedApplication === normalizedExtracted;

		return {
			key,
			label,
			applicationValue,
			extractedValue,
			normalizedApplication,
			normalizedExtracted,
			category: strictMatch ? "Match" : "Mismatch",
			confidence: toRange(extractionConfidence),
			needsHumanReview: !strictMatch,
			reason: strictMatch
				? "Government warning matches under strict comparison."
				: "Government warning differs and requires strict compliance review.",
		};
	}

	const normalizedApplication =
		key === "brandName"
			? normalizeBrandName(applicationValue)
			: key === "classTypeDesignation"
				? normalizeClassType(applicationValue)
				: normalizeGeneralText(applicationValue);

	const normalizedExtracted =
		key === "brandName"
			? normalizeBrandName(extractedValue)
			: key === "classTypeDesignation"
				? normalizeClassType(extractedValue)
				: normalizeGeneralText(extractedValue);

	const outcome =
		key === "brandName"
			? compareBrandName(applicationValue, extractedValue, extractionConfidence)
			: key === "classTypeDesignation"
				? compareClassType(applicationValue, extractedValue, extractionConfidence)
				: key === "alcoholContent"
					? compareAlcoholContent(applicationValue, extractedValue, extractionConfidence)
					: key === "netContents"
						? compareNetContents(applicationValue, extractedValue, extractionConfidence)
						: buildSimilarityOutcome(
								tokenSimilarity(normalizedApplication, normalizedExtracted),
								extractionConfidence,
								"Values are likely equivalent after normalization.",
								"Values differ materially after normalization.",
							);

	return {
		key,
		label,
		applicationValue,
		extractedValue,
		normalizedApplication,
		normalizedExtracted,
		category: outcome.category,
		confidence: outcome.confidence,
		needsHumanReview: outcome.needsHumanReview,
		reason: outcome.notes.join(" "),
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
		confidence: toRange(confidence),
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
				key === "brandName"
					? normalizeBrandName(raw)
					: key === "classTypeDesignation"
						? normalizeClassType(raw)
						: key === "governmentWarning"
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
