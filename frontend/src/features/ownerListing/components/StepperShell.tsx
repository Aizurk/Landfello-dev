import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface StepperShellProps {
  step: number;
  title: string;
  description?: string;
  continueLabel?: string;
  onBack?: () => void;
  onSaveExit?: () => void;
  onContinue?: () => void;
  continueDisabled?: boolean;
  saving?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  children: ReactNode;
  className?: string;
  totalSteps?: number;
}

export function StepperShell({
  step,
  title,
  description,
  continueLabel = "Continue",
  onBack,
  onSaveExit,
  onContinue,
  continueDisabled = false,
  saving = false,
  secondaryLabel,
  onSecondary,
  children,
  className,
  totalSteps = 10,
}: StepperShellProps) {
  const clampedStep = Math.min(Math.max(step, 1), totalSteps);
  const progress = (clampedStep / totalSteps) * 100;

  return (
    <div className={cn("min-h-screen bg-[#f7f8f6] pb-[88px]", className)}>
      <header className="sticky top-0 z-30 border-b border-emerald-900/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-[calc(100%-32px)] max-w-[900px] items-center justify-between gap-3 py-3">
          <Button
            type="button"
            variant="ghost"
            className="rounded-2xl px-3 text-emerald-950"
            onClick={onBack}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-center text-sm font-semibold text-emerald-950 sm:text-base">
            Create Owner Listing
          </h1>
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl text-xs sm:text-sm"
            onClick={onSaveExit}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              "Save and exit"
            )}
          </Button>
        </div>
      </header>

      <main className="mx-auto w-[calc(100%-32px)] max-w-[900px] pt-4 sm:pt-5">
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
              Step {clampedStep} of {totalSteps}
            </p>
            <p className="text-xs font-medium text-emerald-950/50">
              {Math.round(progress)}%
            </p>
          </div>
          <Progress value={progress} className="mt-2 h-2" />
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold tracking-tight text-emerald-950 sm:text-2xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-snug text-emerald-950/65">
              {description}
            </p>
          ) : null}
        </div>

        {/* Height follows content only — no stretch / no large bottom pad */}
        <div className="mt-6 rounded-3xl border border-emerald-900/10 bg-white px-5 pb-5 pt-5 shadow-sm sm:px-7 sm:pb-6 sm:pt-6 md:px-8">
          {children}
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 h-[88px] border-t border-emerald-900/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-full w-[calc(100%-32px)] max-w-[900px] items-center justify-end gap-3">
          {secondaryLabel && onSecondary ? (
            <Button
              type="button"
              variant="ghost"
              className="mr-auto rounded-2xl"
              onClick={onSecondary}
              disabled={saving}
            >
              {secondaryLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            className={cn(
              "min-w-[150px] rounded-2xl bg-emerald-900 px-6 text-white hover:bg-emerald-900/90",
              "w-full sm:w-auto"
            )}
            onClick={onContinue}
            disabled={continueDisabled || saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                {continueLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
