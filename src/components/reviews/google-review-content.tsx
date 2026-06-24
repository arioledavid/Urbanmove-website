import Image from "next/image";
import type { GoogleReview } from "@/lib/reviews-data";
import { StarRating } from "@/components/ui/star-rating";
import { RelativeReviewDate } from "@/components/reviews/relative-review-date";
import { cn } from "@/lib/utils";
import { GoogleReviewBadge } from "./google-review-badge";

type GoogleReviewContentProps = {
  review: GoogleReview;
  compact?: boolean;
  showBadge?: boolean;
  showAvatar?: boolean;
};

export function GoogleReviewContent({
  review,
  compact = false,
  showBadge = true,
  showAvatar = true,
}: GoogleReviewContentProps) {
  return (
    <div className={cn("flex flex-col", compact ? "gap-3" : "gap-4")}>
      <div className="flex items-start gap-3">
        {showAvatar ? (
          <div
            className={cn(
              "relative shrink-0 overflow-hidden rounded-full bg-surface",
              compact ? "h-12 w-12" : "h-14 w-14",
            )}
          >
            <Image
              src={review.image}
              alt={review.name}
              fill
              unoptimized
              className="object-cover"
              sizes={compact ? "96px" : "112px"}
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{review.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StarRating rating={review.rating} size="sm" />
            <RelativeReviewDate
              postedAt={review.postedAt}
              className="text-sm text-muted"
            />
          </div>
        </div>
      </div>

      <p
        className={cn(
          "leading-relaxed text-ink/80",
          compact ? "text-sm line-clamp-5" : "text-base",
        )}
      >
        {review.comment}
      </p>

      {showBadge ? <GoogleReviewBadge /> : null}
    </div>
  );
}
