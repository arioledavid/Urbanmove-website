import type { ServiceType } from "@prisma/client";
import type { QuoteRequestPayload } from "@/lib/quote-request";
import type { CreateEnquiryInput } from "@/lib/services/enquiry-service";

function mapServiceType(service: QuoteRequestPayload["service"]): ServiceType {
  switch (service) {
    case "removal":
      return "REMOVAL";
    case "courier":
      return "COURIER";
    case "cargo":
      return "CARGO";
    default:
      return "OTHER";
  }
}

function parseDate(value: string): Date | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Maps a validated website quote payload into enquiryService.create input,
 * extracting searchable columns while retaining the full snapshot in payload.
 */
export function quotePayloadToEnquiryInput(
  data: QuoteRequestPayload,
): CreateEnquiryInput {
  const serviceType = mapServiceType(data.service);

  let fromAddress: string | null = null;
  let toAddress: string | null = null;
  let postcodeFrom: string | null = null;
  let postcodeTo: string | null = null;
  let moveDate: Date | null = null;
  let propertyType: string | null = null;

  if (data.service === "removal") {
    postcodeFrom = data.movingFromPostcode || null;
    postcodeTo = data.movingToPostcode || null;
    moveDate = parseDate(data.moveDate);
    propertyType = data.movingFromPropertyType || null;
    fromAddress = [data.movingFromPostcode, data.movingFromFloor]
      .filter(Boolean)
      .join(" · ") || null;
    toAddress = [data.movingToPostcode, data.movingToFloor]
      .filter(Boolean)
      .join(" · ") || null;
  } else if (data.service === "courier") {
    postcodeFrom = data.pickupPostcode || null;
    postcodeTo = data.deliveryPostcode || null;
    moveDate = parseDate(data.courierDateTime);
    fromAddress = data.pickupPostcode || null;
    toAddress = data.deliveryPostcode || null;
  } else {
    fromAddress = data.origin || null;
    toAddress = data.destination || null;
    moveDate = parseDate(data.moveDate);
  }

  return {
    serviceType,
    contactName: data.name,
    contactEmail: data.email,
    contactPhone: data.contactNumber,
    fromAddress,
    toAddress,
    postcodeFrom,
    postcodeTo,
    moveDate,
    propertyType,
    payload: data,
    source: "website",
  };
}
