"use client";

import { ApplicationData, FieldKey, REQUIRED_FIELD_LABELS } from "@/types/label";

interface ApplicationFormProps {
  data: ApplicationData;
  onFieldChange: (key: FieldKey, value: string) => void;
  onUseDemoData: () => void;
}

const TEXTAREA_FIELDS: FieldKey[] = ["governmentWarning"];

export default function ApplicationForm({
  data,
  onFieldChange,
  onUseDemoData,
}: ApplicationFormProps) {
  const keys = Object.keys(REQUIRED_FIELD_LABELS) as FieldKey[];

  return (
    <section className="rounded-2xl border border-slate-200 border-t-4 border-t-[#003A70] bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">2. Enter application data</h2>
          <p className="text-sm text-slate-600">
            Enter the Application text that should match the label.
          </p>
        </div>
        <button
          type="button"
          onClick={onUseDemoData}
          className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"


        >
          Use demo data
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {keys.map((key) => {
          const label = REQUIRED_FIELD_LABELS[key];
          const inputId = `field-${key}`;
          const isTextarea = TEXTAREA_FIELDS.includes(key);

          if (isTextarea) {
            return (
              <div key={key} className="md:col-span-2">
                <label
                  htmlFor={inputId}
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  {label}
                </label>
                <textarea
                  id={inputId}
                  value={data[key]}
                  onChange={(event) => onFieldChange(key, event.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
              </div>
            );
          }

          return (
            <div key={key}>
              <label
                htmlFor={inputId}
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                {label}
              </label>
              <input
                id={inputId}
                value={data[key]}
                onChange={(event) => onFieldChange(key, event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
