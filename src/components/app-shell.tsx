import { useState, type ReactNode } from "react";
import { Link, useLocation } from "@/lib/wouter";
import { CalendarDays, Target, Users, Layers, TrendingUp, Trophy, Sun, ChevronDown, ChevronRight, Menu, X, Zap, Home, UserRound, Type, Coins, Orbit, BookOpen } from "lucide-react";

const NAV = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Your Chart", icon: UserRound, href: "/chart" },
  { label: "Date Library", icon: CalendarDays, href: "/dates" },
  { label: "Calendar", icon: Sun, href: "/reports" },
  { label: "Goal Timing", icon: Target, href: "/timing" },
  { label: "People & Lookup", icon: Users, href: "/people" },
  { label: "Letterology", icon: Type, href: "/letterology" },
  { label: "Crypto Research", icon: Coins, href: "/crypto" },
  { label: "Western", icon: Orbit, href: "/sky" },
  { label: "Vedic", icon: Orbit, href: "/vedic" },
  { label: "Friendly", icon: Layers, href: "/advanced" },
  { label: "Knowledge Library", icon: BookOpen, href: "/library" },
  { label: "Sports AI", icon: Trophy, children: [
    { label: "Sports Prediction", href: "/sports-prediction" },
    { label: "Sports Database", href: "/sports-database" },
    { label: "Soccer AI", href: "/soccer-ai" },
  ] },
  { label: "Stock Market AI", icon: TrendingUp, href: "/trading-ai" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const [open, setOpen] = useState(false);
  const [sportsOpen, setSportsOpen] = useState(() => loc.startsWith("/sports") || loc === "/soccer-ai");
  const close = () => setOpen(false);
  return (
    <div className="flex h-screen overflow-hidden sparkle-bg" style={{ background: "hsl(var(--background))" }}>
      {open && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={close} />}
      <aside className={`fixed top-0 left-0 h-full w-[15.5rem] flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"} lg:static lg:z-auto`}
        style={{ background: "hsl(var(--sidebar))", borderRight: "1px solid hsl(var(--sidebar-border))" }}>
        <div className="px-4 py-4 flex items-center justify-between shrink-0" style={{ borderBottom: "1px solid hsl(var(--sidebar-border))" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: "#FF6A00" }}><Zap size={15} style={{ color: "#000" }} /></div>
            <div>
              <h1 className="text-[13px] font-bold tracking-[0.14em] font-display" style={{ color: "#FF6A00" }}>LIFE CODE</h1>
              <p className="text-[8.5px] tracking-[0.16em] uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>Decode Suite</p>
            </div>
          </div>
          <button onClick={close} aria-label="Close menu" className="lg:hidden opacity-50 hover:opacity-90" style={{ color: "hsl(42 40% 88%)" }}><X size={16} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-px">
          {NAV.map(n => {
            const Icon = n.icon;
            const active = n.href ? (n.href === "/library" ? loc.startsWith("/library") : loc === n.href) : !!n.children?.some(c => loc === c.href);
            const icon = <span className="shrink-0 w-5 flex items-center justify-center"><Icon size={15} style={{ color: active ? "#000" : undefined }} /></span>;
            if (n.href) return <Link key={n.label} href={n.href} onClick={close} className={`nav-item ${active ? "nav-item-active" : "nav-item-inactive"}`}>{icon}<span className="flex-1 truncate">{n.label}</span></Link>;
            return <div key={n.label}>
              <button onClick={() => setSportsOpen(v => !v)} aria-expanded={sportsOpen} className={`nav-item w-full text-left ${active ? "nav-item-active" : "nav-item-inactive"}`}>
                {icon}<span className="flex-1 truncate">{n.label}</span>{sportsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              {sportsOpen && <div className="ml-5 mt-0.5 pl-3 space-y-0.5" style={{ borderLeft: "1px solid rgba(255,106,0,0.45)" }}>
                {n.children?.map(c => <Link key={c.href} href={c.href} onClick={close}
                  className={`flex items-center py-1.5 px-2 rounded-md text-xs transition-all duration-100 ${loc === c.href ? "font-semibold" : "opacity-50 hover:opacity-80"}`}
                  style={{ color: loc === c.href ? "#FF6A00" : undefined }}>{c.label}</Link>)}
              </div>}
            </div>;
          })}
        </nav>
        <div className="px-4 py-3 shrink-0" style={{ borderTop: "1px solid hsl(var(--sidebar-border))" }}>
          <div className="flex items-center gap-2"><div className="status-dot-active" /><span className="text-[11px] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>System Online</span></div>
          <p className="text-[10px] mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</p>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 shrink-0" style={{ background: "hsl(var(--sidebar))", borderBottom: "1px solid hsl(var(--sidebar-border))" }}>
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-white/50 hover:text-white/80"><Menu size={20} /></button>
          <span className="text-[13px] font-bold tracking-[0.14em] font-display" style={{ color: "#FF6A00" }}>LIFE CODE</span>
        </header>
        <main className="flex-1 overflow-y-auto px-5 py-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
