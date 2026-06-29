import { BUSINESS } from "@/lib/seo";

export const LEGAL = {
  companyName: "URBANMOVE LOGISTICS LTD",
  companyNumber: "SC872412",
  vatNumber: "509914375",
  registeredOffice: {
    line1: "64 Menzies Rd",
    line2: "Aberdeen City",
    postalCode: "AB11 9BH",
  },
  regulatoryText:
    "Urbanmove Logistics Ltd is a UK-registered transport services company regulated by HM Revenue & Customs (HMRC) for tax and VAT compliance, Companies House for corporate governance and statutory filings, the Driver and Vehicle Standards Agency (DVSA) and Driver and Vehicle Licensing Agency (DVLA) for vehicle and driver compliance, and the Information Commissioner's Office (ICO) for data protection and GDPR compliance.",
} as const;

export const FOOTER_LEGAL_LINKS = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Legal notice", href: "/legal" },
] as const;

export const SOCIAL_LINKS = [
  {
    label: "Google Business Profile",
    href: BUSINESS.sameAs[0],
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/urbanmovelogistics",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@urbanmovelogistics",
  },
  {
    label: "WhatsApp",
    href: BUSINESS.whatsapp,
  },
] as const;
