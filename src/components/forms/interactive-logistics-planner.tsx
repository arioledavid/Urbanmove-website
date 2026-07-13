"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Accordion,
  CheckboxField,
  ChipGroup,
  ConfettiBurst,
  Field,
  inputClasses,
  labelClasses,
  LiftToggle,
  MultiChipGroup,
  ProgressStepper,
  QuoteAccuracy,
  SECTION_TRANSITION,
  StepReward,
  SuccessCheckmark,
  STEP_REWARD_EXIT_MS,
  STEP_REWARD_HOLD_MS,
  WizardNav,
} from "@/components/forms/planner-ui";
import {
  CONTACT_PREFERENCES,
  COURIER_STEPS,
  COURIER_URGENCIES,
  FLOOR_OPTIONS,
  getRemovalChipFromSlug,
  ITEM_QUICK_PICKS,
  MOVE_SIZES,
  PLANNER_SERVICES,
  PROPERTY_TYPES,
  REMOVAL_SERVICE_CHIPS,
  REMOVAL_STEPS,
  SESSION_STORAGE_KEY,
  TIME_BANDS,
  type CourierStepId,
  type PlannerServiceId,
  type RemovalStepId,
} from "@/lib/quote-form-data";
import { getPlannerServiceFromSlug } from "@/lib/services-data";
import { buildQuoteSubmitBody } from "@/lib/quote-request";
import { cn } from "@/lib/utils";

type FormState = {
  name: string;
  email: string;
  contactNumber: string;
  contactPreference: string;
  service: PlannerServiceId | null;
  origin: string;
  destination: string;
  weight: string;
  cargoDescription: string;
  removalServiceChip: string | null;
  moveSize: string | null;
  moveDate: string;
  timeBand: string | null;
  movingFromPostcode: string;
  movingFromPropertyType: string;
  movingFromFloor: string;
  movingFromLiftAccess: boolean;
  movingFromAccessNotes: string;
  movingToPostcode: string;
  movingToPropertyType: string;
  movingToFloor: string;
  movingToLiftAccess: boolean;
  movingToAccessNotes: string;
  itemQuickPicks: string[];
  removalItemNotes: string;
  extraHelpTwoMovers: boolean;
  extraHelpThreeMovers: boolean;
  extraHelpDismantling: boolean;
  extraHelpPacking: boolean;
  extraHelpWrapping: boolean;
  extraHelpWaste: boolean;
  extraHelpStorage: boolean;
  pickupPostcode: string;
  deliveryPostcode: string;
  parcelDescription: string;
  courierDate: string;
  courierUrgency: string | null;
  gdprConsent: boolean;
};

type FormErrors = Partial<Record<keyof FormState | "service", string>>;

type PersistedState = {
  form: FormState;
  removalStep: RemovalStepId;
  courierStep: CourierStepId;
  sourceServiceSlug: string | null;
};

function applyServiceSlugPrefill(
  form: FormState,
  serviceSlug: string | undefined,
  plannerService: PlannerServiceId | null,
  removalChip: string | null,
): FormState {
  if (!serviceSlug || !plannerService) return form;

  const next = { ...form };

  if (next.service && next.service !== plannerService) {
    Object.assign(next, clearBranchFields(next.service));
  }

  next.service = plannerService;

  if (plannerService === "removal" && removalChip) {
    next.removalServiceChip = removalChip;
  }

  return next;
}

