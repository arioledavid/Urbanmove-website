type ActivityItem = {
  id: string;
  type: string;
  message: string;
  entityReference: string | null;
  createdAt: Date;
};

type ActivityTimelineProps = {
  items: ActivityItem[];
  emptyMessage?: string;
};

export function ActivityTimeline({
  items,
  emptyMessage = "No activity yet.",
}: ActivityTimelineProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-paper">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-start justify-between gap-4 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm text-ink">{item.message}</p>
            <p className="mt-0.5 text-xs text-muted">
              {item.entityReference ?? item.type}
            </p>
          </div>
          <time className="shrink-0 text-xs text-subtle">
            {item.createdAt.toLocaleString("en-GB")}
          </time>
        </li>
      ))}
    </ul>
  );
}
