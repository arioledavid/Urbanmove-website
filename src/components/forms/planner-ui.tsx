"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const;
export const SECTION_TRANSITION = {
  duration: 0.4,
  ease: PREMIUM_EASE,
} as const;

/** How long the step-complete reward stays visible before exit + advance. */
export const STEP_REWARD_HOLD_MS = 900;
/** Exit fade duration before the next step mounts. */
export const STEP_REWARD_EXIT_MS = 350;

export const inputBaseClasses =
  "w-full rounded-xl border bg-paper px-4 py-3 text-sm text-ink transition-colors duration-200 outline-none focus:ring-0";

export function inputClasses(hasError?: boolean) {
  return cn(
    inputBaseClasses,
    hasError
      ? "border-primary focus:border-primary"
      : "border-border focus:border-primary",
    "placeholder:text-subtle",
  );
}

export const labelClasses = "mb-2 block text-sm font-medium text-ink";

type FieldProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  optionalHint?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export function Field({
  label,
  htmlFor,
  required,
  optionalHint,
  error,
  children,
  className,
}: FieldProps) {
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className={className}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
          {required ? <span className="text-primary"> *</span> : null}
        </label>
        {optionalHint ? <OptionalBadge /> : null}
      </div>
      {children}
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-primary">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function OptionalBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
      Helps us quote more accurately
    </span>
  );
}

type ChipOption = { id: string; label: string };

type ChipGroupProps = {
  options: readonly ChipOption[];
  value: string | null;
  onChange: (id: string) => void;
  error?: string;
  ariaLabel: string;
  idPrefix: string;
};

