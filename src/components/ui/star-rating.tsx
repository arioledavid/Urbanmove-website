import { cn } from "@/lib/utils";

const STAR_PATH =
  "M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z";

type StarRatingProps = {
  rating: number;
  max?: number;
  className?: string;
  size?: "sm" | "md";
};

export function StarRating({
  rating,
  max = 5,
  className,
  size = "md",
}: StarRatingProps) {
  const clamped = Math.max(0, Math.min(max, Math.round(rating)));
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${clamped} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, index) => (
        <svg
          key={index}
          viewBox="0 0 24 24"
          aria-hidden
          className={cn(iconSize, index < clamped ? "text-[#FBBC05]" : "text-border")}
          fill="currentColor"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}
