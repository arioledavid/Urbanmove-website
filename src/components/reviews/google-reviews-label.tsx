import { cn } from "@/lib/utils";

const GOOGLE_COLORS = {
  blue: "#4285F4",
  red: "#EA4335",
  yellow: "#FBBC05",
  green: "#34A853",
} as const;

type GoogleReviewsLabelProps = {
  className?: string;
};

export function GoogleReviewsLabel({ className }: GoogleReviewsLabelProps) {
  return (
    <p
      className={cn(
        "flex items-baseline gap-1 font-medium tracking-[0.12em]",
        className,
      )}
    >
      <span aria-hidden className="text-lg">
        <span style={{ color: GOOGLE_COLORS.blue }}>G</span>
        <span style={{ color: GOOGLE_COLORS.red }}>o</span>
        <span style={{ color: GOOGLE_COLORS.yellow }}>o</span>
        <span style={{ color: GOOGLE_COLORS.blue }}>g</span>
        <span style={{ color: GOOGLE_COLORS.green }}>l</span>
        <span style={{ color: GOOGLE_COLORS.red }}>e</span>
      </span>
      <span className="text-sm text-ink">Reviews</span>
    </p>
  );
}