function buildFormStateFromSession(
  serviceSlug: string | undefined,
  plannerService: PlannerServiceId | null,
  removalChip: string | null,
): { form: FormState; removalStep: RemovalStepId; courierStep: CourierStepId } {
  const urlDriven = Boolean(serviceSlug && plannerService);

  if (typeof window === "undefined") {
    return {
      form: applyServiceSlugPrefill(
        {
          ...INITIAL_FORM_STATE,
          service: plannerService,
          removalServiceChip: removalChip,
        },
        serviceSlug,
        plannerService,
        removalChip,
      ),
      removalStep: "service-timing",
      courierStep: "details",
    };
  }

  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return {
        form: applyServiceSlugPrefill(
          {
            ...INITIAL_FORM_STATE,
            service: plannerService,
            removalServiceChip: removalChip,
          },
          serviceSlug,
          plannerService,
          removalChip,
        ),
        removalStep: "service-timing",
        courierStep: "details",
      };
    }

    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed?.form) {
      return {
        form: applyServiceSlugPrefill(
          {
            ...INITIAL_FORM_STATE,
            service: plannerService,
            removalServiceChip: removalChip,
          },
          serviceSlug,
          plannerService,
          removalChip,
        ),
        removalStep: "service-timing",
        courierStep: "details",
      };
    }

    const sameSource =
      !urlDriven || parsed.sourceServiceSlug === serviceSlug;

    const baseForm = sameSource
      ? { ...INITIAL_FORM_STATE, ...parsed.form }
      : { ...INITIAL_FORM_STATE };

    return {
      form: applyServiceSlugPrefill(
        baseForm,
        serviceSlug,
        plannerService,
        removalChip,
      ),
      removalStep: sameSource
        ? (parsed.removalStep ?? "service-timing")
        : "service-timing",
      courierStep: sameSource ? (parsed.courierStep ?? "details") : "details",
    };
  } catch {
    return {
      form: applyServiceSlugPrefill(
        {
          ...INITIAL_FORM_STATE,
          service: plannerService,
          removalServiceChip: removalChip,
        },
        serviceSlug,
        plannerService,
        removalChip,
      ),
      removalStep: "service-timing",
      courierStep: "details",
    };
  }
}

const INITIAL_FORM_STATE: FormState = {
  name: "",
  email: "",
  contactNumber: "",
  contactPreference: "",
  service: null,
  origin: "",
  destination: "",
  weight: "",
  cargoDescription: "",
  removalServiceChip: null,
  moveSize: null,
  moveDate: "",
  timeBand: null,
  movingFromPostcode: "",
  movingFromPropertyType: "",
  movingFromFloor: "",
  movingFromLiftAccess: false,
  movingFromAccessNotes: "",
  movingToPostcode: "",
  movingToPropertyType: "",
  movingToFloor: "",
  movingToLiftAccess: false,
  movingToAccessNotes: "",
  itemQuickPicks: [],
  removalItemNotes: "",
  extraHelpTwoMovers: false,
  extraHelpThreeMovers: false,
  extraHelpDismantling: false,
  extraHelpPacking: false,
  extraHelpWrapping: false,
  extraHelpWaste: false,
  extraHelpStorage: false,
  pickupPostcode: "",
  deliveryPostcode: "",
  parcelDescription: "",
  courierDate: "",
  courierUrgency: null,
  gdprConsent: false,
};

const REMOVAL_FIELD_KEYS: (keyof FormState)[] = [
  "removalServiceChip",
  "moveSize",
  "moveDate",
  "timeBand",
  "movingFromPostcode",
  "movingFromPropertyType",
  "movingFromFloor",
  "movingFromLiftAccess",
  "movingFromAccessNotes",
  "movingToPostcode",
  "movingToPropertyType",
  "movingToFloor",
  "movingToLiftAccess",
  "movingToAccessNotes",
  "itemQuickPicks",
  "removalItemNotes",
  "extraHelpTwoMovers",
  "extraHelpThreeMovers",
  "extraHelpDismantling",
  "extraHelpPacking",
  "extraHelpWrapping",
  "extraHelpWaste",
  "extraHelpStorage",
];

const COURIER_FIELD_KEYS: (keyof FormState)[] = [
  "pickupPostcode",
  "deliveryPostcode",
  "parcelDescription",
  "courierDate",
  "courierUrgency",
];

function clearBranchFields(service: PlannerServiceId): Partial<FormState> {
  const keys = service === "removal" ? REMOVAL_FIELD_KEYS : COURIER_FIELD_KEYS;
  const patch: Partial<FormState> = {};

  for (const key of keys) {
    const value = INITIAL_FORM_STATE[key];
    (patch as Record<string, unknown>)[key] = Array.isArray(value)
      ? []
      : typeof value === "boolean"
        ? false
        : value;
  }

  return patch;
}

const REMOVAL_ENCOURAGEMENT: Record<RemovalStepId, string> = {
  "service-timing":
    "Start with the basics, we'll tailor the quote around your move.",
  collection: "Where are we collecting from? Postcode is all we need to begin.",
  delivery: "Almost halfway, where should everything end up?",
  items: "Optional extras help us quote more accurately, but skip anything you're unsure about.",
  contact: "Almost there, just your contact details left.",
};

