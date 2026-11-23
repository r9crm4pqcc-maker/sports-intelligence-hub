import { useEffect, useState } from "react";
import { Link } from "@/lib/wouter";
import { useLife } from "./context";
import { Card, Tag } from "./kit";
import { buildChart, fullName, readDay, upcoming, LIST_LABEL, type ListKind } from "@/lib/life-studio";
import { DayFit } from "./day";

const MODULES = [
  { href: "/chart", title: "Your chart", text: "Life path, name, Chinese pillars, Western and Vedic, enemy months, lucky numbers." },
  { href: "/dates", title: "Date library", text: "Soulmate, fatal, challenging, love, beneficial, wealth, 28, and master days." },
  { href: "/reports", title: "Calendar", text: "Daily calendar. Turn on the daily alert." },
  { href: "/timing", title: "Goal timing", text: "Best days for money, launch, travel, love, surgery, cleats, an LLC, a contract." },
  { href: "/people", title: "People & lookup", text: "Percent between two birthdays, fatal or soulmate, and the days to meet." },
  { href: "/letterology", title: "Letterology", text: "A is 1 through Z is 26. Reduced and full value of any word." },
  { href: "/crypto", title: "Crypto research", text: "A coin’s launch day, read like a birthday." },
  { href: "/sky", title: "Western", text: "Tropical chart only. Sun, Moon, and the rest of the placements." },
  { href: "/vedic", title: "Vedic", text: "Sidereal chart, then colors, numbers, days, months, directions, and metals." },
  { href: "/advanced", title: "Friendly matches", text: "Countries, cities, clothes, cars, 28 career, and Virgo health." },
];

function useToday() {
  const [today, setToday] = useState<{ y: number; m: number; d: number } | null>(null);
  useEffect(() => {
    const t = new Date();
    setToday({ y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() });
  }, []);
  return today;
}

export function useDailyPing(headline: string, iso: string) {
  useEffect(() => {
    if (!headline || !iso || typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    if (localStorage.getItem("life-ping") === iso) return;
    localStorage.setItem("life-ping", iso);
    try { new Notification("Life Code", { body: headline }); } catch { /* browser blocked it */ }
  }, [headline, iso]);
}

export default function HomePage() {
  const { profile } = useLife();
  const today = useToday();
  const read = today ? readDay(profile, today.y, today.m, today.d) : null;
  const chart = today ? buildChart(profile, today) : null;
  const next = today ? upcoming(profile, today, 5) : [];
  useDailyPing(read?.headline ?? "", read?.iso ?? "");

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: "#FF6A00" }}>Life Code</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mt-1">{chart?.name ?? fullName(profile)}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {profile.month}/{profile.day}/{profile.year}
            {profile.time ? ` · ${profile.time}` : ""}{profile.place ? ` · ${profile.place}` : ""}
          </p>
        </div>
        <Link href="/chart" className="text-sm rounded-lg border border-border px-3 py-2 text-foreground hover:border-primary">Edit birth data</Link>
      </header>

      <Card>
        {!read || !chart ? (
          <p className="text-sm text-muted-foreground">Reading today…</p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{read.weekday}</p>
            <h2 className="font-display text-2xl text-foreground">{read.headline}</h2>
            <DayFit profile={profile} y={read.y} m={read.m} d={read.d} />
            <div className="flex flex-wrap gap-2">
              <Tag tone="hot">Universal {read.labelU}</Tag>
              <Tag>Day {read.labelDay}</Tag>
              <Tag>Together {read.labelCombined}</Tag>
              <Tag tone={read.earth === "enemy" ? "bad" : read.earth === "friend" ? "good" : "neutral"}>Earth {read.earth}</Tag>
              <Tag tone={read.west === "enemy" ? "bad" : read.west === "friend" ? "good" : "neutral"}>Western {read.west}</Tag>
              {read.tones.map((t) => <Tag key={t} tone={t === "fatal" || t === "challenging" ? "bad" : "good"}>{LIST_LABEL[t as ListKind]}</Tag>)}
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{read.reading}</p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-primary mb-1">Do</p>
                <ul className="space-y-1 text-muted-foreground">{read.dos.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-destructive mb-1">Avoid</p>
                <ul className="space-y-1 text-muted-foreground">{read.avoids.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            </div>
            <Link href={`/day/${read.iso}`} className="inline-block text-sm text-primary hover:underline">Open the full day</Link>
          </div>
        )}
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODULES.map((m) => (
          <Link key={m.href} href={m.href} className="glass-card p-4 block hover:border-primary/50">
            <h3 className="font-display text-lg text-foreground">{m.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{m.text}</p>
          </Link>
        ))}
      </div>

      <Card>
        <h2 className="font-display text-lg mb-3">Coming up</h2>
        <ul className="space-y-2">
          {next.map((n) => (
            <li key={n.iso}>
              <Link href={`/day/${n.iso}`} className="flex flex-wrap items-baseline justify-between gap-2 text-sm hover:text-primary">
                <span className="text-foreground">{n.label}</span>
                <span className="text-muted-foreground">{n.tones.map((t) => LIST_LABEL[t]).join(" · ")}</span>
              </Link>
            </li>
          ))}
          {!next.length && <li className="text-sm text-muted-foreground">No marked dates in the next year.</li>}
        </ul>
      </Card>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/sports-prediction" className="text-muted-foreground hover:text-primary">Sports Prediction</Link>
        <Link href="/soccer-ai" className="text-muted-foreground hover:text-primary">Soccer AI</Link>
        <Link href="/trading-ai" className="text-muted-foreground hover:text-primary">Stock Market AI</Link>
      </div>
    </div>
  );
}
