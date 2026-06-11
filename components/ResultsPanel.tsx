import { AnalysisOutput, ComparisonCategory, ComparisonResult } from "@/types/label";
import WarningValidationCard from "@/components/WarningValidationCard";

interface ResultsPanelProps {
  results: AnalysisOutput | null;
  isAnalyzing: boolean;
  errorMessage: string | null;
}

function categoryStyles(category: ComparisonCategory): string {
  switch (category) {
    case "Match":
      return "bg-emerald-100 text-emerald-800";
    case "Likely Match":
      return "bg-blue-100 text-blue-800";
    case "Mismatch":
      return "bg-rose-100 text-rose-800";
    case "Missing":
      return "bg-slate-200 text-slate-700";
    case "Needs Human Review":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function confidenceTone(confidence: number): string {
  if (confidence >= 0.9) {
    return "bg-emerald-100 text-emerald-800";
  }
  if (confidence >= 0.75) {
    return "bg-blue-100 text-blue-800";
  }
  if (confidence >= 0.6) {
    return "bg-amber-100 text-amber-800";
  }
  return "bg-rose-100 text-rose-800";
}

function ReviewFlag({ result }: { result: ComparisonResult }) {
  if (!result.needsHumanReview) {
    return <span className="text-xs text-slate-500">No manual review flag</span>;
  }

  return (
    <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
      Human review recommended
    </span>
  );
}

export default function ResultsPanel({
  results,
  isAnalyzing,
  errorMessage,
}: ResultsPanelProps) {
  const warningValidation = results?.warningValidation;
  const nonWarningComparisons =
    results?.comparisons.filter((item) => item.key !== "governmentWarning") ?? [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          3. Review extracted fields and comparison results
        </h2>
        <p className="text-sm text-slate-600">
          This prototype is a decision-support tool. Final legal determination
          requires human compliance review.
        </p>
      </div>

      {isAnalyzing && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Running mock extraction and comparison...
        </div>
      )}

      {!isAnalyzing && errorMessage && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {errorMessage}
        </div>
      )}

      {!isAnalyzing && !errorMessage && !results && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
          No analysis yet. Upload a label image, enter application values, and run
          mock analysis.
        </div>
      )}

      {!isAnalyzing && results && (
        <div className="space-y-5">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Field</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">
                    Application value
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">
                    Extracted value
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Result</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {nonWarningComparisons.map((row) => (
                  <tr key={row.key}>
                    <td className="px-3 py-3 align-top font-medium text-slate-900">{row.label}</td>
                    <td className="px-3 py-3 align-top text-slate-700">{row.applicationValue || "-"}</td>
                    <td className="px-3 py-3 align-top text-slate-700">{row.extractedValue || "-"}</td>
                    <td className="px-3 py-3 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${categoryStyles(
                          row.category,
                        )}`}
                      >
                        {row.category}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${confidenceTone(
                          row.confidence,
                        )}`}
                      >
                        {Math.round(row.confidence * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3">
            {nonWarningComparisons.map((row) => (
              <article
                key={`${row.key}-reason`}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{row.label}</p>
                  <ReviewFlag result={row} />
                </div>
                <p className="text-sm text-slate-700">{row.reason}</p>
                <p className="mt-2 text-xs text-slate-600">
                  Normalized values: app={"'"}
                  {row.normalizedApplication || "(empty)"}
                  {"'"}; extracted={"'"}
                  {row.normalizedExtracted || "(empty)"}
                  {"'"}
                </p>
              </article>
            ))}
          </div>

          {warningValidation && <WarningValidationCard validation={warningValidation} />}
        </div>
      )}
    </section>
  );
}
