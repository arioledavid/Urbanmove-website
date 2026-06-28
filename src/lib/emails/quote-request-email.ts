import {
  QUOTE_SERVICE_LABELS,
  type QuoteRequestPayload,
} from "@/lib/quote-request";

function formatValue(value: string | boolean): string {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  const trimmed = value.trim();
  return trimmed || "—";
}

function formatDateTime(value: string): string {
  if (!value.trim()) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function buildServiceDetails(payload: QuoteRequestPayload): Array<[string, string]> {
  switch (payload.service) {
    case "cargo":
      return [
        ["Origin", formatValue(payload.origin)],
        ["Destination", formatValue(payload.destination)],
        ["Weight (kg)", formatValue(payload.weight)],
        ["Cargo description", formatValue(payload.cargoDescription)],
      ];
    case "removal":
      return [
        ["Move date & time", formatDateTime(payload.moveDateTime)],
        ["Moving from postcode", formatValue(payload.movingFromPostcode)],
        ["Moving from floor", formatValue(payload.movingFromFloor)],
        ["Lift access (from)", formatValue(payload.movingFromLiftAccess)],
        ["Moving to postcode", formatValue(payload.movingToPostcode)],
        ["Moving to floor", formatValue(payload.movingToFloor)],
        ["Lift access (to)", formatValue(payload.movingToLiftAccess)],
        ["Items to move", formatValue(payload.removalItems)],
      ];
    case "courier":
      return [
        ["Pickup postcode", formatValue(payload.pickupPostcode)],
        ["Delivery postcode", formatValue(payload.deliveryPostcode)],
        ["Parcel description", formatValue(payload.parcelDescription)],
        ["Preferred date & time", formatDateTime(payload.courierDateTime)],
      ];
  }
}

export function buildQuoteRequestEmail(payload: QuoteRequestPayload) {
  const serviceLabel = QUOTE_SERVICE_LABELS[payload.service];
  const subject = `New quote request — ${serviceLabel} — ${payload.name}`;

  const contactRows: Array<[string, string]> = [
    ["Name", formatValue(payload.name)],
    ["Email", formatValue(payload.email)],
    ["Contact number", formatValue(payload.contactNumber)],
    ["Service", serviceLabel],
  ];

  const allRows = [...contactRows, ...buildServiceDetails(payload)];
  const text = [
    "New quote request",
    "",
    "A new enquiry was submitted via the website contact form.",
    "",
    ...allRows.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");

  return { subject, text };
}
