export const SERVICES_DATA = {
  "house-office-removals": {
    title: "House & Office Removals",
    subtitle: "A seamless transition, engineered around your timeline.",
    navDescription:
      "Tailored moving services with strict timelines and zero stress.",
    image: "/removal.jpg",
    imageAlt:
      "Urban Move Logistics team carrying labelled moving boxes during a house removal in Aberdeen",
    heroDescription:
      "Whether moving a high-end corporate headquarters or a premium residential estate, we eliminate the friction. Our team manages every detail with absolute care and zero stress.",
    steps: [
      {
        title: "Consultation & survey",
        description:
          "We assess scope, access routes, and timelines before a single box is packed.",
      },
      {
        title: "Pack, protect & load",
        description:
          "Premium wrapping, labelled inventory, and careful loading onto our fleet.",
      },
      {
        title: "Deliver & place",
        description:
          "Items placed exactly where you need them, with packaging cleared on request.",
      },
    ],
    features: [
      "Custom packing & premium asset protection wrap",
      "Deconstruction and placement mapping",
      "Dedicated coordinator for commercial relocations",
      "Flexible scheduling to prevent business downtime",
    ],
  },
  "same-day-courier": {
    title: "Same Day Courier",
    subtitle: "When timing is everything. Direct and instantaneous.",
    navDescription: "Rapid pickup and direct delivery across the UK.",
    image: "/same-day-courier.png",
    imageAlt:
      "Urban Move Logistics courier handing a same-day parcel delivery to a customer in Aberdeen",
    heroDescription:
      "High-priority courier service designed for rapid dispatch and zero-delay transit across the UK. Absolute transparency from secure pickup to electronic proof of delivery.",
    steps: [
      {
        title: "Instant dispatch",
        description:
          "Vehicle assigned and en route within minutes of confirmation.",
      },
      {
        title: "Direct transit",
        description:
          "Point-to-point delivery with live tracking and no hub stops.",
      },
      {
        title: "Proof of delivery",
        description:
          "Electronic confirmation sent the moment your parcel arrives.",
      },
    ],
    features: [
      "Instant vehicle dispatch upon confirmation",
      "Direct point-to-point delivery with zero hub stops",
      "Real-time tracking and instant arrival notifications",
      "Vetted, priority transport handling",
    ],
  },
  "furniture-delivery-assembly": {
    title: "Furniture Delivery & Assembly",
    subtitle: "White-glove logistics. From showroom to living room.",
    navDescription: "Secure transport, unboxing, and precise assembly.",
    image: "/furniture-delivery.png",
    imageAlt:
      "Urban Move Logistics movers delivering and assembling furniture in Aberdeen",
    heroDescription:
      "We don't just drop off heavy boxes. Our specialized team handles careful secure transport, meticulous unboxing, and precise assembly exactly where you intend it to live.",
    steps: [
      {
        title: "Scheduled collection",
        description:
          "Pickup from showroom, warehouse, or retailer on your chosen slot.",
      },
      {
        title: "White-glove delivery",
        description:
          "Room-of-choice placement with full protection throughout transit.",
      },
      {
        title: "Assembly & sign-off",
        description:
          "Expert build, structural check, and packaging removal included.",
      },
    ],
    features: [
      "White-glove room of choice delivery",
      "Expert assembly of complex and luxury furniture lines",
      "Comprehensive structural check post-assembly",
      "Complete disposal and eco-recycling of packaging material",
    ],
  },
  "household-waste-clearance": {
    title: "Household Waste Clearance",
    subtitle: "Responsible space clearance. Reclaim your environment.",
    navDescription: "Licensed, thorough clearance with responsible disposal.",
    image: "/household-waste.jpg",
    imageAlt:
      "Urban Move Logistics household waste clearance team removing items from a property in Aberdeen",
    heroDescription:
      "Efficient, licensed, and thorough property clearance that respects your home and the ecosystem. We ethically process, recycle, and repurpose unwanted items with speed and care.",
    steps: [
      {
        title: "Scope & quote",
        description:
          "Quick assessment of volume, access, and disposal requirements.",
      },
      {
        title: "Clear & sort",
        description:
          "Items removed, sorted for recycling, donation, or licensed disposal.",
      },
      {
        title: "Clean handover",
        description:
          "Space swept down and transfer documentation provided on completion.",
      },
    ],
    features: [
      "Full domestic estate and commercial site decluttering",
      "Eco-certified waste transfer documentation provided",
      "Immaculate sweep-down post clearance",
      "Ethical donation routing for reusable goods",
    ],
  },
  "student-moves": {
    title: "Student Moves",
    subtitle: "Streamlined relocation built around your academic term.",
    navDescription: "Fast, organized relocations built around term dates.",
    image: "/student-moves.png",
    imageAlt:
      "Urban Move Logistics van helping a student move belongings in Aberdeen",
    heroDescription:
      "Moving shouldn't disrupt your studies. We provide highly organized, efficient, and budget-conscious transit options customized around strict university timelines.",
    steps: [
      {
        title: "Book around your term",
        description:
          "Flexible slots aligned to move-in, move-out, and exam periods.",
      },
      {
        title: "Curb-to-room handling",
        description:
          "Load at origin and deliver directly to your accommodation.",
      },
      {
        title: "Settled in",
        description:
          "Confirm everything is in place before we leave—no hidden extras.",
      },
    ],
    features: [
      "Hassle-free curb-to-room handling options",
      "Inter-city campus transit across the United Kingdom",
      "Secure short-term holding transit available",
      "Flexible booking adjustments for term fluctuations",
    ],
  },
  cargo: {
    title: "Cargo & Freight Logistics",
    subtitle: "Secure freight transport with complete supply chain visibility.",
    navDescription:
      "Secure freight transport with full pickup to delivery visibility.",
    image: "/cargo.png",
    imageAlt:
      "Urban Move Logistics cargo and freight pallets prepared for secure UK delivery",
    heroDescription:
      "Comprehensive B2B and palletized distribution designed around strict logistical dependencies. We track every mile to guarantee that your heavy freight arrives in mint condition.",
    steps: [
      {
        title: "Route planning",
        description:
          "Load dimensions, delivery windows, and security requirements mapped.",
      },
      {
        title: "Secure loading",
        description:
          "Palletised or loose freight secured and documented before departure.",
      },
      {
        title: "Tracked delivery",
        description:
          "Mile-by-mile visibility until signed delivery at destination.",
      },
    ],
    features: [
      "Tailored distribution mapping for commercial accounts",
      "Heavy freight and irregular dimensional load handling",
      "Meticulous load security checks prior to transit",
      "Transparent multi-point digital documentation tracking",
    ],
  },
} as const;

