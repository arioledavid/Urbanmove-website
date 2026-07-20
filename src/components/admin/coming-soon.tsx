type ComingSoonProps = {
  title: string;
  description?: string;
};

export function ComingSoon({
  title,
  description = "This module is on the roadmap and will be available in a later phase.",
}: ComingSoonProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-start justify-center rounded-lg border border-border bg-paper px-6 py-12 sm:px-10">
      <p className="text-xs font-medium tracking-[0.12em] text-muted uppercase">
        Coming soon
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted text-pretty">
        {description}
      </p>
    </div>
  );
}
