export interface ParsedAlcoholContent {
	percentValue: number | null;
	normalizedDisplay: string;
}

export interface ParsedNetContents {
	milliliters: number | null;
	normalizedDisplay: string;
}

export function isBlank(value: string): boolean {
	return value.trim().length === 0;
}

export function normalizeGeneralText(value: string): string {
	return value
		.normalize("NFKD")
		.toLowerCase()
		.replace(/[\u2019']/g, "")
		.replace(/[^a-z0-9\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export function normalizeBrandName(value: string): string {
	return value
		.normalize("NFKD")
		.toLowerCase()
		.replace(/[\u2019']/g, "")
		.replace(/[^a-z0-9\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export function normalizeClassType(value: string): string {
	const normalized = normalizeGeneralText(value)
		.replace(/\btable\b/g, "")
		.replace(/\bvin\b/g, "wine")
		.replace(/\s+/g, " ")
		.trim();

	return normalized;
}

export function normalizeGovernmentWarning(value: string): string {
	return value
		.normalize("NFKC")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();
}

export function parseAlcoholContent(value: string): ParsedAlcoholContent {
	const text = value.trim();
	const percentMatch = text.match(/(\d+(?:\.\d+)?)\s*%/i);
	const alcVolMatch = text.match(/(\d+(?:\.\d+)?)\s*alc\/?vol/i);
	const abvMatch = text.match(/(\d+(?:\.\d+)?)\s*abv/i);

	const numeric = percentMatch ?? alcVolMatch ?? abvMatch;
	const parsed = numeric ? Number.parseFloat(numeric[1]) : Number.NaN;

	if (Number.isNaN(parsed)) {
		return {
			percentValue: null,
			normalizedDisplay: normalizeGeneralText(text),
		};
	}

	return {
		percentValue: parsed,
		normalizedDisplay: `${parsed.toFixed(2)}% alc/vol`,
	};
}

export function parseNetContents(value: string): ParsedNetContents {
	const text = value.trim().toLowerCase();
	const match = text.match(/(\d+(?:\.\d+)?)\s*(ml|m\.?l\.?|l|liter|liters|oz|fl\.?\s*oz)/i);

	if (!match) {
		return {
			milliliters: null,
			normalizedDisplay: normalizeGeneralText(value),
		};
	}

	const amount = Number.parseFloat(match[1]);
	if (Number.isNaN(amount)) {
		return {
			milliliters: null,
			normalizedDisplay: normalizeGeneralText(value),
		};
	}

	const unit = match[2].replace(/\s|\./g, "").toLowerCase();
	let ml = amount;

	if (unit === "l" || unit === "liter" || unit === "liters") {
		ml = amount * 1000;
	} else if (unit === "oz" || unit === "floz") {
		ml = amount * 29.5735;
	}

	return {
		milliliters: Number.parseFloat(ml.toFixed(2)),
		normalizedDisplay: `${Number.parseFloat(ml.toFixed(2))} ml`,
	};
}

export function tokenSimilarity(a: string, b: string): number {
	if (!a || !b) {
		return 0;
	}

	if (a === b) {
		return 1;
	}

	const tokensA = new Set(a.split(" "));
	const tokensB = new Set(b.split(" "));

	let overlap = 0;
	tokensA.forEach((token) => {
		if (tokensB.has(token)) {
			overlap += 1;
		}
	});

	return (2 * overlap) / (tokensA.size + tokensB.size);
}
