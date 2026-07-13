import { isServiceSlug, type ServiceSlug } from "@/lib/services-data";

export const REMOVAL_SERVICE_CHIPS = [
  { id: "man-and-van", label: "Man & Van" },
  { id: "house-move", label: "House Move" },
  { id: "office-move", label: "Office Move" },
  { id: "furniture-collection", label: "Furniture Collection" },
  { id: "student-move", label: "Student Move" },
  { id: "waste-removal", label: "Waste Removal" },
  { id: "other", label: "Other" },
] as const;

export type RemovalServiceChipId = (typeof REMOVAL_SERVICE_CHIPS)[number]["id"];

export const MOVE_SIZES = [
  { id: "single-item", label: "Single item" },
  { id: "few-items", label: "Few items" },
  { id: "studio", label: "Studio" },
  { id: "1-bed", label: "1 Bed" },
  { id: "2-bed", label: "2 Bed" },
  { id: "3-bed", label: "3 Bed" },
  { id: "4-plus-bed", label: "4+ Bed" },
  { id: "office", label: "Office" },
] as const;

export type MoveSizeId = (typeof MOVE_SIZES)[number]["id"];

export const TIME_BANDS = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
  { id: "flexible", label: "Flexible" },
] as const;

export type TimeBandId = (typeof TIME_BANDS)[number]["id"];

export const PROPERTY_TYPES = [
  { id: "house", label: "House" },
  { id: "flat", label: "Flat" },
  { id: "office", label: "Office" },
  { id: "storage-unit", label: "Storage unit" },
  { id: "student-accommodation", label: "Student accommodation" },
  { id: "other", label: "Other" },
] as const;

export type PropertyTypeId = (typeof PROPERTY_TYPES)[number]["id"];

export const ITEM_QUICK_PICKS = [
  { id: "single-item", label: "Single item" },
  { id: "furniture", label: "Furniture" },
  { id: "boxes", label: "Boxes" },
  { id: "full-house", label: "Full house contents" },
  { id: "office-equipment", label: "Office equipment" },
  { id: "mixed", label: "Mixed" },
] as const;

export type ItemQuickPickId = (typeof ITEM_QUICK_PICKS)[number]["id"];

export const CONTACT_PREFERENCES = [
  { id: "phone", label: "Phone call" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
] as const;

export type ContactPreferenceId = (typeof CONTACT_PREFERENCES)[number]["id"];

export const COURIER_URGENCIES = [
  { id: "same-day", label: "Same day" },
  { id: "next-day", label: "Next day" },
  { id: "flexible", label: "Flexible" },
] as const;

export type CourierUrgencyId = (typeof COURIER_URGENCIES)[number]["id"];

export const FLOOR_OPTIONS = [
  "Ground",
  "Basement",
  "1st Floor",
  "2nd Floor",
  "3rd Floor",
  "4th Floor+",
] as const;

export const REMOVAL_STEPS = [
  { id: "service-timing", label: "Service & timing" },
  { id: "collection", label: "Collection" },
  { id: "delivery", label: "Delivery" },
  { id: "items", label: "Items" },
  { id: "contact", label: "Contact" },
] as const;

export type RemovalStepId = (typeof REMOVAL_STEPS)[number]["id"];

export const COURIER_STEPS = [
  { id: "details", label: "Parcel details" },
  { id: "contact", label: "Contact" },
] as const;

export type CourierStepId = (typeof COURIER_STEPS)[number]["id"];

export const PLANNER_SERVICES = [
  // { id: "cargo", label: "Cargo Services" },
  { id: "removal", label: "Removal Services" },
  { id: "courier", label: "Courier Service" },
] as const;

export type PlannerServiceId = (typeof PLANNER_SERVICES)[number]["id"];

/** Maps service page slugs to the removal chip pre-selected on arrival. */
export const SERVICE_SLUG_TO_REMOVAL_CHIP: Partial<
  Record<ServiceSlug, RemovalServiceChipId>
> = {
  "house-office-removals": "house-move",
  "man-and-van": "man-and-van",
  "storage-solutions": "other",
  "furniture-delivery-assembly": "furniture-collection",
  "household-waste-clearance": "waste-removal",
  "student-moves": "student-move",
};

export function getRemovalChipFromSlug(
  slug: string,
): RemovalServiceChipId | null {
  if (!isServiceSlug(slug)) return null;
  return SERVICE_SLUG_TO_REMOVAL_CHIP[slug] ?? null;
}

export function getRemovalChipLabel(chipId: string | null): string | null {
  if (!chipId) return null;
  return REMOVAL_SERVICE_CHIPS.find((chip) => chip.id === chipId)?.label ?? null;
}

export function getOptionLabel<T extends { id: string; label: string }>(
  options: readonly T[],
  id: string,
): string {
  return options.find((option) => option.id === id)?.label ?? id;
}

export const SESSION_STORAGE_KEY = "urban-move-quote-form";
