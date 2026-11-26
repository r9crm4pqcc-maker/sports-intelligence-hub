import type { ReactNode } from "react";

interface SportsPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function SportsPageHeader({ eyebrow, title, description, actions }: SportsPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
