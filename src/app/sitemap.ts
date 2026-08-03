import type { MetadataRoute } from "next";
import { NAV_SERVICE_ORDER } from "@/lib/services-data";
import { SITE_URL, SITEMAP_LAST_MODIFIED } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/contact", "/services", "/privacy", "/legal"] as const;

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: SITEMAP_LAST_MODIFIED,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/services" ? 0.9 : 0.8,
  }));

  const serviceEntries: MetadataRoute.Sitemap = NAV_SERVICE_ORDER.map((slug) => ({
    url: `${SITE_URL}/services/${slug}`,
    lastModified: SITEMAP_LAST_MODIFIED,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...serviceEntries];
}
