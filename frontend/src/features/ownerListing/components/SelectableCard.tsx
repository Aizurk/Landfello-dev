import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SelectableCardProps {
  title: string;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export function SelectableCard({
  title,
  description,
  selected = false,
  disabled = false,
  onClick,
  className,
  children,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex h-full min-h-[112px] w-full cursor-pointer items-start gap-4 rounded-2xl border-2 bg-white px-5 py-4 text-left transition-all sm:py-5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-900 focus-visible:ring-offset-2",
        selected
          ? "border-emerald-900 bg-emerald-50/60 shadow-sm"
          : "border-emerald-900/15 hover:border-emerald-900/30 hover:bg-emerald-50/20",
        disabled &&
          "cursor-not-allowed opacity-50 hover:border-emerald-900/15 hover:bg-white",
        className
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          selected
            ? "border-emerald-900 bg-emerald-900"
            : "border-emerald-900/25 bg-white"
        )}
        aria-hidden
      >
        {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-emerald-950 sm:font-bold">
          {title}
        </div>
        {description ? (
          <p className="mt-1 text-xs leading-snug text-emerald-950/55 sm:text-[13px]">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </button>
  );
}