export function ChipGroup({
  options,
  value,
  onChange,
  error,
  ariaLabel,
  idPrefix,
}: ChipGroupProps) {
  return (
    <div>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={ariaLabel}
        aria-describedby={error ? `${idPrefix}-error` : undefined}
      >
        {options.map((option) => {
          const isActive = value === option.id;
          return (
            <button
              key={option.id}
              id={`${idPrefix}-${option.id}`}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.id)}
              className={cn(
                "min-h-11 rounded-full border px-4 py-2.5 text-sm font-medium transition-[transform,colors,background-color,border-color] duration-200 active:scale-[0.97]",
                isActive
                  ? "scale-[1.02] border-primary bg-primary/10 text-ink shadow-sm"
                  : error
                    ? "border-primary/60 bg-surface text-muted hover:border-primary hover:text-ink"
                    : "border-border bg-surface text-muted hover:border-muted hover:text-ink",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error ? (
        <p
          id={`${idPrefix}-error`}
          role="alert"
          className="mt-2 text-sm text-primary"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

type MultiChipGroupProps = {
  options: readonly ChipOption[];
  values: string[];
  onChange: (values: string[]) => void;
  ariaLabel: string;
  idPrefix: string;
};

export function MultiChipGroup({
  options,
  values,
  onChange,
  ariaLabel,
  idPrefix,
}: MultiChipGroupProps) {
  const toggle = (id: string) => {
    if (values.includes(id)) {
      onChange(values.filter((value) => value !== id));
      return;
    }
    onChange([...values, id]);
  };

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isActive = values.includes(option.id);
        return (
          <button
            key={option.id}
            id={`${idPrefix}-${option.id}`}
            type="button"
            aria-pressed={isActive}
            onClick={() => toggle(option.id)}
            className={cn(
              "min-h-11 rounded-full border px-4 py-2.5 text-sm font-medium transition-[transform,colors,background-color,border-color] duration-200 active:scale-[0.97]",
              isActive
                ? "scale-[1.02] border-primary bg-primary/10 text-ink shadow-sm"
                : "border-border bg-surface text-muted hover:border-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type ProgressStepperProps = {
  steps: readonly { id: string; label: string }[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
  ariaLabel: string;
};

export function ProgressStepper({
  steps,
  currentIndex,
  onStepClick,
  ariaLabel,
}: ProgressStepperProps) {
  const reduceMotion = useReducedMotion();
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">
          Step {currentIndex + 1} of {steps.length}
        </p>
        <p className="text-xs text-subtle">{steps[currentIndex]?.label}</p>
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-surface"
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label={ariaLabel}
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.45, ease: PREMIUM_EASE }
          }
        />
      </div>

      <nav aria-label={ariaLabel}>
        <ol className="flex flex-wrap gap-2">
          {steps.map((step, index) => {
            const isActive = index === currentIndex;
            const isComplete = index < currentIndex;

            return (
              <li key={step.id}>
                <button
                  type="button"
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`${step.label}${isComplete ? ", completed" : ""}`}
                  onClick={() => onStepClick?.(index)}
                  disabled={!onStepClick}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-[transform,colors] duration-200",
                    onStepClick ? "cursor-pointer active:scale-[0.97]" : "cursor-default",
                    isActive
                      ? "border-primary bg-primary/10 text-ink"
                      : isComplete
                        ? "border-border bg-paper text-ink"
                        : "border-border bg-surface text-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                      isActive
                        ? "bg-primary text-paper"
                        : isComplete
                          ? "bg-primary/15 text-primary"
                          : "bg-surface text-muted",
                    )}
                    aria-hidden
                  >
                    {isComplete ? "✓" : index + 1}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

type QuoteAccuracyProps = {
  filled: number;
  total: number;
};

export function QuoteAccuracy({ filled, total }: QuoteAccuracyProps) {
  if (total === 0) return null;

  const ratio = filled / total;
  const level =
    ratio >= 0.75 ? "Best" : ratio >= 0.4 ? "Great" : filled > 0 ? "Good" : null;

  if (!level) return null;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
      <span className="text-xs text-subtle">Quote accuracy:</span>
      <span className="text-xs font-semibold text-ink">{level}</span>
      <div className="ml-auto flex gap-1" aria-hidden>
        {(["Good", "Great", "Best"] as const).map((step) => {
          const active =
            step === level ||
            (step === "Good" && (level === "Great" || level === "Best")) ||
            (step === "Great" && level === "Best");
          return (
            <span
              key={step}
              className={cn(
                "h-1.5 w-6 rounded-full transition-colors duration-300",
                active ? "bg-primary" : "bg-border",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

type StepRewardProps = {
  show: boolean;
};

export function StepReward({ show }: StepRewardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.4, ease: PREMIUM_EASE }}
          className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-ink"
          role="status"
        >
          <motion.span
            aria-hidden
            initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: PREMIUM_EASE, delay: 0.08 }}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-paper"
          >
            <motion.span
              initial={reduceMotion ? false : { scale: 1 }}
              animate={{ scale: [1, 1.12, 1] }}
              transition={{
                duration: 0.55,
                ease: PREMIUM_EASE,
                delay: 0.35,
              }}
            >
              ✓
            </motion.span>
          </motion.span>
          Step complete — nice work
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type LiftToggleProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function LiftToggle({ id, label, checked, onChange }: LiftToggleProps) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3 transition-colors duration-200 has-focus-visible:border-primary"
    >
      <span className="text-sm text-ink">{label}</span>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className="absolute inset-0 rounded-full border border-border bg-surface transition-colors duration-200 peer-checked:border-primary/50 peer-checked:bg-primary/10 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40"
          aria-hidden
        />
        <span
          className="absolute left-0.5 h-5 w-5 rounded-full bg-subtle transition-transform duration-200 ease-out peer-checked:translate-x-5 peer-checked:bg-primary"
          aria-hidden
        />
      </span>
    </label>
  );
}

type AccordionProps = {
  title: string;
  children: React.ReactNode;
};

export function Accordion({ title, children }: AccordionProps) {
  return (
    <details className="group rounded-xl border border-border bg-surface">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
        {title}
        <span
          className="text-subtle transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        >
          ▾
        </span>
      </summary>
      <div className="space-y-3 border-t border-border px-4 py-4">{children}</div>
    </details>
  );
}

type CheckboxFieldProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: CheckboxFieldProps) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-1 py-1 text-sm text-ink transition-colors duration-200 has-focus-visible:text-primary"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 rounded border-border bg-paper text-primary focus:ring-2 focus:ring-primary/40 focus:ring-offset-0"
      />
      {label}
    </label>
  );
}

type WizardNavProps = {
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  showContinue?: boolean;
  backDisabled?: boolean;
  continueDisabled?: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
  isFinalStep?: boolean;
};

export function WizardNav({
  onBack,
  onContinue,
  continueLabel = "Continue",
  showContinue = true,
  backDisabled,
  continueDisabled,
  isSubmitting,
  submitLabel = "Request Secure Quote",
  isFinalStep,
}: WizardNavProps) {
  return (
    <div className="flex justify-between gap-3 pt-1">
      {onBack ? (
        <button
          type="button"
          disabled={backDisabled}
          onClick={onBack}
          className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-medium text-ink transition-colors duration-200 hover:border-muted disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]"
        >
          Back
        </button>
      ) : (
        <span />
      )}

      {showContinue ? (
        isFinalStep ? (
          <button
            type="submit"
            disabled={isSubmitting || continueDisabled}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-paper transition-colors duration-200 hover:bg-primary-hover active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60"
          >
            {isSubmitting ? "Sending request…" : submitLabel}
          </button>
        ) : (
          <button
            type="button"
            disabled={continueDisabled}
            onClick={onContinue}
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-paper transition-colors duration-200 hover:bg-primary-hover active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60"
          >
            {continueLabel}
          </button>
        )
      ) : null}
    </div>
  );
}

export function SuccessCheckmark() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: PREMIUM_EASE }}
      className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
      aria-hidden
    >
      <motion.svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: PREMIUM_EASE, delay: 0.1 }}
      >
        <motion.path
          d="M8 16.5L14 22.5L24 10.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: PREMIUM_EASE, delay: 0.15 }}
        />
      </motion.svg>
    </motion.div>
  );
}

export function ConfettiBurst() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  const particles = Array.from({ length: 12 }, (_, index) => index);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((particle) => (
        <motion.span
          key={particle}
          className="absolute left-1/2 top-1/3 h-1.5 w-1.5 rounded-full bg-primary"
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: (particle % 2 === 0 ? 1 : -1) * (40 + particle * 8),
            y: -30 - particle * 6,
            scale: 0,
          }}
          transition={{ duration: 0.8, ease: PREMIUM_EASE, delay: particle * 0.02 }}
        />
      ))}
    </div>
  );
}
