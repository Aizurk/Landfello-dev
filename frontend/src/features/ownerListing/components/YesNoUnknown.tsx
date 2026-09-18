import { cn } from "@/lib/utils";

export type YesNoUnknownValue = "yes" | "no" | "unknown";

export interface YesNoUnknownProps {
  value?: YesNoUnknownValue | null;
  onChange: (value: YesNoUnknownValue) => void;
  labels?: Partial<Record<YesNoUnknownValue, string>>;
  className?: string;
  disabled?: boolean;
}

const DEFAULT_LABELS: Record<YesNoUnknownValue, string> = {
  yes: "Yes",
  no: "No",
  unknown: "Unsure",
};

const OPTIONS: YesNoUnknownValue[] = ["yes", "no", "unknown"];

export function YesNoUnknown({
  value,
  onChange,
  labels,
  className,
  disabled = false,
}: YesNoUnknownProps) {
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-2 rounded-2xl bg-emerald-900/5 p-1.5",
        className
      )}
      role="group"
    >
      {OPTIONS.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option)}
            aria-pressed={selected}
            className={cn(
              "rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-900 focus-visible:ring-offset-1",
              selected
                ? "bg-emerald-900 text-white shadow-sm"
                : "bg-transparent text-emerald-950/70 hover:bg-white/70 hover:text-emerald-950",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {resolvedLabels[option]}
          </button>
        );
      })}
    </div>
  );
}
