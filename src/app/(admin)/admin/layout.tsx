import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin | UrbanMove Logistics",
    template: "%s | UrbanMove Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
