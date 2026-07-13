import { EMAIL_BRAND } from "@/lib/emails/brand-tokens";
import {
  CONTACT_PREFERENCES,
  COURIER_URGENCIES,
  getOptionLabel,
  getRemovalChipLabel,
  ITEM_QUICK_PICKS,
  MOVE_SIZES,
  PROPERTY_TYPES,
  TIME_BANDS,
} from "@/lib/quote-form-data";
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

function formatDate(value: string): string {
  if (!value.trim()) return "—";

  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
    parsed,
  );
}

function pushIfPresent(
  rows: Array<[string, string]>,
  label: string,
  value: string | boolean | string[],
) {
  if (Array.isArray(value)) {
    if (value.length === 0) return;
    const labels = value
      .map((id) => getOptionLabel(ITEM_QUICK_PICKS, id))
      .join(", ");
    rows.push([label, labels]);
    return;
  }

  if (typeof value === "boolean") {
    if (!value) return;
    rows.push([label, "Yes"]);
    return;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === "—") return;
  rows.push([label, trimmed]);
}

function getServiceDisplayLabel(payload: QuoteRequestPayload): string {
  if (payload.service === "removal") {
    return (
      getRemovalChipLabel(payload.removalServiceChip) ??
      QUOTE_SERVICE_LABELS.removal
    );
  }

  return QUOTE_SERVICE_LABELS[payload.service];
}

