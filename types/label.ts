export const REQUIRED_FIELD_LABELS = {
  brandName: "Brand name",
  classTypeDesignation: "Class/type designation",
  alcoholContent: "Alcohol content",
  netContents: "Net contents",
  producerBottlerName: "Producer/bottler name",
  countryOfOrigin: "Country of origin",
  governmentWarning: "Government warning statement",
} as const;

export type FieldKey = keyof typeof REQUIRED_FIELD_LABELS;

export type ApplicationData = Record<FieldKey, string>;

export interface ExtractedLabelFieldInput {
  value: string;
  confidence: number;
}

export type ExtractedFieldMap = Record<FieldKey, ExtractedLabelFieldInput | null>;

export interface ExtractedField {
  key: FieldKey;
  label: string;
  extractedValue: string;
  normalizedExtracted: string;
  confidence: number;
}

export type ComparisonCategory =
  | "Match"
  | "Likely Match"
  | "Mismatch"
  | "Missing"
  | "Needs Human Review";

export interface ComparisonResult {
  key: FieldKey;
  label: string;
  applicationValue: string;
  extractedValue: string;
  normalizedApplication: string;
  normalizedExtracted: string;
  category: ComparisonCategory;
  confidence: number;
  needsHumanReview: boolean;
  reason: string;
}

export interface WarningValidationResult {
  status: "Pass" | "Fail";
  confidence: number;
  exactWarningTextMatch: boolean;
  uppercaseHeadingPresent: boolean;
  applicationValue: string;
  extractedValue: string;
  notes: string[];
}

export interface AnalysisOutput {
  extractedFields: ExtractedField[];
  comparisons: ComparisonResult[];
  warningValidation: WarningValidationResult;
  analyzedAt: string;
}
