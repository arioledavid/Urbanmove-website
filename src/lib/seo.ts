import type { Metadata } from "next";
import type { ServiceData, ServiceSlug } from "@/lib/services-data";

export const SITE_URL = "https://www.urbanmovelogistics.co.uk";
export const SITE_NAME = "Urban Move Logistics";
export const DEFAULT_OG_IMAGE = "/og-image.png";
export const DEFAULT_OG_IMAGE_ALT = SITE_NAME;

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
  robots?: Metadata["robots"];
};

function resolveOpenGraphImages(image: string = DEFAULT_OG_IMAGE) {
  if (image === DEFAULT_OG_IMAGE) {
    return [...defaultOpenGraphImages];
  }

  return [{ url: image, alt: DEFAULT_OG_IMAGE_ALT }];
}

export function buildSocialMetadata({
  title,
  description,
  canonical,
  absoluteTitle = false,
  image = DEFAULT_OG_IMAGE,
  robots,
}: SocialMetadataOptions): Metadata {
  const ogTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const images = resolveOpenGraphImages(image);

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
  return buildSocialMetadata({
    title: service.title,
    description: service.heroDescription,
    canonical: `/services/${slug}`,
    image: service.image,
  });
}

export const DEFAULT_KEYWORDS = [
  "removals Aberdeen",
  "house removals Aberdeen",
  "office removals Aberdeen",
  "same day courier Aberdeen",
  "waste clearance Aberdeen",
  "furniture delivery Aberdeen",
  "student moves Aberdeen",
  "cargo logistics UK",
  "Urban Move Logistics",
];

/** Business details used in JSON-LD and site metadata. */
export const BUSINESS = {
  name: SITE_NAME,
  url: SITE_URL,
  telephone: "+447776446254",
  telephoneDisplay: "07776 446254",
  whatsapp: "https://wa.me/447776446254",
  email: "info@urbanmovelogistics.co.uk",
  address: {
    streetAddress: "Flat B, 64 Menzies Road",
    addressLocality: "Aberdeen",
    addressRegion: "Scotland",
    postalCode: "AB11 9BH",
    addressCountry: "GB",
  },
  sameAs: [
    "https://share.google/AHsYcQG5lAIDC5gYW",
    "https://www.instagram.com/urbanmovelogistics",
    "https://www.tiktok.com/@urbanmovelogistics",
  ],
} as const;

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
    areaServed: [
      { "@type": "City", name: "Aberdeen" },
      { "@type": "Country", name: "United Kingdom" },
    ],
    sameAs: BUSINESS.sameAs,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
  };
}

export function getServiceJsonLd(slug: ServiceSlug, service: ServiceData) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.heroDescription,
    url: `${SITE_URL}/services/${slug}`,
    image: `${SITE_URL}${service.image}`,
    provider: {
      "@type": "MovingCompany",
      name: BUSINESS.name,
      url: BUSINESS.url,
    },
    areaServed: { "@type": "Country", name: "United Kingdom" },
  };
}