function buildGroupedRows(
  payload: QuoteRequestPayload,
): Array<{ title: string; rows: Array<[string, string]> }> {
  const contactRows: Array<[string, string]> = [
    ["Name", formatValue(payload.name)],
    ["Email", formatValue(payload.email)],
    ["Contact number", formatValue(payload.contactNumber)],
  ];

  pushIfPresent(
    contactRows,
    "Contact preference",
    payload.contactPreference
      ? getOptionLabel(CONTACT_PREFERENCES, payload.contactPreference)
      : "",
  );

  switch (payload.service) {
    case "cargo": {
      const moveRows: Array<[string, string]> = [];
      pushIfPresent(moveRows, "Origin", payload.origin);
      pushIfPresent(moveRows, "Destination", payload.destination);
      pushIfPresent(moveRows, "Weight (kg)", payload.weight);
      pushIfPresent(moveRows, "Cargo description", payload.cargoDescription);
      return [
        { title: "Contact", rows: contactRows },
        { title: "Cargo details", rows: moveRows },
      ];
    }
    case "removal": {
      const moveRows: Array<[string, string]> = [
        [
          "Service",
          getRemovalChipLabel(payload.removalServiceChip) ??
            formatValue(payload.removalServiceChip),
        ],
        ["Move size", getOptionLabel(MOVE_SIZES, payload.moveSize)],
        ["Preferred date", formatDate(payload.moveDate)],
      ];
      pushIfPresent(
        moveRows,
        "Time band",
        payload.timeBand
          ? getOptionLabel(TIME_BANDS, payload.timeBand)
          : "",
      );

      const collectionRows: Array<[string, string]> = [
        ["Postcode", formatValue(payload.movingFromPostcode)],
      ];
      pushIfPresent(
        collectionRows,
        "Property type",
        payload.movingFromPropertyType
          ? getOptionLabel(PROPERTY_TYPES, payload.movingFromPropertyType)
          : "",
      );
      pushIfPresent(collectionRows, "Floor level", payload.movingFromFloor);
      pushIfPresent(
        collectionRows,
        "Lift access",
        payload.movingFromLiftAccess,
      );
      pushIfPresent(
        collectionRows,
        "Parking / access notes",
        payload.movingFromAccessNotes,
      );

      const deliveryRows: Array<[string, string]> = [
        ["Postcode", formatValue(payload.movingToPostcode)],
      ];
      pushIfPresent(
        deliveryRows,
        "Property type",
        payload.movingToPropertyType
          ? getOptionLabel(PROPERTY_TYPES, payload.movingToPropertyType)
          : "",
      );
      pushIfPresent(deliveryRows, "Floor level", payload.movingToFloor);
      pushIfPresent(deliveryRows, "Lift access", payload.movingToLiftAccess);
      pushIfPresent(
        deliveryRows,
        "Parking / access notes",
        payload.movingToAccessNotes,
      );

      const itemRows: Array<[string, string]> = [];
      pushIfPresent(itemRows, "Quick picks", payload.itemQuickPicks);
      pushIfPresent(itemRows, "Additional notes", payload.removalItemNotes);

      const extraHelpRows: Array<[string, string]> = [];
      pushIfPresent(extraHelpRows, "Two movers", payload.extraHelpTwoMovers);
      pushIfPresent(extraHelpRows, "Three movers", payload.extraHelpThreeMovers);
      pushIfPresent(
        extraHelpRows,
        "Dismantling & reassembly",
        payload.extraHelpDismantling,
      );
      pushIfPresent(extraHelpRows, "Packing service", payload.extraHelpPacking);
      pushIfPresent(
        extraHelpRows,
        "Furniture wrapping",
        payload.extraHelpWrapping,
      );
      pushIfPresent(extraHelpRows, "Waste disposal", payload.extraHelpWaste);
      pushIfPresent(extraHelpRows, "Storage", payload.extraHelpStorage);

      const groups = [
        { title: "Move details", rows: moveRows },
        { title: "Collection", rows: collectionRows },
        { title: "Delivery", rows: deliveryRows },
        ...(itemRows.length > 0 ? [{ title: "Items", rows: itemRows }] : []),
        { title: "Contact", rows: contactRows },
      ];

      if (extraHelpRows.length > 0) {
        groups.splice(4, 0, { title: "Extra help", rows: extraHelpRows });
      }

      return groups;
    }
    case "courier": {
      const parcelRows: Array<[string, string]> = [];
      pushIfPresent(parcelRows, "Pickup postcode", payload.pickupPostcode);
      pushIfPresent(parcelRows, "Delivery postcode", payload.deliveryPostcode);
      pushIfPresent(parcelRows, "Parcel description", payload.parcelDescription);
      if (payload.courierDate.trim()) {
        parcelRows.push([
          "Preferred date",
          formatDate(payload.courierDate),
        ]);
      }
      pushIfPresent(
        parcelRows,
        "Urgency",
        payload.courierUrgency
          ? getOptionLabel(COURIER_URGENCIES, payload.courierUrgency)
          : "",
      );

      return [
        { title: "Parcel details", rows: parcelRows },
        { title: "Contact", rows: contactRows },
      ];
    }
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

function buildGroupedHtml(
  groups: Array<{ title: string; rows: Array<[string, string]> }>,
): string {
  return groups
    .filter((group) => group.rows.length > 0)
    .map(
      (group) => `
        <div style="margin-bottom:24px;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_BRAND.primary};">
            ${escapeHtml(group.title)}
          </p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${EMAIL_BRAND.border};border-radius:${EMAIL_BRAND.radiusMd};overflow:hidden;">
            ${buildDetailRowsHtml(group.rows)}
          </table>
        </div>`,
    )
    .join("");
}

function buildQuoteRequestEmailHtml(payload: QuoteRequestPayload): string {
  const serviceLabel = getServiceDisplayLabel(payload);
  const groups = buildGroupedRows(payload);

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
                ${buildGroupedHtml(groups)}
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
  const serviceLabel = getServiceDisplayLabel(payload);
  const subject = `New Quote Request – ${serviceLabel} — ${payload.name}`;
  const groups = buildGroupedRows(payload);

  const textSections = groups
    .filter((group) => group.rows.length > 0)
    .map(
      (group) =>
        `${group.title}\n${group.rows.map(([label, value]) => `${label}: ${value}`).join("\n")}`,
    );

  const text = [
    "New quote request",
    "",
    "A new enquiry was submitted via the website contact form.",
    "",
    ...textSections,
    "",
    SITE_NAME,
    `${BUSINESS.telephoneDisplay} · ${BUSINESS.email}`,
    SITE_URL,
  ].join("\n");

  const html = buildQuoteRequestEmailHtml(payload);

  return { subject, text, html };
}
