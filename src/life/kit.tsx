import type { ReactNode } from "react";
import { Link } from "@/lib/wouter";

export function Page({ kicker, title, lede, wide, children }: { kicker: string; title: string; lede?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={`${wide ? "max-w-5xl" : "max-w-3xl"} mx-auto space-y-4`}>
      <header>
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: "#FF6A00" }}>{kicker}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mt-1">{title}</h1>
        {lede && <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">{lede}</p>}
      </header>
      {children}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`glass-card p-4 sm:p-5 ${className}`}>{children}</section>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-[10px] font-bold tracking-[0.16em] uppercase mb-2" style={{ color: "#FF6A00" }}>{children}</h2>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "#000", border: "1px solid rgba(255,106,0,0.45)" }}>
      <p className="text-[10px] uppercase tracking-[0.16em] font-bold" style={{ color: "#FF6A00" }}>{label}</p>
      <p className="text-2xl font-black mt-1" style={{ color: "#FF6A00" }}>{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{hint}</p>}
    </div>
  );
}

export function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "bad" | "hot" }) {
  const cls = tone === "bad" ? "text-destructive border-destructive/40" : tone === "good" || tone === "hot" ? "text-primary border-primary/40" : "text-muted-foreground border-border";
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${cls}`}>{children}</span>;
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="text-sm text-primary hover:underline">{children}</Link>;
}
