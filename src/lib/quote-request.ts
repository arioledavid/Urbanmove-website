export const QUOTE_SERVICES = ["cargo", "removal", "courier"] as const;

export type QuoteServiceId = (typeof QUOTE_SERVICES)[number];

export type QuoteRequestPayload = {
  name: string;
  email: string;
  contactNumber: string;
  service: QuoteServiceId;
  origin: string;
  destination: string;
  weight: string;
  cargoDescription: string;
  moveDateTime: string;
  movingFromPostcode: string;
  movingFromFloor: string;
  movingFromLiftAccess: boolean;
  movingToPostcode: string;
  movingToFloor: string;
  movingToLiftAccess: boolean;
  removalItems: string;
  pickupPostcode: string;
  deliveryPostcode: string;
  parcelDescription: string;
  courierDateTime: string;
  gdprConsent: boolean;
};

export const QUOTE_SERVICE_LABELS: Record<QuoteServiceId, string> = {
  cargo: "Cargo Services",
  removal: "Removal Services",
  courier: "Courier Service",
};

function isQuoteService(value: unknown): value is QuoteServiceId {
  return (
    typeof value === "string" &&
    (QUOTE_SERVICES as readonly string[]).includes(value)
  );
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

  return {
    ok: true,
    data: {
      name,
      email,
      contactNumber,
      service: input.service,
      origin: readString("origin"),
      destination: readString("destination"),
      weight: readString("weight"),
      cargoDescription: readString("cargoDescription"),
      moveDateTime: readString("moveDateTime"),
      movingFromPostcode: readString("movingFromPostcode"),
      movingFromFloor: readString("movingFromFloor"),
      movingFromLiftAccess: readBoolean("movingFromLiftAccess"),
      movingToPostcode: readString("movingToPostcode"),
      movingToFloor: readString("movingToFloor"),
      movingToLiftAccess: readBoolean("movingToLiftAccess"),
      removalItems: readString("removalItems"),
      pickupPostcode: readString("pickupPostcode"),
      deliveryPostcode: readString("deliveryPostcode"),
      parcelDescription: readString("parcelDescription"),
      courierDateTime: readString("courierDateTime"),
      gdprConsent: true,
    },
  };
}
