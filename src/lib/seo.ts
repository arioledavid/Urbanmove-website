import type { Metadata } from "next";
import type { ServiceData, ServiceSlug } from "@/lib/services-data";
import { getServiceHeroDescription } from "@/lib/services-data";

export const SITE_URL = "https://www.urbanmovelogistics.co.uk";
export const SITE_NAME = "UrbanMove Removals Man and Van Cleaning Services Ltd";
export const DEFAULT_OG_IMAGE = "/og-image.png";
export const DEFAULT_OG_IMAGE_ALT = SITE_NAME;
export const STANDARD_OG_WIDTH = 1200;
export const STANDARD_OG_HEIGHT = 630;

export const defaultOpenGraphImages = [
  {
    url: DEFAULT_OG_IMAGE,
    width: 1424,
    height: 752,
    alt: DEFAULT_OG_IMAGE_ALT,
  },
] as const;

type SocialMetadataOptions = {
  title: string;
  description: string;
  canonical?: string;
  absoluteTitle?: boolean;
  image?: string;
  imageAlt?: string;
  robots?: Metadata["robots"];
};

function resolveOpenGraphImages(
  image: string = DEFAULT_OG_IMAGE,
  alt: string = DEFAULT_OG_IMAGE_ALT,
) {
  if (image === DEFAULT_OG_IMAGE) {
    return [...defaultOpenGraphImages];
  }

  if (image.startsWith("/og/")) {
    return [
      {
        url: image,
        width: STANDARD_OG_WIDTH,
        height: STANDARD_OG_HEIGHT,
        alt,
      },
    ];
  }

  return [{ url: image, alt }];
}

export function buildSocialMetadata({
  title,
  description,
  canonical,
  absoluteTitle = false,
  image = DEFAULT_OG_IMAGE,
  imageAlt = DEFAULT_OG_IMAGE_ALT,
  robots,
}: SocialMetadataOptions): Metadata {
  const ogTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const images = resolveOpenGraphImages(image, imageAlt);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    ...(robots ? { robots } : {}),
    openGraph: {
      title: ogTitle,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [images[0]?.url ?? DEFAULT_OG_IMAGE],
    },
  };
}

export function buildServiceMetadata(
  slug: ServiceSlug,
  service: ServiceData,
): Metadata {
  const image =
    "ogImage" in service && service.ogImage ? service.ogImage : service.image;

  return buildSocialMetadata({
    title: service.title,
    description: getServiceHeroDescription(service),
    canonical: `/services/${slug}`,
    image,
    imageAlt: service.imageAlt,
  });
}

export const DEFAULT_KEYWORDS = [
  "removals Aberdeen",
  "house removals Aberdeen",
  "office removals Aberdeen",
  "man and van Aberdeen",
  "storage Aberdeen",
  "furniture storage Aberdeen",
  "same day courier Aberdeen",
  "waste clearance Aberdeen",
  "furniture delivery Aberdeen",
  "student moves Aberdeen",
  "cargo logistics UK",
  "UrbanMove Removals Man and Van Cleaning Services Ltd",
];

/** Formats E.164 UK numbers for display, e.g. +447776446254 → +44 7776 446254 */
export function formatTelephoneDisplay(telephone: string): string {
  const digits = telephone.replace(/\D/g, "");

  if (digits.startsWith("44") && digits.length === 12) {
    const national = digits.slice(2);
    return `+44 ${national.slice(0, 4)} ${national.slice(4)}`;
  }

  return telephone;
}

const BUSINESS_TELEPHONE = "+447776446254";

/** Business details used in JSON-LD and site metadata. */
export const BUSINESS = {
  name: SITE_NAME,
  url: SITE_URL,
  telephone: BUSINESS_TELEPHONE,
  telephoneDisplay: formatTelephoneDisplay(BUSINESS_TELEPHONE),
  whatsapp: `https://wa.me/${BUSINESS_TELEPHONE.replace(/\D/g, "")}`,
  email: "info@urbanmovelogistics.co.uk",
  address: {
    streetAddress:
      "Enterprise Centre Exploration Drive, Aberdeen Science And Energy Park, Bridge Of Don",
    addressLocality: "Aberdeen",
    addressRegion: "Scotland",
    postalCode: "AB23 8GX",
    addressCountry: "GB",
  },
  /** Approximate coordinates for AB23 8GX (Exploration Drive, Bridge of Don). */
  geo: {
    latitude: 57.1848,
    longitude: -2.0906,
  },
  sameAs: [
    "https://share.google/AHsYcQG5lAIDC5gYW",
    "https://www.instagram.com/urbanmovelogistics",
    "https://www.tiktok.com/@urbanmovelogistics",
  ],
} as const;

/** Captured when this module is evaluated (build time when sitemap is force-static). */
export const SITEMAP_LAST_MODIFIED = new Date();

const AREA_SERVED = [
  { "@type": "City", name: "Aberdeen" },
  { "@type": "Country", name: "United Kingdom" },
] as const;

export function getMovingCompanyJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    name: BUSINESS.name,
    url: BUSINESS.url,
    telephone: BUSINESS.telephone,
    email: BUSINESS.email,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: BUSINESS.telephone,
        contactType: "customer service",
        availableLanguage: "English",
      },
      {
        "@type": "ContactPoint",
        url: BUSINESS.whatsapp,
        contactType: "customer service",
        availableLanguage: "English",
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.streetAddress,
      addressLocality: BUSINESS.address.addressLocality,
      addressRegion: BUSINESS.address.addressRegion,
      postalCode: BUSINESS.address.postalCode,
      addressCountry: BUSINESS.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.geo.latitude,
      longitude: BUSINESS.geo.longitude,
    },
    areaServed: [...AREA_SERVED],
    sameAs: BUSINESS.sameAs,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
  };
}

export function getServiceJsonLd(slug: ServiceSlug, service: ServiceData) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: getServiceHeroDescription(service),
    url: `${SITE_URL}/services/${slug}`,
    image: `${SITE_URL}${service.image}`,
    provider: {
      "@type": "MovingCompany",
      name: BUSINESS.name,
      url: BUSINESS.url,
    },
    areaServed: [...AREA_SERVED],
  };
}

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function getBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}