export type ServiceSlug = keyof typeof SERVICES_DATA;

export type ServiceData = (typeof SERVICES_DATA)[ServiceSlug];

export const SERVICE_SLUGS = Object.keys(SERVICES_DATA) as ServiceSlug[];

export function getServiceBySlug(slug: string): ServiceData | null {
  if (slug in SERVICES_DATA) {
    return SERVICES_DATA[slug as ServiceSlug];
  }
  return null;
}

export function isServiceSlug(slug: string): slug is ServiceSlug {
  return slug in SERVICES_DATA;
}

/** Maps service page slugs to the interactive planner's service identifiers. */
export const SERVICE_SLUG_TO_PLANNER = {
  "house-office-removals": "removal",
  "same-day-courier": "courier",
  "furniture-delivery-assembly": "removal",
  "household-waste-clearance": "removal",
  "student-moves": "removal",
  cargo: "cargo",
} as const satisfies Record<ServiceSlug, "cargo" | "removal" | "courier">;

export function getPlannerServiceFromSlug(
  slug: string,
): "cargo" | "removal" | "courier" | null {
  if (!isServiceSlug(slug)) return null;
  return SERVICE_SLUG_TO_PLANNER[slug];
}

export function getServiceBookingHref(slug: ServiceSlug): string {
  return `/contact?service=${slug}#quote`;
}

/** Display order for home sticky-scroll and hero flip (courier first). */
export const HOME_SERVICE_ORDER: ServiceSlug[] = [
  "same-day-courier",
  "house-office-removals",
  "furniture-delivery-assembly",
  "student-moves",
  "household-waste-clearance",
  "cargo",
];

/** Display order for nav, footer, and services hub. */
export const NAV_SERVICE_ORDER: ServiceSlug[] = [
  "house-office-removals",
  "same-day-courier",
  "furniture-delivery-assembly",
  "household-waste-clearance",
  "student-moves",
  "cargo",
];

export type ServiceLink = {
  label: string;
  href: string;
  description: string;
  image: string;
};

export function getServiceLinks(order: ServiceSlug[] = NAV_SERVICE_ORDER): ServiceLink[] {
  return order.map((slug) => {
    const service = SERVICES_DATA[slug];
    return {
      label: service.title,
      href: `/services/${slug}`,
      description: service.navDescription,
      image: service.image,
    };
  });
}

export const SERVICE_LINKS = getServiceLinks();

export function getHomeStickyScrollContent() {
  return HOME_SERVICE_ORDER.map((slug) => {
    const service = SERVICES_DATA[slug];
    return {
      title: service.title,
      tagline: service.subtitle,
      description: service.heroDescription,
      image: service.image,
      imageAlt: service.imageAlt,
    };
  });
}

export function getHomeHeroServiceTitles(): string[] {
  return HOME_SERVICE_ORDER.map((slug) => SERVICES_DATA[slug].title);
}
