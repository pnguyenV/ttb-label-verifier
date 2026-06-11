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
import { ApplicationData, AnalysisOutput, FieldKey } from "@/types/label";
import { buildAnalysisOutput } from "@/lib/compare";

export default function Home() {
  const [applicationData, setApplicationData] =
    useState<ApplicationData>(EMPTY_APPLICATION_DATA);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisOutput | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setFileName(file.name);
    setPreviewUrl(localUrl);
    setErrorMessage(null);
  };

  const runMockAnalysis = async () => {
    if (!fileName) {
      setErrorMessage("Please upload one label image before running analysis.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      await new Promise((resolve) => {
        setTimeout(resolve, 900);
      });

      const output = buildAnalysisOutput(applicationData, MOCK_EXTRACTED_FIELDS);
      setAnalysisResults(output);
    } catch {
      setErrorMessage(
        "Unable to run mock analysis right now. Please try again in a moment.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Phase 1 prototype
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">
          AI-Powered Alcohol Label Verification App
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
          Compare application values against fields extracted from a label image.
          This prototype uses mocked extraction output for fast review workflows.
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
            onRunMockAnalysis={runMockAnalysis}
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
        />
      </main>
    </div>
  );
}
