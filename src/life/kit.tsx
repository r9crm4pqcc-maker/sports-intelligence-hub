import type { ReactNode } from "react";
import { Link } from "@/lib/wouter";

export function Page({ kicker, title, lede, wide, children }: { kicker: string; title: string; lede?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={`${wide ? "max-w-6xl" : "max-w-3xl"} mx-auto space-y-6`}>
      <header className="border-b border-border pb-5">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">{kicker}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-1.5">{title}</h1>
        {lede && <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">{lede}</p>}
      </header>
      {children}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`glass-card p-5 sm:p-6 ${className}`}>{children}</section>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-[11px] font-bold tracking-[0.16em] uppercase mb-3 text-primary">{children}</h2>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-muted/60 border border-border p-4 transition-colors hover:border-primary/40">
      <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-muted-foreground">{label}</p>
      <p className="text-2xl font-extrabold font-display tracking-tight mt-1 text-primary tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

export function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "bad" | "hot" }) {
  const cls = tone === "bad" ? "bg-destructive/10 text-destructive border-destructive/30" : tone === "good" || tone === "hot" ? "bg-primary/10 text-primary border-primary/30" : "bg-muted/60 text-muted-foreground border-border";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="text-sm text-primary hover:underline">{children}</Link>;
}
