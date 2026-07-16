import { EMAIL_BRAND } from "@/lib/emails/brand-tokens";
import {
  QUOTE_SERVICE_LABELS,
  type QuoteRequestPayload,
} from "@/lib/quote-request";
import { BUSINESS, SITE_NAME, SITE_URL } from "@/lib/seo";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

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

function formatDate(value: string): string {
  if (!value.trim()) return "—";

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(parsed);
}

const ADDITIONAL_SERVICE_EMAIL_ROWS: Array<{
  key: keyof QuoteRequestPayload;
  label: string;
}> = [
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
];

function buildAdditionalServiceRows(
  payload: QuoteRequestPayload,
): Array<[string, string]> {
  return ADDITIONAL_SERVICE_EMAIL_ROWS.filter(
    (option) => payload[option.key] === true,
  ).map((option) => [option.label, "Yes"]);
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
        ["Move date", formatDate(payload.moveDate)],
        ["Move time window", formatValue(payload.moveTimeWindow)],
        ["Moving from postcode", formatValue(payload.movingFromPostcode)],
        [
          "Moving from property type",
          formatValue(payload.movingFromPropertyType),
        ],
        ["Moving from floor", formatValue(payload.movingFromFloor)],
        ["Lift access (from)", formatValue(payload.movingFromLiftAccess)],
        ["Parking / access (from)", formatValue(payload.movingFromParkingNotes)],
        ["Moving to postcode", formatValue(payload.movingToPostcode)],
        [
          "Moving to property type",
          formatValue(payload.movingToPropertyType),
        ],
        ["Moving to floor", formatValue(payload.movingToFloor)],
        ["Lift access (to)", formatValue(payload.movingToLiftAccess)],
        ["Parking / access (to)", formatValue(payload.movingToParkingNotes)],
        ["Items to move", formatValue(payload.removalItems)],
        ...buildAdditionalServiceRows(payload),
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

function buildDetailRowsHtml(rows: Array<[string, string]>): string {
  return rows
    .map(
      ([label, value], index) => `
        <tr>
          <td style="padding:14px 16px;border-top:1px solid ${EMAIL_BRAND.border};font-size:13px;font-weight:600;color:${EMAIL_BRAND.muted};width:38%;vertical-align:top;background:${index % 2 === 0 ? EMAIL_BRAND.paper : EMAIL_BRAND.surface};">
            ${escapeHtml(label)}
          </td>
          <td style="padding:14px 16px;border-top:1px solid ${EMAIL_BRAND.border};font-size:14px;line-height:1.5;color:${EMAIL_BRAND.ink};vertical-align:top;background:${index % 2 === 0 ? EMAIL_BRAND.paper : EMAIL_BRAND.surface};">
            ${escapeHtml(value)}
          </td>
        </tr>`,
    )
    .join("");
}

function buildQuoteRequestEmailHtml(payload: QuoteRequestPayload): string {
  const serviceLabel = QUOTE_SERVICE_LABELS[payload.service];
  const contactRows: Array<[string, string]> = [
    ["Name", formatValue(payload.name)],
    ["Email", formatValue(payload.email)],
    ["Contact number", formatValue(payload.contactNumber)],
    ["Service", serviceLabel],
  ];
  const allRows = [...contactRows, ...buildServiceDetails(payload)];

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New quote request</title>
  </head>
  <body style="margin:0;padding:0;background:${EMAIL_BRAND.surface};font-family:${EMAIL_BRAND.fontStack};color:${EMAIL_BRAND.ink};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL_BRAND.surface};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:${EMAIL_BRAND.paper};border:1px solid ${EMAIL_BRAND.border};border-radius:${EMAIL_BRAND.radiusLg};overflow:hidden;">
            <tr>
              <td style="height:4px;background:${EMAIL_BRAND.primary};font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px 32px 24px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${EMAIL_BRAND.primary};">
                  New enquiry
                </p>
                <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;font-weight:600;letter-spacing:-0.02em;color:${EMAIL_BRAND.ink};">
                  Quote request from ${escapeHtml(payload.name)}
                </h1>
                <p style="margin:0;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.muted};">
                  A new enquiry was submitted via the website contact form. Reply directly to this email to respond to the customer.
                </p>
                <p style="margin:20px 0 0;display:inline-block;padding:8px 14px;border-radius:${EMAIL_BRAND.radiusFull};background:${EMAIL_BRAND.primarySoft};border:1px solid rgba(240,58,47,0.15);font-size:13px;font-weight:600;color:${EMAIL_BRAND.ink};">
                  ${escapeHtml(serviceLabel)}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${EMAIL_BRAND.border};border-radius:${EMAIL_BRAND.radiusMd};overflow:hidden;">
                  ${buildDetailRowsHtml(allRows)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px;border-top:1px solid ${EMAIL_BRAND.border};background:${EMAIL_BRAND.surface};">
                <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:${EMAIL_BRAND.ink};">
                  ${escapeHtml(SITE_NAME)}
                </p>
                <p style="margin:0 0 4px;font-size:13px;line-height:1.5;color:${EMAIL_BRAND.muted};">
                  ${escapeHtml(BUSINESS.telephoneDisplay)} · ${escapeHtml(BUSINESS.email)}
                </p>
                <p style="margin:0;font-size:12px;line-height:1.5;color:${EMAIL_BRAND.subtle};">
                  <a href="${SITE_URL}" style="color:${EMAIL_BRAND.primary};text-decoration:none;">${SITE_URL.replace("https://", "")}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildQuoteRequestEmail(payload: QuoteRequestPayload) {
  const serviceLabel = QUOTE_SERVICE_LABELS[payload.service];
  const subject = `New quote request: ${serviceLabel} (${payload.name})`;

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
    "",
    `${SITE_NAME}`,
    `${BUSINESS.telephoneDisplay} · ${BUSINESS.email}`,
    SITE_URL,
  ].join("\n");

  const html = buildQuoteRequestEmailHtml(payload);

  return { subject, text, html };
}
