"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useRef, useState, type FormEvent } from "react";
import { getPlannerServiceFromSlug } from "@/lib/services-data";
import { cn } from "@/lib/utils";

const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const;
const SECTION_TRANSITION = {
  duration: 0.4,
  ease: PREMIUM_EASE,
} as const;

const SERVICES = [
  // { id: "cargo", label: "Cargo Services" },
  { id: "removal", label: "Removal Services" },
  { id: "courier", label: "Courier Service" },
] as const;

const FLOOR_OPTIONS = [
  "Ground",
  "Basement",
  "1st Floor",
  "2nd Floor",
  "3rd Floor",
  "4th Floor+",
] as const;

const REMOVAL_STEPS = [
  { id: "when", label: "When" },
  { id: "from", label: "Moving from" },
  { id: "to", label: "Moving to" },
  { id: "items", label: "Items" },
] as const;

type ServiceId = (typeof SERVICES)[number]["id"];
type RemovalStepId = (typeof REMOVAL_STEPS)[number]["id"];

type FormState = {
  name: string;
  email: string;
  contactNumber: string;
  service: ServiceId | null;
  origin: string;
  destination: string;
  weight: string;
  cargoDescription: string;
  moveDateTime: string;
  movingFromPostcode: string;
  movingFromFloor: string;
  movingFromLiftAccess: boolean;
  movingFromParkingNotes: string;
  movingToPostcode: string;
  movingToFloor: string;
  movingToLiftAccess: boolean;
  movingToParkingNotes: string;
  removalItems: string;
  additionalEndOfTenancyCleaning: boolean;
  additionalProfessionalPacking: boolean;
  additionalFurnitureDismantling: boolean;
  additionalMovingSupplies: boolean;
  additionalSecureStorage: boolean;
  additionalWasteRemoval: boolean;
  pickupPostcode: string;
  deliveryPostcode: string;
  parcelDescription: string;
  courierDateTime: string;
  gdprConsent: boolean;
};

type FormErrors = Partial<Record<keyof FormState | "service", string>>;

const INITIAL_FORM_STATE: FormState = {
  name: "",
  email: "",
  contactNumber: "",
  service: null,
  origin: "",
  destination: "",
  weight: "",
  cargoDescription: "",
  moveDateTime: "",
  movingFromPostcode: "",
  movingFromFloor: "",
  movingFromLiftAccess: false,
  movingFromParkingNotes: "",
  movingToPostcode: "",
  movingToFloor: "",
  movingToLiftAccess: false,
  movingToParkingNotes: "",
  removalItems: "",
  additionalEndOfTenancyCleaning: false,
  additionalProfessionalPacking: false,
  additionalFurnitureDismantling: false,
  additionalMovingSupplies: false,
  additionalSecureStorage: false,
  additionalWasteRemoval: false,
  pickupPostcode: "",
  deliveryPostcode: "",
  parcelDescription: "",
  courierDateTime: "",
  gdprConsent: false,
};

const SERVICE_FIELD_KEYS: Record<ServiceId, (keyof FormState)[]> = {
  // cargo: ["origin", "destination", "weight", "cargoDescription"],
  removal: [
    "moveDateTime",
    "movingFromPostcode",
    "movingFromFloor",
    "movingFromParkingNotes",
    "movingToPostcode",
    "movingToFloor",
    "movingToParkingNotes",
    "removalItems",
    "additionalEndOfTenancyCleaning",
    "additionalProfessionalPacking",
    "additionalFurnitureDismantling",
    "additionalMovingSupplies",
    "additionalSecureStorage",
    "additionalWasteRemoval",
  ],
  courier: [
    "pickupPostcode",
    "deliveryPostcode",
    "parcelDescription",
    "courierDateTime",
  ],
};

function clearServiceFields(service: ServiceId): Partial<FormState> {
  const patch: Partial<FormState> = {};
  for (const key of SERVICE_FIELD_KEYS[service]) {
    const value = INITIAL_FORM_STATE[key];
    (patch as Record<string, unknown>)[key] = Array.isArray(value)
      ? []
      : typeof value === "boolean"
        ? false
        : value;
  }
  if (service === "removal") {
    patch.movingFromLiftAccess = false;
    patch.movingToLiftAccess = false;
  }
  return patch;
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Please enter your name.";
  }

  if (!form.email.trim()) {
    errors.email = "Please enter your email so we can send your quote.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!form.contactNumber.trim()) {
    errors.contactNumber = "Please enter a contact number.";
  }

  if (!form.service) {
    errors.service = "Please select a service to continue.";
  }

  if (!form.gdprConsent) {
    errors.gdprConsent = "Please agree to the data processing terms.";
  }

  return errors;
}

