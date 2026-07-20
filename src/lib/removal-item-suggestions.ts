export const REMOVAL_ITEM_SUGGESTIONS = [
  // Living room
  "Sofa",
  "2 seater sofa",
  "3 seater sofa",
  "L shaped sofa",
  "5 seater sofa",
  "Sofa bed",
  "Armchair",
  "Recliner chair",
  "Reclining arm chair",
  "Reclining 2 seater",
  "Reclining 3 seater",
  "Footstool",
  "Coffee table",
  "TV stand",
  "TV",
  "Bookcase",
  "Shelving unit",
  "Sideboard",
  "Display cabinet",
  "Rugs",
  "Curtains",
  "Blinds",
  "Mirror",
  "Artwork",
  "Clock",
  "Lamp",
  "Fireplace surround",
  "Gaming console",
  "Speaker system",

  // Dining room
  "Dining table",
  "Dining chairs",
  "Extendable table",
  "Bar stools",
  "China cabinet",
  "Wine rack",

  // Bedroom
  "Wardrobe",
  "Chest of drawers",
  "Bed frame",
  "Headboard",
  "Bedside table",
  "Single mattress",
  "Double mattress",
  "King mattress",
  "Super king mattress",
  "Bunk bed",
  "Cot",
  "Dressing table",
  "Ottoman storage box",
  "Wardrobe organiser",

  // Kitchen & appliances
  "Fridge freezer",
  "Fridge",
  "Freezer",
  "Wine fridge",
  "American-style fridge",
  "Washing machine",
  "Tumble dryer",
  "Washer-dryer",
  "Dishwasher",
  "Oven",
  "Range cooker",
  "Cooker",
  "Hob",
  "Microwave",
  "Kitchen island",
  "Bin (kitchen)",
  "Kitchen table and chairs",

  // Home office / study
  "Desk",
  "Standing desk",
  "Office chair",
  "Filing cabinet",
  "Bookshelf",
  "Printer",
  "Monitor",
  "Computer / PC tower",
  "Laptop",
  "Whiteboard",
  "Noticeboard",
  "Safe",

  // Student / hostel-specific
  "Study desk and chair",
  "Single bed",
  "Mini fridge",
  "Microwave (compact)",
  "Storage boxes",
  "Under-bed storage",
  "Clothes rail",
  "Drying rack",
  "Bean bag",
  "Rice cooker / small appliances",
  "Noticeboard / pinboard",

  // Office / commercial (beyond home office)
  "Reception desk",
  "Meeting table",
  "Stacking chairs",
  "Server rack / IT equipment",
  "Photocopier",
  "Partition screens",
  "Storage cupboard",
  "Water cooler",
  "Vending machine",
  "Archive boxes",

  // Boxes, bags & general packing
  "Boxes",
  "Suitcases",
  "Bags (bin bags / holdalls)",
  "Storage crates",

  // Fitness & leisure
  "Treadmill",
  "Exercise bike",
  "Rowing machine",
  "Weight bench",
  "Dumbbells / weights",
  "Yoga equipment",

  // Musical instruments
  "Piano",
  "Upright piano",
  "Keyboard",
  "Guitar",
  "Drum kit",
  "Amplifier",

  // Baby & kids
  "Pram / pushchair",
  "Car seat",
  "High chair",
  "Cot mattress",
  "Toy box",
  "Children's bike",

  // Garden & outdoor
  "Lawnmower",
  "Garden furniture",
  "Garden table and chairs",
  "Parasol",
  "BBQ",
  "Shed contents",
  "Greenhouse contents",
  "Trampoline",
  "Bike",
  "Motorbike",
  "Toolbox",
  "Ladder",

  // Appliances & miscellaneous
  "Hoover",
  "Ironing board",
  "Heater",
  "Air conditioner",
  "Dehumidifier",
  "Fan",
  "Washing basket",
  "Plant pots",
  "Large houseplant",
  "Fish tank / aquarium",
  "Pet carrier",
] as const;

const MAX_RESULTS = 8;

export function filterRemovalItemSuggestions(
  query: string,
  exclude: readonly string[] = [],
): string[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const excluded = new Set(exclude.map((item) => item.trim().toLowerCase()));

  const ranked: { label: string; score: number }[] = [];

  for (const label of REMOVAL_ITEM_SUGGESTIONS) {
    const normalizedLabel = label.toLowerCase();
    if (excluded.has(normalizedLabel)) continue;

    let score = -1;
    if (normalizedLabel.startsWith(normalizedQuery)) {
      score = 0;
    } else if (
      normalizedLabel
        .split(/\s+/)
        .some((word) => word.startsWith(normalizedQuery))
    ) {
      score = 1;
    } else if (normalizedLabel.includes(normalizedQuery)) {
      score = 2;
    }

    if (score >= 0) {
      ranked.push({ label, score });
    }
  }

  ranked.sort((a, b) => a.score - b.score || a.label.localeCompare(b.label));
  return ranked.slice(0, MAX_RESULTS).map((item) => item.label);
}

export type RemovalItemEntry = {
  label: string;
  quantity: number;
};

const QUANTITY_PATTERN = /\s*[×x]\s*(\d+)\s*$/i;
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

export function clampRemovalItemQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return MIN_QUANTITY;
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.round(quantity)));
}

export function sanitizeRemovalItemLabel(label: string): string {
  return label.replace(/[\r\n]+/g, " ").trim();
}

export function parseRemovalItemEntries(value: string): RemovalItemEntry[] {
  const entries: RemovalItemEntry[] = [];
  const parts = value.includes("\n") ? value.split("\n") : value.split(",");

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const match = trimmed.match(QUANTITY_PATTERN);
    let label = trimmed;
    let quantity = 1;

    if (match) {
      label = trimmed.slice(0, match.index).trim();
      quantity = clampRemovalItemQuantity(Number(match[1]));
    }

    label = sanitizeRemovalItemLabel(label);
    if (!label) continue;

    const existingIndex = entries.findIndex(
      (entry) => entry.label.toLowerCase() === label.toLowerCase(),
    );

    if (existingIndex >= 0) {
      const existing = entries[existingIndex]!;
      entries[existingIndex] = {
        label: existing.label,
        quantity: clampRemovalItemQuantity(existing.quantity + quantity),
      };
      continue;
    }

    entries.push({ label, quantity });
  }

  return entries;
}

export function serializeRemovalItemEntries(
  entries: readonly RemovalItemEntry[],
): string {
  return entries
    .map((entry) => {
      const label = sanitizeRemovalItemLabel(entry.label);
      if (!label) return "";
      const quantity = clampRemovalItemQuantity(entry.quantity);
      return `${label} ×${quantity}`;
    })
    .filter(Boolean)
    .join("\n");
}
