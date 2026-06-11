import { ApplicationData, ExtractedFieldMap } from "@/types/label";

export const EMPTY_APPLICATION_DATA: ApplicationData = {
  brandName: "",
  classTypeDesignation: "",
  alcoholContent: "",
  netContents: "",
  producerBottlerName: "",
  countryOfOrigin: "",
  governmentWarning: "",
};

export const DEMO_APPLICATION_DATA: ApplicationData = {
  brandName: "Stone's Throw",
  classTypeDesignation: "Red Wine",
  alcoholContent: "13.5% Alc/Vol",
  netContents: "750 mL",
  producerBottlerName: "Stone's Throw Cellars",
  countryOfOrigin: "United States",
  governmentWarning:
    "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.",
};

export const MOCK_EXTRACTED_FIELDS: ExtractedFieldMap = {
  brandName: {
    value: "STONE'S THROW",
    confidence: 0.97,
  },
  classTypeDesignation: {
    value: "Red table wine",
    confidence: 0.74,
  },
  alcoholContent: {
    value: "13.5% alc vol",
    confidence: 0.95,
  },
  netContents: {
    value: "750ML",
    confidence: 0.92,
  },
  producerBottlerName: {
    value: "Stones Throw Cellars",
    confidence: 0.82,
  },
  countryOfOrigin: {
    value: "USA",
    confidence: 0.68,
  },
  governmentWarning: {
    value:
      "Government Warning: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.",
    confidence: 0.88,
  },
};