const inputBaseClasses =
  "w-full rounded-xl border bg-paper px-4 py-3 text-sm text-ink transition-colors duration-200 outline-none focus:ring-0";

function inputClasses(hasError?: boolean) {
  return cn(
    inputBaseClasses,
    hasError
      ? "border-primary focus:border-primary"
      : "border-border focus:border-primary",
    "placeholder:text-subtle",
  );
}

const labelClasses = "mb-2 block text-sm font-medium text-ink";

type FieldProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
  className,
}: FieldProps) {
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelClasses}>
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-primary">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type ToggleProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function LiftToggle({ id, label, checked, onChange }: ToggleProps) {
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

const ADDITIONAL_SERVICE_OPTIONS = [
  {
    key: "additionalEndOfTenancyCleaning",
    label: "End of Tenancy Cleaning",
  },
  {
    key: "additionalProfessionalPacking",
    label: "Professional Packing Services",
  },
  {
    key: "additionalFurnitureDismantling",
    label: "Furniture Dismantling & Reassembly",
  },
  {
    key: "additionalMovingSupplies",
    label: "Moving Supplies (Boxes, Tape & Packing Materials)",
  },
  {
    key: "additionalSecureStorage",
    label: "Secure Storage Solutions",
  },
  {
    key: "additionalWasteRemoval",
    label: "Waste Removal (SEPA Licensed)",
  },
] as const satisfies ReadonlyArray<{
  key: keyof FormState;
  label: string;
}>;

type AdditionalServicesAccordionProps = {
  form: FormState;
  formId: string;
  updateField: <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => void;
};

function AdditionalServicesAccordion({
  form,
  formId,
  updateField,
}: AdditionalServicesAccordionProps) {
  return (
    <details className="group rounded-xl border border-border bg-surface">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
        Additional services
        <span
          className="text-subtle transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        >
          ▾
        </span>
      </summary>
      <div className="space-y-1 border-t border-border px-4 py-4">
        <p className="mb-3 text-sm leading-relaxed text-subtle">
          Optional add-ons for your move. Tick anything that applies and
          we&apos;ll include it in your quote.
        </p>
        {ADDITIONAL_SERVICE_OPTIONS.map((option) => (
          <label
            key={option.key}
            htmlFor={`${formId}-${option.key}`}
            className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-1 py-1 text-sm text-ink transition-colors duration-200 has-focus-visible:text-primary"
          >
            <input
              id={`${formId}-${option.key}`}
              type="checkbox"
              checked={form[option.key] as boolean}
              onChange={(event) =>
                updateField(option.key, event.target.checked as FormState[typeof option.key])
              }
              className="h-4 w-4 shrink-0 rounded border-border bg-paper text-primary focus:ring-2 focus:ring-primary/40 focus:ring-offset-0"
            />
            {option.label}
          </label>
        ))}
      </div>
    </details>
  );
}

type ConditionalSectionProps = {
  serviceKey: ServiceId;
  activeService: ServiceId | null;
  children: React.ReactNode;
};

