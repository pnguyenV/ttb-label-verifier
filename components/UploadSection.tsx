"use client";

import Image from "next/image";

interface UploadSectionProps {
  fileName: string | null;
  previewUrl: string | null;
  isAnalyzing: boolean;
  onFileChange: (file: File | null) => void;
  onRunAnalysis: () => void;
}

export default function UploadSection({
  fileName,
  previewUrl,
  isAnalyzing,
  onFileChange,
  onRunAnalysis,
}: UploadSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 border-t-4 border-t-[#003A70] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">1. Upload label image</h2>
          <p className="text-sm text-slate-600">
            Upload one beverage label image to review against the application data.
          </p>
        </div>
      </div>

      <label
        htmlFor="label-image"
        className="mb-3 block text-sm font-medium text-slate-700"
      >
        Label image
      </label>
      <input
        id="label-image"
        type="file"
        accept="image/*"
        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        aria-describedby="upload-help"
      />
      <p id="upload-help" className="mt-2 text-xs text-slate-500">
        Supported formats: JPG, PNG, WEBP. Maximum recommended size: 10MB.
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Sample Labels:{" "}
        <a
          href="/sample-images/stoneThrowWine.png"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-slate-800 hover:underline"
        >
          Label 1
        </a>{" "}
        |{" "}
        <a
          href="/sample-images/stoneThrowWine1.png"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-slate-800 hover:underline"
        >
          Label 2
        </a>
      </p>

      <div className="mt-4 min-h-44 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
        {previewUrl ? (
          <div className="relative h-52 w-full overflow-hidden rounded-lg">
            <Image
              src={previewUrl}
              alt="Preview of uploaded label"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
        ) : (
          <div className="flex h-52 items-center justify-center text-center text-sm text-slate-500">
            No image uploaded yet.
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRunAnalysis}
          className="rounded-lg bg-[#004C97] px-4 py-2 text-sm font-medium text-white hover:bg-[#003A70] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "Running analysis..." : "Run analysis"}
        </button>
        <p className="text-sm text-slate-600">
          {fileName ? `Selected file: ${fileName}` : "No file selected"}
        </p>
      </div>
    </section>
  );
}
