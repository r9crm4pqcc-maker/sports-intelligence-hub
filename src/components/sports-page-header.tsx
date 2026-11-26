import type { ReactNode } from "react";

interface SportsPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function SportsPageHeader({ eyebrow, title, description, actions }: SportsPageHeaderProps) {
  return (
    <header className="flex flex-wrap gap-4 border-b border-border pb-5 items-end justify-between">
      <div className="min-w-0 flex-1 basis-80">
        <p className="mb-1.5 inline-flex items-center gap-1.5  text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h1 className="font-display text-3xl font-bold  text-foreground sm:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 max-w-full">{actions}</div>}
    </header>
  );
}
