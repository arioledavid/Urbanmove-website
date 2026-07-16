import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // admin.lvh.me / admin.localhost are not the process hostname (localhost).
  // Without this, Next blocks Server Actions and /_next/* from those hosts in dev.
  allowedDevOrigins: [
    "admin.lvh.me",
    "admin.localhost",
    "*.lvh.me",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "admin.lvh.me",
        "admin.lvh.me:3000",
        "admin.localhost",
        "admin.localhost:3000",
        "localhost:3000",
      ],
    },
  },
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
