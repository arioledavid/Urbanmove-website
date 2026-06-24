import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Urban Move Logistics",
    short_name: "Urban Move",
    theme_color: "#000000",
    background_color: "#000000",
    display: "standalone",
    start_url: "/",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}
