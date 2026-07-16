import {
  GoogleAnalytics,
  GoogleTagManager,
} from "@next/third-parties/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { getMovingCompanyJsonLd } from "@/lib/seo";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
const gaId =
  process.env.NEXT_PUBLIC_GA_ID ??
  (gtmId?.startsWith("G-") ? gtmId : undefined);
const gtmContainerId = gtmId?.startsWith("GTM-") ? gtmId : undefined;

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      {gtmContainerId ? <GoogleTagManager gtmId={gtmContainerId} /> : null}
      <JsonLd data={getMovingCompanyJsonLd()} />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
