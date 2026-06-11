import { WarningValidationResult } from "@/types/label";

interface WarningValidationCardProps {
  validation: WarningValidationResult;
}

export default function WarningValidationCard({
  validation,
}: WarningValidationCardProps) {
  const passed = validation.status === "Pass";

  return (
    <article
      className={`rounded-xl border p-4 ${
        passed ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50"
      }`}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Government Warning Validation
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              passed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
            }`}
          >
            {validation.status}
          </span>
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            Confidence {Math.round(validation.confidence * 100)}%
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
        <p>
          Exact warning text: <strong>{validation.exactWarningTextMatch ? "Pass" : "Fail"}</strong>
        </p>
        <p>
          Uppercase heading: <strong>{validation.uppercaseHeadingPresent ? "Pass" : "Fail"}</strong>
        </p>
      </div>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {validation.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </article>
  );
}