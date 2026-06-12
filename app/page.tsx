"use client";

import { useEffect, useMemo, useState } from "react";
import ApplicationForm from "@/components/ApplicationForm";
import ResultsPanel from "@/components/ResultsPanel";
import UploadForm from "@/components/UploadForm";
import {
  DEMO_APPLICATION_DATA,
  EMPTY_APPLICATION_DATA,
  MOCK_EXTRACTED_FIELDS,
} from "@/data/mockData";
import {
  ApplicationData,
  AnalysisOutput,
  ExtractedFieldMap,
  FieldKey,
} from "@/types/label";
import { buildAnalysisOutput } from "@/lib/compare";

type ExtractionSource = "openai" | "mock-fallback";

const EXTRACTION_KEYS: FieldKey[] = [
  "brandName",
  "classTypeDesignation",
  "alcoholContent",
  "netContents",
  "producerBottlerName",
  "countryOfOrigin",
  "governmentWarning",
];

function toExtractedFieldMap(payload: unknown): ExtractedFieldMap {
  if (!payload || typeof payload !== "object") {
    throw new Error("Received invalid extraction payload.");
  }

  const candidate = payload as Record<string, unknown>;
  const extracted = {} as ExtractedFieldMap;

  for (const key of EXTRACTION_KEYS) {
    const entry = candidate[key];

    if (!entry || typeof entry !== "object") {
      extracted[key] = null;
      continue;
    }

    const valueCandidate = (entry as Record<string, unknown>).value;
    const confidenceCandidate = (entry as Record<string, unknown>).confidence;

    extracted[key] = {
      value: typeof valueCandidate === "string" ? valueCandidate : "",
      confidence:
        typeof confidenceCandidate === "number" &&
        Number.isFinite(confidenceCandidate)
          ? Math.max(0, Math.min(1, confidenceCandidate))
          : 0,
    };
  }

  return extracted;
}

export default function Home() {
  const [applicationData, setApplicationData] =
    useState<ApplicationData>(EMPTY_APPLICATION_DATA);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisOutput | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractionSource, setExtractionSource] =
    useState<ExtractionSource | null>(null);

  const allowMockFallback =
    process.env.NEXT_PUBLIC_USE_MOCK_EXTRACTION === "true" ||
    process.env.NODE_ENV !== "production";

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const completionHint = useMemo(() => {
    const filledCount = Object.values(applicationData).filter(
      (value) => value.trim().length > 0,
    ).length;

    return `${filledCount}/7 application fields entered`;
  }, [applicationData]);

  const handleFieldChange = (key: FieldKey, value: string) => {
    setApplicationData((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleUseDemoData = () => {
    setApplicationData(DEMO_APPLICATION_DATA);
    setErrorMessage(null);
  };

  const handleFileChange = (file: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (!file) {
      setFileName(null);
      setPreviewUrl(null);
      setSelectedFile(null);
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setFileName(file.name);
    setPreviewUrl(localUrl);
    setSelectedFile(file);
    setErrorMessage(null);
  };

  const runAnalysis = async () => {
    if (!selectedFile) {
      setErrorMessage("Please upload one label image before running analysis.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setExtractionSource(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof body?.error === "string"
            ? body.error
            : "Unable to extract fields from the uploaded image.",
        );
      }

      const extractedFields = toExtractedFieldMap(body);
      const output = buildAnalysisOutput(applicationData, extractedFields);
      setAnalysisResults(output);
      setExtractionSource("openai");
    } catch (error) {
      if (allowMockFallback) {
        const output = buildAnalysisOutput(applicationData, MOCK_EXTRACTED_FIELDS);
        setAnalysisResults(output);
        setExtractionSource("mock-fallback");
        setErrorMessage(
          "AI extraction is currently unavailable. Showing development fallback results.",
        );
        return;
      }

      setExtractionSource(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to run extraction right now. Please try again in a moment.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">

        <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">
          Alcohol Label Verification App  -  Phase 1/Prototype
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
          3 steps to comparing application values against a label image.
        </p>
        <div className="mt-3 inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
          {completionHint}
        </div>
      </header>

      <main className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="space-y-5">
          <UploadForm
            fileName={fileName}
            previewUrl={previewUrl}
            isAnalyzing={isAnalyzing}
            onFileChange={handleFileChange}
            onRunAnalysis={runAnalysis}
          />
          <ApplicationForm
            data={applicationData}
            onFieldChange={handleFieldChange}
            onUseDemoData={handleUseDemoData}
          />
        </div>

        <ResultsPanel
          results={analysisResults}
          isAnalyzing={isAnalyzing}
          errorMessage={errorMessage}
          extractionSource={extractionSource}
        />
      </main>
    </div>
  );
}
