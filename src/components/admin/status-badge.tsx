import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  neutral: "bg-surface text-muted border-border",
  info: "bg-surface text-ink border-border",
  warning: "bg-[#FFF8E6] text-[#8A6D00] border-[#F0E0A0]",
  success: "bg-[#EEF8F0] text-[#1F6B3A] border-[#C5E6CF]",
  danger: "bg-[#FDECEC] text-primary border-[#F5C4C0]",
  accent: "bg-[#FFF1F0] text-primary border-[#F5C4C0]",
} as const;

type Tone = keyof typeof TONE_CLASSES;

type StatusBadgeProps = {
  label: string;
  tone?: Tone;
  className?: string;
};

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

export function enquiryStatusTone(
  status: string,
): Tone {
  switch (status) {
    case "NEW":
      return "accent";
    case "CONTACTED":
    case "QUOTE_SENT":
      return "info";
    case "ACCEPTED":
    case "DEPOSIT_PAID":
      return "warning";
    case "JOB_CREATED":
    case "SCHEDULED":
      return "info";
    case "COMPLETED":
      return "success";
    case "LOST":
    case "SPAM":
      return "danger";
    default:
      return "neutral";
  }
}

export function jobStatusTone(status: string): Tone {
  switch (status) {
    case "DRAFT":
      return "neutral";
    case "SCHEDULED":
      return "info";
    case "IN_PROGRESS":
      return "warning";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "danger";
    default:
      return "neutral";
  }
}
