interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Section({ title, description, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-3 rounded-card border border-border bg-surface p-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-body-lg leading-6 font-semibold text-text-strong">{title}</h2>
        {description ? <p className="text-meta leading-4 text-text-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
