import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "@/lib/wouter";
import { CalendarDays, Target, Users, Layers, TrendingUp, Trophy, Sun, ChevronDown, ChevronRight, Menu, X, Zap, Home, UserRound, Type, Coins, Orbit, Settings } from "lucide-react";

const NAV_GROUPS = [
  { title: "1 · Home", items: [{ label: "Home", icon: Home, href: "/" }] },
  { title: "2 · Chart", items: [{ label: "Your Chart", icon: UserRound, href: "/chart" }] },
  { title: "3 · Dates & Timing", items: [
    { label: "Date Library", icon: CalendarDays, href: "/dates" },
    { label: "Date Types", icon: Target, href: "/timing" },
    { label: "Calendar", icon: Sun, href: "/reports" },
    { label: "Personal Cycles", icon: Orbit, href: "/cycles" },
  ] },
  { title: "5 · People & Lookup", items: [
    { label: "People & Lookup", icon: Users, href: "/people" },
    { label: "Brands & Places", icon: Layers, href: "/advanced" },
    { label: "Sports Database", icon: Layers, href: "/sports-database" },
  ] },
  { title: "6 · Tools", items: [
    { label: "Sports Prediction", icon: Trophy, href: "/sports-prediction" },
    { label: "Soccer AI", icon: Trophy, href: "/soccer-ai" },
    { label: "Letterology", icon: Type, href: "/letterology" },
    { label: "Trading AI", icon: TrendingUp, href: "/trading-ai" },
  ] },
  { title: "7 · Settings", items: [{ label: "Settings", icon: Settings, href: "/settings" }] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => { document.documentElement.dataset["theme"] = localStorage.getItem("life-theme") || "dark"; }, []);
  const close = () => setOpen(false);
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground sparkle-bg">
      {open && <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-40 lg:hidden" onClick={close} />}
      <aside className={`fixed top-0 left-0 h-full w-[16rem] flex flex-col z-50 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"} lg:static lg:z-auto`}>
        <div className="px-4 py-4 flex items-center justify-between shrink-0 border-b border-sidebar-border">
          <Link href="/" onClick={close} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-[var(--shadow-gold)] transition-transform group-hover:scale-105">
              <Zap size={16} className="fill-current" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.14em] font-display text-foreground">THE SAUCE</h1>
            </div>
          </Link>
          <button onClick={close} aria-label="Close menu" className="lg:hidden text-muted-foreground hover:text-foreground"><X size={17} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {NAV_GROUPS.map(group => (
            <div key={group.title} className="space-y-1">
              <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">{group.title}</p>
              {group.items.map(n => {
                const Icon = n.icon;
                const active = n.href ? loc === n.href : false;
                const icon = <span className="shrink-0 w-5 flex items-center justify-center"><Icon size={15} className={active ? "text-primary" : ""} /></span>;
                if (n.href) return <Link key={n.label} href={n.href} onClick={close} className={`nav-item ${active ? "nav-item-active" : "nav-item-inactive"}`}>{icon}<span className="flex-1 truncate">{n.label}</span></Link>;
                return null;
              })}
            </div>
          ))}
        </nav>
        <div className="p-3 shrink-0 border-t border-sidebar-border">
          <div className="rounded-xl bg-card/80 border border-border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="status-dot-active" /><span className="text-[11px] font-medium text-foreground">Live Engine</span></div>
              <span className="text-[10px] font-mono text-muted-foreground">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-border/80">
              <p className="text-[9.5px] tracking-[0.14em] uppercase text-muted-foreground mt-0.5" data-testid="homage">#HOMAGE GG33 &amp; CUE</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 shrink-0 bg-sidebar/90 backdrop-blur-md border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-muted-foreground hover:text-foreground"><Menu size={20} /></button>
            <span className="text-sm font-bold tracking-[0.14em] font-display text-foreground">THE <span className="text-primary">SAUCE</span></span>
          </div>
          <div className="status-dot-active" />
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
