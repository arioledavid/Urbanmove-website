export type CleaningServiceData = {
  title: string;
  subtitle: string;
  navDescription: string;
  image: string;
  imageAlt: string;
  heroDescription: string;
  metaDescription?: string;
  serviceType: string;
  steps: { title: string; description: string }[];
  features: string[];
};

export const CLEANING_HUB = {
  title: "Cleaning Services in Aberdeen",
  subtitle: "Every kind of clean, one trusted team.",
  navDescription:
    "End of tenancy, deep, residential and office cleaning across Aberdeen.",
  heroDescription:
    "From move-out cleans that protect your deposit to scheduled office cleaning, choose the service that fits your space.",
  metaDescription:
    "End of tenancy, deep, residential and office cleaning in Aberdeen. Reliable, insured cleaning teams for homes, lets and workplaces.",
  metaTitle:
    "Cleaning Services in Aberdeen | UrbanMove Removals Man and Van Cleaning Services Ltd",
  image: "/cleaning-services.png",
  imageAlt:
    "UrbanMove Removals Man and Van Cleaning Services Ltd cleaner using industrial floor equipment on an outdoor walkway in Aberdeen",
  href: "/services/cleaning",
} as const;

export const CLEANING_SERVICES = {
  "end-of-tenancy-cleaning": {
    title: "End of Tenancy Cleaning in Aberdeen",
    subtitle: "Move out clean. Move on stress-free.",
    navDescription:
      "Checklist-driven move-out cleans that meet landlord and letting agent standards.",
    image: "/end-of-tenancy-cleaning.png",
    imageAlt:
      "UrbanMove Removals Man and Van Cleaning Services Ltd cleaner sanitising a kitchen countertop during an end of tenancy clean in Aberdeen",
    heroDescription:
      "Thorough, checklist-driven cleaning built to landlord and letting agent standards, so your handover goes smoothly and your deposit isn't at risk.",
    metaDescription:
      "Professional end of tenancy cleaning in Aberdeen that meets landlord and letting agent standards, helping tenants secure their full deposit back.",
    serviceType: "End of Tenancy Cleaning",
    steps: [
      {
        title: "Scope & quote",
        description:
          "Property size, checkout date, and landlord/agent checklist requirements confirmed upfront.",
      },
      {
        title: "Top-to-bottom clean",
        description:
          "Kitchen, bathrooms, carpets, and every fixture cleaned to inventory standard.",
      },
      {
        title: "Handover & sign-off",
        description:
          "Final walkthrough against the checklist, ready for inspection.",
      },
    ],
    features: [
      "Kitchen appliance degreasing (oven, extractor, fridge, hob)",
      "Bathroom limescale, grout and mould treatment",
      "Carpet and upholstery deep clean",
      "Skirting boards, door frames, switches and light fittings",
      "Landlord and letting agent checklist compliance",
    ],
  },
  "deep-cleaning": {
    title: "Deep Cleaning in Aberdeen",
    subtitle: "Beyond the surface. A true reset for your space.",
    navDescription:
      "Intensive room-by-room cleans for spring cleans, post-renovation, or a fresh start.",
    image: "/deep-cleaning.png",
    imageAlt:
      "UrbanMove Removals Man and Van Cleaning Services Ltd cleaner using professional upholstery extraction equipment during a deep clean in Aberdeen",
    heroDescription:
      "A detailed, room-by-room clean for homes that need more than a routine tidy, ideal for spring cleans, post-renovation, or a fresh start.",
    metaDescription:
      "Intensive deep cleaning for homes and properties in Aberdeen, reaching the areas routine cleans miss, from grout and grease to hidden dust.",
    serviceType: "Deep Cleaning",
    steps: [
      {
        title: "Assessment",
        description:
          "Room-by-room evaluation to flag problem areas and build a clean plan.",
      },
      {
        title: "Intensive clean",
        description:
          "Kitchens, bathrooms, high-touch surfaces and hard-to-reach areas fully cleaned.",
      },
      {
        title: "Final inspection",
        description: "Quality check against the plan before handover.",
      },
    ],
    features: [
      "Kitchen degreasing and appliance interiors",
      "Bathroom descaling and grout restoration",
      "Skirting boards, door frames and light fittings",
      "Interior windows and sills",
      "Behind and under furniture and appliances",
      "Available as a one-off or recurring service",
    ],
  },
  "residential-cleaning": {
    title: "Residential Cleaning in Aberdeen",
    subtitle: "A cleaner home, on your schedule.",
    navDescription:
      "Regular or one-off home cleans tailored to your household and schedule.",
    image: "/residential-cleaning.png",
    imageAlt:
      "UrbanMove Removals Man and Van Cleaning Services Ltd residential cleaner wiping a soapy surface during a home clean in Aberdeen",
    heroDescription:
      "Consistent, trustworthy home cleaning built around your routine, whether that's a weekly visit or an occasional one-off clean.",
    metaDescription:
      "Reliable residential cleaning in Aberdeen, regular or one-off home cleans tailored to your household and schedule.",
    serviceType: "Residential Cleaning",
    steps: [
      {
        title: "Book your clean",
        description: "Choose one-off, weekly, or fortnightly visits.",
      },
      {
        title: "Trusted team arrives",
        description: "Vetted cleaners follow your property's checklist.",
      },
      {
        title: "Consistent results",
        description: "The same standard delivered every visit.",
      },
    ],
    features: [
      "Kitchen and bathroom sanitisation",
      "Dusting, vacuuming and mopping",
      "Bedroom and living space tidy",
      "Flexible weekly, fortnightly or one-off plans",
      "Vetted and insured cleaning staff",
      "Optional add-ons (ironing, oven clean, interior windows)",
    ],
  },
  "office-cleaning": {
    title: "Office Cleaning in Aberdeen",
    subtitle: "A cleaner workplace. A sharper impression.",
    navDescription:
      "Commercial cleaning with flexible out-of-hours scheduling for Aberdeen workplaces.",
    image: "/office-cleaning.png",
    imageAlt:
      "UrbanMove Removals Man and Van Cleaning Services Ltd cleaner sanitising a desk and workspace during office cleaning in Aberdeen",
    heroDescription:
      "Scheduled commercial cleaning that fits around your business hours, so your office stays presentable without disrupting the working day.",
    metaDescription:
      "Commercial office cleaning in Aberdeen with flexible out-of-hours scheduling, keeping your workplace presentable for staff and clients.",
    serviceType: "Office Cleaning",
    steps: [
      {
        title: "Site walkthrough & plan",
        description: "Space assessed and a cleaning schedule agreed.",
      },
      {
        title: "Scheduled cleaning",
        description:
          "Out-of-hours or agreed slots to avoid disrupting your team.",
      },
      {
        title: "Ongoing quality checks",
        description: "Regular reviews to maintain the standard.",
      },
    ],
    features: [
      "Desks, communal areas and kitchens",
      "Washroom sanitisation and restocking",
      "Bins, recycling and waste management",
      "Floor care (vacuuming, mopping, carpets)",
      "Flexible daily, weekly or contract cleaning",
      "Out-of-hours and weekend scheduling available",
    ],
  },
} satisfies Record<string, CleaningServiceData>;

