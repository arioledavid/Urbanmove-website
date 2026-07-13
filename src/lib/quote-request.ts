import {
  MOVE_SIZES,
  REMOVAL_SERVICE_CHIPS,
  type RemovalServiceChipId,
  type MoveSizeId,
} from "@/lib/quote-form-data";

export const QUOTE_SERVICES = ["cargo", "removal", "courier"] as const;

export type QuoteServiceId = (typeof QUOTE_SERVICES)[number];

export type QuoteRequestPayload = {
  name: string;
  email: string;
  contactNumber: string;
  service: QuoteServiceId;
  contactPreference: string;
  origin: string;
  destination: string;
  weight: string;
  cargoDescription: string;
  removalServiceChip: string;
  moveSize: string;
  moveDate: string;
  timeBand: string;
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
  courierUrgency: string;
  gdprConsent: boolean;
  /** @deprecated Legacy field — kept for backward compatibility in reads */
  moveDateTime?: string;
  removalItems?: string;
  courierDateTime?: string;
};

export const QUOTE_SERVICE_LABELS: Record<QuoteServiceId, string> = {
  cargo: "Cargo Services",
  removal: "Removal Services",
  courier: "Courier Service",
};

export const REMOVAL_PAYLOAD_KEYS = [
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
] as const satisfies ReadonlyArray<keyof QuoteRequestPayload>;

export const COURIER_PAYLOAD_KEYS = [
  "pickupPostcode",
  "deliveryPostcode",
  "parcelDescription",
  "courierDate",
  "courierUrgency",
] as const satisfies ReadonlyArray<keyof QuoteRequestPayload>;

const EMPTY_REMOVAL_PAYLOAD: Pick<
  QuoteRequestPayload,
  (typeof REMOVAL_PAYLOAD_KEYS)[number]
> = {
  removalServiceChip: "",
  moveSize: "",
  moveDate: "",
  timeBand: "",
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
};

const EMPTY_COURIER_PAYLOAD: Pick<
  QuoteRequestPayload,
  (typeof COURIER_PAYLOAD_KEYS)[number]
> = {
  pickupPostcode: "",
  deliveryPostcode: "",
  parcelDescription: "",
  courierDate: "",
  courierUrgency: "",
};

/** Zero out fields that belong to an inactive service branch. */
export function stripInactiveBranchFields(
  payload: QuoteRequestPayload,
): QuoteRequestPayload {
  switch (payload.service) {
    case "courier":
      return { ...payload, ...EMPTY_REMOVAL_PAYLOAD };
    case "removal":
      return { ...payload, ...EMPTY_COURIER_PAYLOAD };
    case "cargo":
      return { ...payload, ...EMPTY_REMOVAL_PAYLOAD, ...EMPTY_COURIER_PAYLOAD };
    default:
      return payload;
  }
}

/** Prepare a client submit body with inactive branch fields cleared. */
export function buildQuoteSubmitBody(
  input: Record<string, unknown>,
  service: QuoteServiceId,
): Record<string, unknown> {
  const body = { ...input, service };
  const stripped = stripInactiveBranchFields(body as QuoteRequestPayload);
  return { ...stripped, service };
}

const REMOVAL_CHIP_IDS = new Set<string>(
  REMOVAL_SERVICE_CHIPS.map((chip) => chip.id),
);
const MOVE_SIZE_IDS = new Set<string>(MOVE_SIZES.map((size) => size.id));

function isQuoteService(value: unknown): value is QuoteServiceId {
  return (
    typeof value === "string" &&
    (QUOTE_SERVICES as readonly string[]).includes(value)
  );
}

function isRemovalChip(value: string): value is RemovalServiceChipId {
  return REMOVAL_CHIP_IDS.has(value);
}

function isMoveSize(value: string): value is MoveSizeId {
  return MOVE_SIZE_IDS.has(value);
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function validateQuoteRequest(
  body: unknown,
): { ok: true; data: QuoteRequestPayload } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const input = body as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const contactNumber =
    typeof input.contactNumber === "string" ? input.contactNumber.trim() : "";

  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "A valid email address is required." };
  }

  if (!contactNumber) {
    return { ok: false, error: "Contact number is required." };
  }

  if (!isQuoteService(input.service)) {
    return { ok: false, error: "A valid service selection is required." };
  }

  if (input.gdprConsent !== true) {
    return { ok: false, error: "GDPR consent is required." };
  }

  const readString = (key: string) =>
    typeof input[key] === "string" ? input[key].trim() : "";

  const readBoolean = (key: string) => input[key] === true;

  const removalServiceChip = readString("removalServiceChip");
  const moveSize = readString("moveSize");
  const moveDate =
    readString("moveDate") || readString("moveDateTime").slice(0, 10);
  const movingFromPostcode = readString("movingFromPostcode");
  const movingToPostcode = readString("movingToPostcode");

  if (input.service === "removal") {
    if (!removalServiceChip || !isRemovalChip(removalServiceChip)) {
      return { ok: false, error: "A specific removal service is required." };
    }

    if (!moveSize || !isMoveSize(moveSize)) {
      return { ok: false, error: "Move size is required." };
    }

    if (!moveDate) {
      return { ok: false, error: "Preferred move date is required." };
    }

    if (!movingFromPostcode) {
      return { ok: false, error: "Collection postcode is required." };
    }

    if (!movingToPostcode) {
      return { ok: false, error: "Delivery postcode is required." };
    }
  }

  const courierDate =
    readString("courierDate") || readString("courierDateTime").slice(0, 10);

  return {
    ok: true,
    data: stripInactiveBranchFields({
      name,
      email,
      contactNumber,
      service: input.service,
      contactPreference: readString("contactPreference"),
      origin: readString("origin"),
      destination: readString("destination"),
      weight: readString("weight"),
      cargoDescription: readString("cargoDescription"),
      removalServiceChip,
      moveSize,
      moveDate,
      timeBand: readString("timeBand"),
      movingFromPostcode,
      movingFromPropertyType: readString("movingFromPropertyType"),
      movingFromFloor: readString("movingFromFloor"),
      movingFromLiftAccess: readBoolean("movingFromLiftAccess"),
      movingFromAccessNotes: readString("movingFromAccessNotes"),
      movingToPostcode,
      movingToPropertyType: readString("movingToPropertyType"),
      movingToFloor: readString("movingToFloor"),
      movingToLiftAccess: readBoolean("movingToLiftAccess"),
      movingToAccessNotes: readString("movingToAccessNotes"),
      itemQuickPicks: readStringArray(input.itemQuickPicks),
      removalItemNotes:
        readString("removalItemNotes") || readString("removalItems"),
      extraHelpTwoMovers: readBoolean("extraHelpTwoMovers"),
      extraHelpThreeMovers: readBoolean("extraHelpThreeMovers"),
      extraHelpDismantling: readBoolean("extraHelpDismantling"),
      extraHelpPacking: readBoolean("extraHelpPacking"),
      extraHelpWrapping: readBoolean("extraHelpWrapping"),
      extraHelpWaste: readBoolean("extraHelpWaste"),
      extraHelpStorage: readBoolean("extraHelpStorage"),
      pickupPostcode: readString("pickupPostcode"),
      deliveryPostcode: readString("deliveryPostcode"),
      parcelDescription: readString("parcelDescription"),
      courierDate,
      courierUrgency: readString("courierUrgency"),
      gdprConsent: true,
    }),
  };
}
