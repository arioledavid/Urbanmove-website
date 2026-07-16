import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata = { title: "Quotes" };

export default function QuotesPage() {
  return (
    <ComingSoon
      title="Quotes"
      description="Quote sending and document generation stay out of Phase 0 and Phase 1. Manual quoting continues outside the system."
    />
  );
}
