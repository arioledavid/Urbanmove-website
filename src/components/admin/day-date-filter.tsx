"use client";

import { useRouter } from "next/navigation";

type DayDateFilterProps = {
  value: string;
};

export function DayDateFilter({ value }: DayDateFilterProps) {
  const router = useRouter();

  return (
    <div className="w-full sm:w-56">
      <label
        htmlFor="day"
        className="mb-1 block text-xs font-medium text-muted"
      >
        Day
      </label>
      <input
        id="day"
        type="date"
        defaultValue={value}
        onChange={(event) => {
          const next = event.target.value;
          if (next) router.push(`/calendar/${next}`);
        }}
        className="h-11 w-full rounded-md border border-border bg-paper px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-10"
      />
    </div>
  );
}