export type CleaningServiceSlug = keyof typeof CLEANING_SERVICES;

export const CLEANING_SERVICE_SLUGS = Object.keys(
  CLEANING_SERVICES,
) as CleaningServiceSlug[];

export const CLEANING_NAV_ORDER: CleaningServiceSlug[] = [
  "end-of-tenancy-cleaning",
  "deep-cleaning",
  "residential-cleaning",
  "office-cleaning",
];

export function isCleaningServiceSlug(
  slug: string,
): slug is CleaningServiceSlug {
  return slug in CLEANING_SERVICES;
}

export function getCleaningServiceBySlug(
  slug: string,
): CleaningServiceData | null {
  if (isCleaningServiceSlug(slug)) {
    return CLEANING_SERVICES[slug];
  }
  return null;
}

export function getCleaningHeroDescription(service: CleaningServiceData): string {
  return service.heroDescription;
}

export function getCleaningBookingHref(slug: CleaningServiceSlug): string {
  return `/contact?service=${slug}#quote`;
}

export type ContactServiceContext = {
  plannerService: "cleaning";
  cleaningSlug: CleaningServiceSlug;
  cleaningLabel: string;
};

export function getContactContextFromServiceSlug(
  slug: string,
): ContactServiceContext | null {
  if (!isCleaningServiceSlug(slug)) {
    return null;
  }

  const service = CLEANING_SERVICES[slug];

  return {
    plannerService: "cleaning",
    cleaningSlug: slug,
    cleaningLabel: service.title,
  };
}

export const CLEANING_TYPE_OPTIONS = CLEANING_NAV_ORDER.map((slug) => ({
  id: slug,
  label: CLEANING_SERVICES[slug].serviceType,
}));

export function getCleaningTypeLabel(slug: string): string | null {
  if (!isCleaningServiceSlug(slug)) return null;
  return CLEANING_SERVICES[slug].serviceType;
}
