import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/about-us/",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/contact-us/",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/legal-notice",
        destination: "/legal",
        permanent: true,
      },
      {
        source: "/legal-notice/",
        destination: "/legal",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