const COURIER_ENCOURAGEMENT: Record<CourierStepId, string> = {
  details: "Tell us about the parcel, we'll handle the rest.",
  contact: "Last step, how should we reach you with your quote?",
};

function validateRemovalStep(
  step: RemovalStepId,
  form: FormState,
): FormErrors {
  const errors: FormErrors = {};

  switch (step) {
    case "service-timing":
      if (!form.removalServiceChip) {
        errors.removalServiceChip = "Please select a service type.";
      }
      if (!form.moveSize) {
        errors.moveSize = "Please select a move size.";
      }
      if (!form.moveDate.trim()) {
        errors.moveDate = "Please choose a preferred move date.";
      }
      break;
    case "collection":
      if (!form.movingFromPostcode.trim()) {
        errors.movingFromPostcode = "Please enter the collection postcode.";
      }
      break;
    case "delivery":
      if (!form.movingToPostcode.trim()) {
        errors.movingToPostcode = "Please enter the delivery postcode.";
      }
      break;
    case "contact":
      if (!form.name.trim()) errors.name = "Please enter your name.";
      if (!form.email.trim()) {
        errors.email = "Please enter your email so we can send your quote.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        errors.email = "Please enter a valid email address.";
      }
      if (!form.contactNumber.trim()) {
        errors.contactNumber = "Please enter a contact number.";
      }
      if (!form.gdprConsent) {
        errors.gdprConsent = "Please agree to the data processing terms.";
      }
      break;
    default:
      break;
  }

  return errors;
}

function validateCourierStep(
  step: CourierStepId,
  form: FormState,
): FormErrors {
  const errors: FormErrors = {};

  switch (step) {
    case "details":
      if (!form.pickupPostcode.trim()) {
        errors.pickupPostcode = "Please enter the pickup postcode.";
      }
      if (!form.deliveryPostcode.trim()) {
        errors.deliveryPostcode = "Please enter the delivery postcode.";
      }
      if (!form.parcelDescription.trim()) {
        errors.parcelDescription = "Please describe the parcel.";
      }
      if (!form.courierDate.trim()) {
        errors.courierDate = "Please choose a preferred date.";
      }
      break;
    case "contact":
      if (!form.name.trim()) errors.name = "Please enter your name.";
      if (!form.email.trim()) {
        errors.email = "Please enter your email so we can send your quote.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        errors.email = "Please enter a valid email address.";
      }
      if (!form.contactNumber.trim()) {
        errors.contactNumber = "Please enter a contact number.";
      }
      if (!form.gdprConsent) {
        errors.gdprConsent = "Please agree to the data processing terms.";
      }
      break;
    default:
      break;
  }

  return errors;
}

function validateForm(form: FormState): FormErrors {
  if (!form.service) {
    return { service: "Please select a service to continue." };
  }

  if (form.service === "removal") {
    return {
      ...validateRemovalStep("service-timing", form),
      ...validateRemovalStep("collection", form),
      ...validateRemovalStep("delivery", form),
      ...validateRemovalStep("contact", form),
    };
  }

  return {
    ...validateCourierStep("details", form),
    ...validateCourierStep("contact", form),
  };
}

function countRemovalOptionalFilled(form: FormState): {
  filled: number;
  total: number;
} {
  const checks = [
    Boolean(form.timeBand),
    Boolean(form.movingFromPropertyType),
    Boolean(form.movingFromFloor),
    form.movingFromLiftAccess,
    Boolean(form.movingFromAccessNotes.trim()),
    Boolean(form.movingToPropertyType),
    Boolean(form.movingToFloor),
    form.movingToLiftAccess,
    Boolean(form.movingToAccessNotes.trim()),
    form.itemQuickPicks.length > 0,
    Boolean(form.removalItemNotes.trim()),
    form.extraHelpTwoMovers,
    form.extraHelpThreeMovers,
    form.extraHelpDismantling,
    form.extraHelpPacking,
    form.extraHelpWrapping,
    form.extraHelpWaste,
    form.extraHelpStorage,
    Boolean(form.contactPreference),
  ];

  return {
    filled: checks.filter(Boolean).length,
    total: checks.length,
  };
}

