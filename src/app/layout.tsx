import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";
import {
  DEFAULT_KEYWORDS,
  defaultOpenGraphImages,
  getMovingCompanyJsonLd,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Urbanmove Logistics | Removals, Courier & Waste Clearance in Aberdeen",
    template: "%s | Urbanmove Logistics",
  },
  description:
    "Professional removals, same-day courier and waste clearance in Aberdeen and across the UK. Trusted local logistics.",
  keywords: DEFAULT_KEYWORDS,
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_NAME,
    images: [...defaultOpenGraphImages],
  },
  twitter: {
    card: "summary_large_image",
    images: [defaultOpenGraphImages[0].url],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {process.env.NEXT_PUBLIC_GTM_ID ? (
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        ) : null}
        <JsonLd data={getMovingCompanyJsonLd()} />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
