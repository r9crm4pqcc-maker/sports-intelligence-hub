import { useState, type ReactNode } from "react";
import { Link, useLocation } from "@/lib/wouter";
import { CalendarDays, Target, Users, Layers, TrendingUp, Trophy, Sun, ChevronDown, ChevronRight, Menu, X, Zap, Home, UserRound, Type, Coins, Orbit } from "lucide-react";

const NAV_GROUPS = [
  {
    title: "AI Terminals",
    items: [
      { label: "Sports AI", icon: Trophy, children: [
        { label: "Sports Prediction", href: "/sports-prediction" },
        { label: "Sports Database", href: "/sports-database" },
        { label: "Soccer AI", href: "/soccer-ai" },
      ] },
      { label: "Stock Market AI", icon: TrendingUp, href: "/trading-ai" },
      { label: "Crypto Research", icon: Coins, href: "/crypto" },
    ],
  },
  {
    title: "Personal & Timing",
    items: [
      { label: "Home", icon: Home, href: "/" },
      { label: "Your Chart", icon: UserRound, href: "/chart" },
      { label: "Goal Timing", icon: Target, href: "/timing" },
      { label: "Calendar", icon: Sun, href: "/reports" },
      { label: "Date Library", icon: CalendarDays, href: "/dates" },
    ],
  },
  {
    title: "Decode & Sky",
    items: [
      { label: "People & Lookup", icon: Users, href: "/people" },
      { label: "Letterology", icon: Type, href: "/letterology" },
      { label: "Western", icon: Orbit, href: "/sky" },
      { label: "Vedic", icon: Orbit, href: "/vedic" },
      { label: "Friendly", icon: Layers, href: "/advanced" },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const [open, setOpen] = useState(false);
  const [sportsOpen, setSportsOpen] = useState(true);
  const close = () => setOpen(false);
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground sparkle-bg">
      {open && <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-40 lg:hidden" onClick={close} />}
      <aside className={`fixed top-0 left-0 h-full w-[16rem] flex flex-col z-50 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"} lg:static lg:z-auto`}>
        <div className="px-4 py-4 flex items-center justify-between shrink-0 border-b border-sidebar-border">
          <Link href="/" onClick={close} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_20px_-4px_rgba(255,106,0,0.65)] transition-transform group-hover:scale-105">
              <Zap size={16} className="fill-current" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.14em] font-display text-foreground">LIFE CODE</h1>
              <p className="text-[9px] tracking-[0.18em] uppercase text-primary font-semibold">Decode Suite</p>
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
                const active = n.href ? loc === n.href : !!n.children?.some(c => loc === c.href);
                const icon = <span className="shrink-0 w-5 flex items-center justify-center"><Icon size={15} className={active ? "text-primary" : ""} /></span>;
                if (n.href) return <Link key={n.label} href={n.href} onClick={close} className={`nav-item ${active ? "nav-item-active" : "nav-item-inactive"}`}>{icon}<span className="flex-1 truncate">{n.label}</span></Link>;
                return <div key={n.label}>
                  <button onClick={() => setSportsOpen(v => !v)} aria-expanded={sportsOpen} className={`nav-item w-full text-left ${active ? "nav-item-active" : "nav-item-inactive"}`}>
                    {icon}<span className="flex-1 truncate">{n.label}</span>{sportsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </button>
                  {sportsOpen && <div className="ml-4 mt-1 pl-3 space-y-0.5 border-l border-border">
                    {n.children?.map(c => <Link key={c.href} href={c.href} onClick={close}
                      className={`flex items-center py-1.5 px-2.5 rounded-md text-xs transition-colors ${loc === c.href ? "font-semibold text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>{c.label}</Link>)}
                  </div>}
                </div>;
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
              <p className="text-[11px] font-bold tracking-[0.14em] font-display text-primary">THE SAUCE</p>
              <p className="text-[9.5px] tracking-[0.14em] uppercase text-muted-foreground mt-0.5" data-testid="homage">#HOMAGE GG33 &amp; CUE</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 shrink-0 bg-sidebar/90 backdrop-blur-md border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-muted-foreground hover:text-foreground"><Menu size={20} /></button>
            <span className="text-sm font-bold tracking-[0.14em] font-display text-foreground">LIFE <span className="text-primary">CODE</span></span>
          </div>
          <div className="status-dot-active" />
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