function ConditionalSection({
  serviceKey,
  activeService,
  children,
}: ConditionalSectionProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return activeService === serviceKey ? (
      <div className="space-y-5">{children}</div>
    ) : null;
  }

  return (
    <AnimatePresence mode="wait">
      {activeService === serviceKey ? (
        <motion.div
          key={serviceKey}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={SECTION_TRANSITION}
          className="space-y-5"
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type RemovalFieldsProps = {
  form: FormState;
  formId: string;
  updateField: <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => void;
  clearError: (key: keyof FormErrors) => void;
  dateTimeClasses: string;
};

function RemovalFields({
  form,
  formId,
  updateField,
  clearError,
  dateTimeClasses,
}: RemovalFieldsProps) {
  const [step, setStep] = useState<RemovalStepId>("when");

  return (
    <div className="space-y-6">
      <nav aria-label="Removal details steps">
        <ol className="flex flex-wrap gap-2">
          {REMOVAL_STEPS.map((removalStep, index) => {
            const isActive = step === removalStep.id;
            const isComplete =
              REMOVAL_STEPS.findIndex((item) => item.id === step) > index;

            return (
              <li key={removalStep.id}>
                <button
                  type="button"
                  aria-current={isActive ? "step" : undefined}
                  onClick={() => setStep(removalStep.id)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 active:scale-[0.97]",
                    isActive
                      ? "border-primary bg-primary/10 text-ink"
                      : isComplete
                        ? "border-border bg-paper text-ink"
                        : "border-border bg-surface text-muted hover:border-muted hover:text-ink",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                      isActive
                        ? "bg-primary text-paper"
                        : "bg-surface text-muted",
                    )}
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  {removalStep.label}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: PREMIUM_EASE }}
        >
          {step === "when" ? (
            <Field
              label="Preferred move date / time"
              htmlFor="moveDateTime"
            >
              <input
                id="moveDateTime"
                type="datetime-local"
                value={form.moveDateTime}
                onChange={(event) => {
                  updateField("moveDateTime", event.target.value);
                  clearError("moveDateTime");
                }}
                className={dateTimeClasses}
              />
            </Field>
          ) : null}

          {step === "from" ? (
            <div className="space-y-4">
              <Field label="Post code" htmlFor="movingFromPostcode">
                <input
                  id="movingFromPostcode"
                  type="text"
                  value={form.movingFromPostcode}
                  onChange={(event) => {
                    updateField("movingFromPostcode", event.target.value);
                    clearError("movingFromPostcode");
                  }}
                  className={inputClasses()}
                  placeholder="e.g. SW1A 1AA"
                />
              </Field>

              <Field label="Property floor level" htmlFor="movingFromFloor">
                <select
                  id="movingFromFloor"
                  value={form.movingFromFloor}
                  onChange={(event) => {
                    updateField("movingFromFloor", event.target.value);
                    clearError("movingFromFloor");
                  }}
                  className={cn(inputClasses(), "cursor-pointer")}
                >
                  <option value="" className="bg-paper">
                    Select floor
                  </option>
                  {FLOOR_OPTIONS.map((floor) => (
                    <option key={floor} value={floor} className="bg-paper">
                      {floor}
                    </option>
                  ))}
                </select>
              </Field>

              <LiftToggle
                id="movingFromLiftAccess"
                label="Lift access available"
                checked={form.movingFromLiftAccess}
                onChange={(checked) =>
                  updateField("movingFromLiftAccess", checked)
                }
              />

              <Field
                label="Parking / access notes"
                htmlFor="movingFromParkingNotes"
              >
                <textarea
                  id="movingFromParkingNotes"
                  rows={3}
                  value={form.movingFromParkingNotes}
                  onChange={(event) => {
                    updateField("movingFromParkingNotes", event.target.value);
                    clearError("movingFromParkingNotes");
                  }}
                  className={cn(inputClasses(), "resize-none")}
                  placeholder="e.g. On-street parking only, residents' permit zone, loading bay 50m away"
                />
              </Field>
            </div>
          ) : null}

          {step === "to" ? (
            <div className="space-y-4">
              <Field label="Post code" htmlFor="movingToPostcode">
                <input
                  id="movingToPostcode"
                  type="text"
                  value={form.movingToPostcode}
                  onChange={(event) => {
                    updateField("movingToPostcode", event.target.value);
                    clearError("movingToPostcode");
                  }}
                  className={inputClasses()}
                  placeholder="e.g. E1 6AN"
                />
              </Field>

              <Field label="Property floor level" htmlFor="movingToFloor">
                <select
                  id="movingToFloor"
                  value={form.movingToFloor}
                  onChange={(event) => {
                    updateField("movingToFloor", event.target.value);
                    clearError("movingToFloor");
                  }}
                  className={cn(inputClasses(), "cursor-pointer")}
                >
                  <option value="" className="bg-paper">
                    Select floor
                  </option>
                  {FLOOR_OPTIONS.map((floor) => (
                    <option key={floor} value={floor} className="bg-paper">
                      {floor}
                    </option>
                  ))}
                </select>
              </Field>

              <LiftToggle
                id="movingToLiftAccess"
                label="Lift access available"
                checked={form.movingToLiftAccess}
                onChange={(checked) =>
                  updateField("movingToLiftAccess", checked)
                }
              />

              <Field
                label="Parking / access notes"
                htmlFor="movingToParkingNotes"
              >
                <textarea
                  id="movingToParkingNotes"
                  rows={3}
                  value={form.movingToParkingNotes}
                  onChange={(event) => {
                    updateField("movingToParkingNotes", event.target.value);
                    clearError("movingToParkingNotes");
                  }}
                  className={cn(inputClasses(), "resize-none")}
                  placeholder="e.g. Private driveway, narrow gate, council loading permit required"
                />
              </Field>
            </div>
          ) : null}

          {step === "items" ? (
            <div className="space-y-4">
              <Field label="List of items to be moved" htmlFor="removalItems">
                <textarea
                  id="removalItems"
                  rows={4}
                  value={form.removalItems}
                  onChange={(event) => {
                    updateField("removalItems", event.target.value);
                    clearError("removalItems");
                  }}
                  className={cn(inputClasses(), "resize-none")}
                  placeholder="Furniture, appliances, boxes. Include approximate quantities"
                />
              </Field>

              <AdditionalServicesAccordion
                form={form}
                formId={formId}
                updateField={updateField}
              />
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between gap-3 pt-1">
        <button
          type="button"
          disabled={step === "when"}
          onClick={() => {
            const index = REMOVAL_STEPS.findIndex((item) => item.id === step);
            if (index > 0) setStep(REMOVAL_STEPS[index - 1].id);
          }}
          className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-medium text-ink transition-colors duration-200 hover:border-muted disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]"
        >
          Back
        </button>
        {step !== "items" ? (
          <button
            type="button"
            onClick={() => {
              const index = REMOVAL_STEPS.findIndex((item) => item.id === step);
              if (index < REMOVAL_STEPS.length - 1) {
                setStep(REMOVAL_STEPS[index + 1].id);
              }
            }}
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-paper transition-colors duration-200 hover:bg-primary-hover active:scale-[0.97]"
          >
            Continue
          </button>
        ) : null}
      </div>
    </div>
  );
}

type InteractiveLogisticsPlannerProps = {
  initialServiceSlug?: string;
};

export function InteractiveLogisticsPlanner({
  initialServiceSlug,
}: InteractiveLogisticsPlannerProps = {}) {
  const reduceMotion = useReducedMotion();
  const formId = useId();
  const statusRef = useRef<HTMLDivElement>(null);
  const rawInitialService = initialServiceSlug
    ? getPlannerServiceFromSlug(initialServiceSlug)
    : null;
  const initialPlannerService =
    rawInitialService === "cargo" ? null : rawInitialService;
  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL_FORM_STATE,
    service: initialPlannerService,
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dateTimeClasses = cn(
    inputClasses(),
    "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100",
  );

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const clearError = (key: keyof FormErrors) => {
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const selectService = (serviceId: ServiceId) => {
    setForm((current) => {
      const next = { ...current, service: serviceId };
      if (current.service && current.service !== serviceId) {
        Object.assign(next, clearServiceFields(current.service));
      }
      return next;
    });
    clearError("service");
  };

  const focusFirstError = (nextErrors: FormErrors) => {
    const order: (keyof FormErrors)[] = [
      "name",
      "email",
      "contactNumber",
      "service",
      "gdprConsent",
    ];
    const firstKey = order.find((key) => nextErrors[key]);
    if (!firstKey) return;

    if (firstKey === "service") {
      document
        .getElementById(`${formId}-service-removal`)
        ?.focus();
      return;
    }

    if (firstKey === "gdprConsent") {
      document.getElementById(`${formId}-gdpr`)?.focus();
      return;
    }

    document.getElementById(String(firstKey))?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const count = Object.keys(nextErrors).length;
      setStatusMessage(
        count === 1
          ? "There is 1 field that needs your attention."
          : `There are ${count} fields that need your attention.`,
      );
      focusFirstError(nextErrors);
      statusRef.current?.focus();
      return;
    }

    if (!form.service) {
      return;
    }

    setErrors({});
    setStatusMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          payload?.error ??
            "We couldn't send your quote request. Please try again.",
        );
      }

      setSubmitted(true);
      setStatusMessage("Your quote request was sent successfully.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "We couldn't send your quote request. Please try again.",
      );
      statusRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <div ref={statusRef} tabIndex={-1} aria-live="polite" className="sr-only">
          {statusMessage}
        </div>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SECTION_TRANSITION}
          className="rounded-3xl border border-border bg-paper px-8 py-14 text-center shadow-sm sm:px-12"
        >
          <h3 className="text-2xl font-semibold tracking-tight text-ink">
            We&apos;ll be in touch shortly
          </h3>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-subtle">
            Thank you for your enquiry. Our team will review your details and
            respond with a secure quote as soon as possible.
          </p>
          <button
            type="button"
            onClick={() => {
              setForm(INITIAL_FORM_STATE);
              setErrors({});
              setStatusMessage("");
              setSubmitted(false);
            }}
            className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-medium text-ink transition-colors duration-200 hover:border-muted active:scale-[0.97]"
          >
            Submit another request
          </button>
        </motion.div>
      </>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-border bg-paper p-6 shadow-sm sm:p-8 lg:p-10"
    >
      <div
        ref={statusRef}
        tabIndex={-1}
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          "mb-6 rounded-xl border px-4 py-3 text-sm",
          statusMessage
            ? "border-primary/30 bg-primary/5 text-ink"
            : "sr-only",
        )}
      >
        {statusMessage}
      </div>
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" required error={errors.name}>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={form.name}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              onChange={(event) => {
                updateField("name", event.target.value);
                clearError("name");
              }}
              className={inputClasses(Boolean(errors.name))}
              placeholder="Your full name"
            />
          </Field>

          <Field label="Email" htmlFor="email" required error={errors.email}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              onChange={(event) => {
                updateField("email", event.target.value);
                clearError("email");
              }}
              className={inputClasses(Boolean(errors.email))}
              placeholder="you@example.com"
            />
          </Field>
        </div>

        <Field
          label="Contact number"
          htmlFor="contactNumber"
          required
          error={errors.contactNumber}
        >
          <input
            id="contactNumber"
            type="tel"
            autoComplete="tel"
            value={form.contactNumber}
            aria-invalid={Boolean(errors.contactNumber)}
            aria-describedby={
              errors.contactNumber ? "contactNumber-error" : undefined
            }
            onChange={(event) => {
              updateField("contactNumber", event.target.value);
              clearError("contactNumber");
            }}
            className={inputClasses(Boolean(errors.contactNumber))}
            placeholder="+44 7700 900000"
          />
        </Field>

        <fieldset>
          <legend className={labelClasses}>
            Service selection<span className="text-primary"> *</span>
          </legend>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-describedby={errors.service ? "service-error" : undefined}
          >
            {SERVICES.map((service) => {
              const isActive = form.service === service.id;

              return (
                <button
                  key={service.id}
                  id={`${formId}-service-${service.id}`}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => selectService(service.id)}
                  className={cn(
                    "min-h-11 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.97]",
                    isActive
                      ? "border-primary bg-primary/10 text-ink"
                      : errors.service
                        ? "border-primary/60 bg-surface text-muted hover:border-primary hover:text-ink"
                        : "border-border bg-surface text-muted hover:border-muted hover:text-ink",
                  )}
                >
                  {service.label}
                </button>
              );
            })}
          </div>
          {errors.service ? (
            <p id="service-error" role="alert" className="mt-2 text-sm text-primary">
              {errors.service}
            </p>
          ) : null}
        </fieldset>
      </div>

      <AnimatePresence mode="wait">
        {form.service ? (
          <motion.div
            key={form.service}
            initial={reduceMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={SECTION_TRANSITION}
            className="mt-8 border-t border-border pt-8"
          >
            {/* <ConditionalSection serviceKey="cargo" activeService={form.service}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Origin" htmlFor="origin">
                  <input
                    id="origin"
                    type="text"
                    value={form.origin}
                    onChange={(event) => updateField("origin", event.target.value)}
                    className={inputClasses()}
                    placeholder="Pickup location"
                  />
                </Field>

                <Field label="Destination" htmlFor="destination">
                  <input
                    id="destination"
                    type="text"
                    value={form.destination}
                    onChange={(event) =>
                      updateField("destination", event.target.value)
                    }
                    className={inputClasses()}
                    placeholder="Delivery location"
                  />
                </Field>
              </div>

              <Field label="Weight (kg)" htmlFor="weight">
                <input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.weight}
                  onChange={(event) => updateField("weight", event.target.value)}
                  className={inputClasses()}
                  placeholder="e.g. 250"
                />
              </Field>

              <Field label="What are you sending?" htmlFor="cargoDescription">
                <textarea
                  id="cargoDescription"
                  rows={4}
                  value={form.cargoDescription}
                  onChange={(event) =>
                    updateField("cargoDescription", event.target.value)
                  }
                  className={cn(inputClasses(), "resize-none")}
                  placeholder="Describe the cargo, dimensions, and any special handling requirements"
                />
              </Field>
            </ConditionalSection> */}

            <ConditionalSection serviceKey="removal" activeService={form.service}>
              <RemovalFields
                form={form}
                formId={formId}
                updateField={updateField}
                clearError={clearError}
                dateTimeClasses={dateTimeClasses}
              />
            </ConditionalSection>

            <ConditionalSection serviceKey="courier" activeService={form.service}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Pick up post code" htmlFor="pickupPostcode">
                  <input
                    id="pickupPostcode"
                    type="text"
                    value={form.pickupPostcode}
                    onChange={(event) =>
                      updateField("pickupPostcode", event.target.value)
                    }
                    className={inputClasses()}
                    placeholder="e.g. N1 9GU"
                  />
                </Field>

                <Field label="Delivery post code" htmlFor="deliveryPostcode">
                  <input
                    id="deliveryPostcode"
                    type="text"
                    value={form.deliveryPostcode}
                    onChange={(event) =>
                      updateField("deliveryPostcode", event.target.value)
                    }
                    className={inputClasses()}
                    placeholder="e.g. WC2H 9JQ"
                  />
                </Field>
              </div>

              <Field label="Parcel description" htmlFor="parcelDescription">
                <textarea
                  id="parcelDescription"
                  rows={4}
                  value={form.parcelDescription}
                  onChange={(event) =>
                    updateField("parcelDescription", event.target.value)
                  }
                  className={cn(inputClasses(), "resize-none")}
                  placeholder="Contents, dimensions, weight, and fragility"
                />
              </Field>

              <Field label="Preferred date / time" htmlFor="courierDateTime">
                <input
                  id="courierDateTime"
                  type="datetime-local"
                  value={form.courierDateTime}
                  onChange={(event) =>
                    updateField("courierDateTime", event.target.value)
                  }
                  className={dateTimeClasses}
                />
              </Field>
            </ConditionalSection>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mt-8 space-y-5 border-t border-border pt-8">
        <div>
          <label
            htmlFor={`${formId}-gdpr`}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-colors duration-200 has-focus-visible:border-primary"
          >
            <input
              id={`${formId}-gdpr`}
              type="checkbox"
              checked={form.gdprConsent}
              aria-invalid={Boolean(errors.gdprConsent)}
              aria-describedby={
                errors.gdprConsent ? `${formId}-gdpr-error` : `${formId}-gdpr-hint`
              }
              onChange={(event) => {
                updateField("gdprConsent", event.target.checked);
                clearError("gdprConsent");
              }}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-border bg-paper text-primary focus:ring-2 focus:ring-primary/40 focus:ring-offset-0"
            />
            <span className="text-sm leading-relaxed text-muted">
              <span className="block text-ink">
                I agree to my details being stored and used to prepare my quote.
                <span className="text-primary"> *</span>
              </span>
              <span id={`${formId}-gdpr-hint`} className="mt-1 block text-subtle">
                You can withdraw consent at any time by contacting us.
              </span>
            </span>
          </label>
          {errors.gdprConsent ? (
            <p
              id={`${formId}-gdpr-error`}
              role="alert"
              className="mt-2 text-sm text-primary"
            >
              {errors.gdprConsent}
            </p>
          ) : null}
        </div>

        <p className="text-xs text-subtle">
          Fields marked with * are required.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-paper transition-colors duration-200 hover:bg-primary-hover active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 sm:w-auto sm:min-w-[220px]"
        >
          <span className="relative z-10 px-8">
            {isSubmitting ? "Sending request…" : "Request Secure Quote"}
          </span>
        </button>
      </div>
    </form>
  );
}
