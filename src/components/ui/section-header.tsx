export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-4 border-b border-line/60 pb-3">
      <div>
        <h2 className="text-2xl md:text-3xl font-serif tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1 max-w-3xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}