function ContactFieldsSection({
  form,
  errors,
  formId,
  updateField,
  clearError,
}: {
  form: FormState;
  errors: FormErrors;
  formId: string;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  clearError: (key: keyof FormErrors) => void;
}) {
  return (
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

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-ink">Contact preference</span>
          {/* <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
            Helps us quote more accurately
          </span> */}
        </div>
        <ChipGroup
          options={CONTACT_PREFERENCES}
          value={form.contactPreference}
          onChange={(id) => updateField("contactPreference", id)}
          ariaLabel="Contact preference"
          idPrefix={`${formId}-contact-pref`}
        />
      </div>

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
              errors.gdprConsent
                ? `${formId}-gdpr-error`
                : `${formId}-gdpr-hint`
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

      <p className="text-xs text-subtle">Fields marked with * are required.</p>
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
  const initialRemovalChip = initialServiceSlug
    ? getRemovalChipFromSlug(initialServiceSlug)
    : null;

  const [form, setForm] = useState<FormState>(() =>
    applyServiceSlugPrefill(
      {
        ...INITIAL_FORM_STATE,
        service: initialPlannerService,
        removalServiceChip: initialRemovalChip,
      },
      initialServiceSlug,
      initialPlannerService,
      initialRemovalChip,
    ),
  );
  const [removalStep, setRemovalStep] =
    useState<RemovalStepId>("service-timing");
  const [courierStep, setCourierStep] = useState<CourierStepId>("details");
  const [errors, setErrors] = useState<FormErrors>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [stepReward, setStepReward] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const dateInputClasses = cn(
    inputClasses(),
    "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100",
  );

  useEffect(() => {
    const restored = buildFormStateFromSession(
      initialServiceSlug,
      initialPlannerService,
      initialRemovalChip,
    );
    setForm(restored.form);
    setRemovalStep(restored.removalStep);
    setCourierStep(restored.courierStep);
    setHydrated(true);
  }, [initialServiceSlug, initialPlannerService, initialRemovalChip]);

  useEffect(() => {
    if (!hydrated || submitted) return;
    const payload: PersistedState = {
      form,
      removalStep,
      courierStep,
      sourceServiceSlug: initialServiceSlug ?? null,
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  }, [
    form,
    removalStep,
    courierStep,
    hydrated,
    submitted,
    initialServiceSlug,
  ]);

  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const clearError = useCallback((key: keyof FormErrors) => {
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  const selectService = (serviceId: PlannerServiceId) => {
    setForm((current) => {
      const next = { ...current, service: serviceId };
      if (current.service && current.service !== serviceId) {
        Object.assign(next, clearBranchFields(current.service));
      }
      if (serviceId === "removal" && !next.removalServiceChip) {
        next.removalServiceChip = initialRemovalChip;
      }
      return next;
    });
    setRemovalStep("service-timing");
    setCourierStep("details");
    setErrors({});
    setStatusMessage("");
    clearError("service");
  };

  const selectRemovalChip = (chipId: string) => {
    updateField("removalServiceChip", chipId);
    clearError("removalServiceChip");
  };

  const focusFirstError = (nextErrors: FormErrors) => {
    const order: (keyof FormErrors)[] = [
      "removalServiceChip",
      "moveSize",
      "moveDate",
      "movingFromPostcode",
      "movingToPostcode",
      "pickupPostcode",
      "deliveryPostcode",
      "parcelDescription",
      "courierDate",
      "name",
      "email",
      "contactNumber",
      "service",
      "gdprConsent",
    ];
    const firstKey = order.find((key) => nextErrors[key]);
    if (!firstKey) return;

    if (firstKey === "service") {
      document.getElementById(`${formId}-service-removal`)?.focus();
      return;
    }

    if (firstKey === "gdprConsent") {
      document.getElementById(`${formId}-gdpr`)?.focus();
      return;
    }

    if (firstKey === "removalServiceChip") {
      const firstChip = REMOVAL_SERVICE_CHIPS[0];
      document
        .getElementById(`${formId}-removal-chip-${firstChip.id}`)
        ?.focus();
      return;
    }

    document.getElementById(String(firstKey))?.focus();
  };

  const advanceWithReward = (advance: () => void) => {
    if (reduceMotion) {
      advance();
      return;
    }
    setStepReward(true);
    window.setTimeout(() => {
      setStepReward(false);
      window.setTimeout(advance, STEP_REWARD_EXIT_MS);
    }, STEP_REWARD_HOLD_MS);
  };

  const handleRemovalContinue = () => {
    const stepErrors = validateRemovalStep(removalStep, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      const count = Object.keys(stepErrors).length;
      setStatusMessage(
        count === 1
          ? "There is 1 field that needs your attention."
          : `There are ${count} fields that need your attention.`,
      );
      focusFirstError(stepErrors);
      statusRef.current?.focus();
      return;
    }

    setErrors({});
    setStatusMessage("");
    const index = REMOVAL_STEPS.findIndex((item) => item.id === removalStep);
    if (index < REMOVAL_STEPS.length - 1) {
      advanceWithReward(() =>
        setRemovalStep(REMOVAL_STEPS[index + 1].id),
      );
    }
  };

  const handleCourierContinue = () => {
    const stepErrors = validateCourierStep(courierStep, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      const count = Object.keys(stepErrors).length;
      setStatusMessage(
        count === 1
          ? "There is 1 field that needs your attention."
          : `There are ${count} fields that need your attention.`,
      );
      focusFirstError(stepErrors);
      statusRef.current?.focus();
      return;
    }

    setErrors({});
    setStatusMessage("");
    const index = COURIER_STEPS.findIndex((item) => item.id === courierStep);
    if (index < COURIER_STEPS.length - 1) {
      advanceWithReward(() => setCourierStep(COURIER_STEPS[index + 1].id));
    }
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

    if (!form.service) return;

    setErrors({});
    setStatusMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildQuoteSubmitBody(
            {
              ...form,
              removalServiceChip: form.removalServiceChip ?? "",
              moveSize: form.moveSize ?? "",
              timeBand: form.timeBand ?? "",
              contactPreference: form.contactPreference ?? "",
              courierUrgency: form.courierUrgency ?? "",
            },
            form.service,
          ),
        ),
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

      sessionStorage.removeItem(SESSION_STORAGE_KEY);
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

  const optionalAccuracy = countRemovalOptionalFilled(form);
  const removalStepIndex = REMOVAL_STEPS.findIndex(
    (item) => item.id === removalStep,
  );
  const courierStepIndex = COURIER_STEPS.findIndex(
    (item) => item.id === courierStep,
  );

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
          className="relative overflow-hidden rounded-3xl border border-border bg-paper px-8 py-14 text-center shadow-sm sm:px-12"
        >
          <ConfettiBurst />
          <SuccessCheckmark />
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
              setForm({
                ...INITIAL_FORM_STATE,
                service: initialPlannerService,
                removalServiceChip: initialRemovalChip,
              });
              setRemovalStep("service-timing");
              setCourierStep("details");
              setErrors({});
              setStatusMessage("");
              setSubmitted(false);
            }}
            className="relative z-10 mt-8 inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-medium text-ink transition-colors duration-200 hover:border-muted active:scale-[0.97]"
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

      <div className="mb-8 border-b border-border pb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl text-balance">
          Tell us what you need moved
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-subtle text-pretty">
          One decision at a time, share what you know now and we&apos;ll follow
          up for anything else.
        </p>
      </div>

      <fieldset className="mb-8">
        <legend className={labelClasses}>
          Service selection<span className="text-primary"> *</span>
        </legend>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-describedby={errors.service ? "service-error" : undefined}
        >
          {PLANNER_SERVICES.map((service) => {
            const isActive = form.service === service.id;
            return (
              <button
                key={service.id}
                id={`${formId}-service-${service.id}`}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectService(service.id)}
                className={cn(
                  "min-h-11 rounded-full border px-4 py-2.5 text-sm font-medium transition-[transform,colors] duration-200 active:scale-[0.97]",
                  isActive
                    ? "scale-[1.02] border-primary bg-primary/10 text-ink shadow-sm"
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

      <AnimatePresence mode="wait">
        {form.service === "removal" ? (
          <motion.div
            key="removal-wizard"
            initial={reduceMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={SECTION_TRANSITION}
            className="space-y-6 border-t border-border pt-8"
          >
            <ProgressStepper
              steps={REMOVAL_STEPS}
              currentIndex={removalStepIndex}
              onStepClick={(index) => {
                if (index <= removalStepIndex) {
                  setRemovalStep(REMOVAL_STEPS[index].id);
                }
              }}
              ariaLabel="Removal quote steps"
            />

            <p className="text-sm text-subtle">{REMOVAL_ENCOURAGEMENT[removalStep]}</p>

            <QuoteAccuracy
              filled={optionalAccuracy.filled}
              total={optionalAccuracy.total}
            />

            <StepReward show={stepReward} />

            <AnimatePresence mode="wait">
              <motion.div
                key={removalStep}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                {removalStep === "service-timing" ? (
                  <>
                    <div>
                      <p className={labelClasses}>
                        Service type<span className="text-primary"> *</span>
                      </p>
                      <ChipGroup
                        options={REMOVAL_SERVICE_CHIPS}
                        value={form.removalServiceChip}
                        onChange={selectRemovalChip}
                        error={errors.removalServiceChip}
                        ariaLabel="Removal service type"
                        idPrefix={`${formId}-removal-chip`}
                      />
                    </div>

                    <div>
                      <p className={labelClasses}>
                        Move size<span className="text-primary"> *</span>
                      </p>
                      <ChipGroup
                        options={MOVE_SIZES}
                        value={form.moveSize}
                        onChange={(id) => {
                          updateField("moveSize", id);
                          clearError("moveSize");
                        }}
                        error={errors.moveSize}
                        ariaLabel="Move size"
                        idPrefix={`${formId}-move-size`}
                      />
                    </div>

                    <Field
                      label="Preferred move date"
                      htmlFor="moveDate"
                      required
                      error={errors.moveDate}
                    >
                      <input
                        id="moveDate"
                        type="date"
                        value={form.moveDate}
                        onChange={(event) => {
                          updateField("moveDate", event.target.value);
                          clearError("moveDate");
                        }}
                        className={dateInputClasses}
                      />
                    </Field>

                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-ink">
                          Time band
                        </span>
                        {/* <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
                          Helps us quote more accurately
                        </span> */}
                      </div>
                      <ChipGroup
                        options={TIME_BANDS}
                        value={form.timeBand}
                        onChange={(id) => updateField("timeBand", id)}
                        ariaLabel="Preferred time band"
                        idPrefix={`${formId}-time-band`}
                      />
                    </div>
                  </>
                ) : null}

                {removalStep === "collection" ? (
                  <>
                    <Field
                      label="Post code"
                      htmlFor="movingFromPostcode"
                      required
                      error={errors.movingFromPostcode}
                    >
                      <input
                        id="movingFromPostcode"
                        type="text"
                        value={form.movingFromPostcode}
                        onChange={(event) => {
                          updateField("movingFromPostcode", event.target.value);
                          clearError("movingFromPostcode");
                        }}
                        className={inputClasses(Boolean(errors.movingFromPostcode))}
                        placeholder="e.g. SW1A 1AA"
                      />
                    </Field>

                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-ink">
                          Property type
                        </span>
                        {/* <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
                          Helps us quote more accurately
                        </span> */}
                      </div>
                      <ChipGroup
                        options={PROPERTY_TYPES}
                        value={form.movingFromPropertyType || null}
                        onChange={(id) =>
                          updateField("movingFromPropertyType", id)
                        }
                        ariaLabel="Collection property type"
                        idPrefix={`${formId}-from-type`}
                      />
                    </div>

                    <Field
                      label="Property floor level"
                      htmlFor="movingFromFloor"
                      // optionalHint
                    >
                      <select
                        id="movingFromFloor"
                        value={form.movingFromFloor}
                        onChange={(event) =>
                          updateField("movingFromFloor", event.target.value)
                        }
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
                      htmlFor="movingFromAccessNotes"
                      // optionalHint
                    >
                      <input
                        id="movingFromAccessNotes"
                        type="text"
                        value={form.movingFromAccessNotes}
                        onChange={(event) =>
                          updateField("movingFromAccessNotes", event.target.value)
                        }
                        className={inputClasses()}
                        placeholder="Permit zones, narrow street, etc."
                      />
                    </Field>
                  </>
                ) : null}

                {removalStep === "delivery" ? (
                  <>
                    <Field
                      label="Post code"
                      htmlFor="movingToPostcode"
                      required
                      error={errors.movingToPostcode}
                    >
                      <input
                        id="movingToPostcode"
                        type="text"
                        value={form.movingToPostcode}
                        onChange={(event) => {
                          updateField("movingToPostcode", event.target.value);
                          clearError("movingToPostcode");
                        }}
                        className={inputClasses(Boolean(errors.movingToPostcode))}
                        placeholder="e.g. E1 6AN"
                      />
                    </Field>

                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-ink">
                          Property type
                        </span>
                        {/* <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
                          Helps us quote more accurately
                        </span> */}
                      </div>
                      <ChipGroup
                        options={PROPERTY_TYPES}
                        value={form.movingToPropertyType || null}
                        onChange={(id) =>
                          updateField("movingToPropertyType", id)
                        }
                        ariaLabel="Delivery property type"
                        idPrefix={`${formId}-to-type`}
                      />
                    </div>

                    <Field
                      label="Property floor level"
                      htmlFor="movingToFloor"
                      // optionalHint
                    >
                      <select
                        id="movingToFloor"
                        value={form.movingToFloor}
                        onChange={(event) =>
                          updateField("movingToFloor", event.target.value)
                        }
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
                      htmlFor="movingToAccessNotes"
                      // optionalHint
                    >
                      <input
                        id="movingToAccessNotes"
                        type="text"
                        value={form.movingToAccessNotes}
                        onChange={(event) =>
                          updateField("movingToAccessNotes", event.target.value)
                        }
                        className={inputClasses()}
                        placeholder="Permit zones, narrow street, etc."
                      />
                    </Field>
                  </>
                ) : null}

                {removalStep === "items" ? (
                  <>
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-ink">
                          Quick picks
                        </span>
                        {/* <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
                          Helps us quote more accurately
                        </span> */}
                      </div>
                      <MultiChipGroup
                        options={ITEM_QUICK_PICKS}
                        values={form.itemQuickPicks}
                        onChange={(values) => updateField("itemQuickPicks", values)}
                        ariaLabel="Item quick picks"
                        idPrefix={`${formId}-item-picks`}
                      />
                    </div>

                    <Field
                      label="Anything specific we should know about?"
                      htmlFor="removalItemNotes"
                      // optionalHint
                    >
                      <textarea
                        id="removalItemNotes"
                        rows={4}
                        value={form.removalItemNotes}
                        onChange={(event) =>
                          updateField("removalItemNotes", event.target.value)
                        }
                        className={cn(inputClasses(), "resize-none")}
                        placeholder="Fragile items, awkward access, approximate quantities…"
                      />
                    </Field>

                    <Accordion title="Need extra help?">
                      <CheckboxField
                        id={`${formId}-extra-two-movers`}
                        label="Two movers required"
                        checked={form.extraHelpTwoMovers}
                        onChange={(checked) =>
                          updateField("extraHelpTwoMovers", checked)
                        }
                      />
                      <CheckboxField
                        id={`${formId}-extra-three-movers`}
                        label="Three movers required"
                        checked={form.extraHelpThreeMovers}
                        onChange={(checked) =>
                          updateField("extraHelpThreeMovers", checked)
                        }
                      />
                      <CheckboxField
                        id={`${formId}-extra-dismantling`}
                        label="Dismantling & reassembly"
                        checked={form.extraHelpDismantling}
                        onChange={(checked) =>
                          updateField("extraHelpDismantling", checked)
                        }
                      />
                      <CheckboxField
                        id={`${formId}-extra-packing`}
                        label="Packing service"
                        checked={form.extraHelpPacking}
                        onChange={(checked) =>
                          updateField("extraHelpPacking", checked)
                        }
                      />
                      <CheckboxField
                        id={`${formId}-extra-wrapping`}
                        label="Furniture wrapping"
                        checked={form.extraHelpWrapping}
                        onChange={(checked) =>
                          updateField("extraHelpWrapping", checked)
                        }
                      />
                      <CheckboxField
                        id={`${formId}-extra-waste`}
                        label="Waste disposal"
                        checked={form.extraHelpWaste}
                        onChange={(checked) =>
                          updateField("extraHelpWaste", checked)
                        }
                      />
                      <CheckboxField
                        id={`${formId}-extra-storage`}
                        label="Storage"
                        checked={form.extraHelpStorage}
                        onChange={(checked) =>
                          updateField("extraHelpStorage", checked)
                        }
                      />
                    </Accordion>
                  </>
                ) : null}

                {removalStep === "contact" ? (
                  <ContactFieldsSection
                    form={form}
                    errors={errors}
                    formId={formId}
                    updateField={updateField}
                    clearError={clearError}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>

            <WizardNav
              onBack={
                removalStepIndex > 0
                  ? () =>
                      setRemovalStep(REMOVAL_STEPS[removalStepIndex - 1].id)
                  : undefined
              }
              backDisabled={removalStepIndex === 0}
              onContinue={
                removalStep !== "contact" ? handleRemovalContinue : undefined
              }
              showContinue
              isFinalStep={removalStep === "contact"}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        ) : null}

        {form.service === "courier" ? (
          <motion.div
            key="courier-wizard"
            initial={reduceMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={SECTION_TRANSITION}
            className="space-y-6 border-t border-border pt-8"
          >
            <ProgressStepper
              steps={COURIER_STEPS}
              currentIndex={courierStepIndex}
              onStepClick={(index) => {
                if (index <= courierStepIndex) {
                  setCourierStep(COURIER_STEPS[index].id);
                }
              }}
              ariaLabel="Courier quote steps"
            />

            <p className="text-sm text-subtle">
              {COURIER_ENCOURAGEMENT[courierStep]}
            </p>

            <StepReward show={stepReward} />

            <AnimatePresence mode="wait">
              <motion.div
                key={courierStep}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                {courierStep === "details" ? (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        label="Pick up post code"
                        htmlFor="pickupPostcode"
                        required
                        error={errors.pickupPostcode}
                      >
                        <input
                          id="pickupPostcode"
                          type="text"
                          value={form.pickupPostcode}
                          onChange={(event) => {
                            updateField("pickupPostcode", event.target.value);
                            clearError("pickupPostcode");
                          }}
                          className={inputClasses(Boolean(errors.pickupPostcode))}
                          placeholder="e.g. N1 9GU"
                        />
                      </Field>

                      <Field
                        label="Delivery post code"
                        htmlFor="deliveryPostcode"
                        required
                        error={errors.deliveryPostcode}
                      >
                        <input
                          id="deliveryPostcode"
                          type="text"
                          value={form.deliveryPostcode}
                          onChange={(event) => {
                            updateField("deliveryPostcode", event.target.value);
                            clearError("deliveryPostcode");
                          }}
                          className={inputClasses(Boolean(errors.deliveryPostcode))}
                          placeholder="e.g. WC2H 9JQ"
                        />
                      </Field>
                    </div>

                    <Field
                      label="Parcel description"
                      htmlFor="parcelDescription"
                      required
                      error={errors.parcelDescription}
                    >
                      <textarea
                        id="parcelDescription"
                        rows={4}
                        value={form.parcelDescription}
                        onChange={(event) => {
                          updateField("parcelDescription", event.target.value);
                          clearError("parcelDescription");
                        }}
                        className={cn(
                          inputClasses(Boolean(errors.parcelDescription)),
                          "resize-none",
                        )}
                        placeholder="Contents, dimensions, weight, and fragility"
                      />
                    </Field>

                    <Field
                      label="Preferred date"
                      htmlFor="courierDate"
                      required
                      error={errors.courierDate}
                    >
                      <input
                        id="courierDate"
                        type="date"
                        value={form.courierDate}
                        onChange={(event) => {
                          updateField("courierDate", event.target.value);
                          clearError("courierDate");
                        }}
                        className={dateInputClasses}
                      />
                    </Field>

                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-ink">
                          Urgency
                        </span>
                        {/* <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
                          Helps us quote more accurately
                        </span> */}
                      </div>
                      <ChipGroup
                        options={COURIER_URGENCIES}
                        value={form.courierUrgency}
                        onChange={(id) => updateField("courierUrgency", id)}
                        ariaLabel="Courier urgency"
                        idPrefix={`${formId}-courier-urgency`}
                      />
                    </div>
                  </>
                ) : null}

                {courierStep === "contact" ? (
                  <ContactFieldsSection
                    form={form}
                    errors={errors}
                    formId={formId}
                    updateField={updateField}
                    clearError={clearError}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>

            <WizardNav
              onBack={
                courierStepIndex > 0
                  ? () => setCourierStep(COURIER_STEPS[courierStepIndex - 1].id)
                  : undefined
              }
              backDisabled={courierStepIndex === 0}
              onContinue={
                courierStep !== "contact" ? handleCourierContinue : undefined
              }
              showContinue
              isFinalStep={courierStep === "contact"}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </form>
  );
}
