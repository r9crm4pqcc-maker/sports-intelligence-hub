import { calendarRitualsFor } from "@/lib/calendar-rituals";
import { colorsForDay } from "@/lib/colorology";
import { dailySecretsFor } from "@/lib/timing-secrets";
import { buildCalendarDayFit } from "./day";
import { useEffect, useState } from "react";
import { Link } from "@/lib/wouter";
import { useLife } from "./context";
import { Card, Tag } from "./kit";
import { buildChart, fullName, readDay, upcoming, LIST_LABEL, type ListKind } from "@/lib/life-studio";
import { DayFit } from "./day";
import { cueDayPercent } from "@/lib/path28";

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
    if (Notification.permission !== "granted" || localStorage.getItem("life-alerts") !== "on") return;
    if (localStorage.getItem("life-ping") === iso) return;
    localStorage.setItem("life-ping", iso);
    try { new Notification("The Sauce", { body: headline }); } catch { /* browser blocked it */ }
  }, [headline, iso]);
}

export default function HomePage() {
  const { profile } = useLife();
  const today = useToday();
  const read = today ? readDay(profile, today.y, today.m, today.d) : null;
  const chart = today ? buildChart(profile, today) : null;
  const fit = today ? buildCalendarDayFit(profile, today.y, today.m, today.d).fit : null;
  const colors = read ? colorsForDay(read.calendar.reduced, 3) : null;
  const secrets = today ? dailySecretsFor(today.y, today.m, today.d) : null;
  useDailyPing(read?.headline ?? "", read?.iso ?? "");

  return <div className="max-w-3xl mx-auto space-y-6">
    <header className="border-b border-border pb-5"><p className="text-xs text-primary">Home</p><h1 className="font-display text-3xl font-bold mt-2">{chart?.name || fullName(profile)}</h1><p className="text-sm text-muted-foreground mt-2">{read?.weekday} · {read?.iso}</p></header>
    {!read || !chart ? <p>Reading today…</p> : <>
      <section className="border-l-2 border-primary pl-5 py-2"><p className="text-xs uppercase text-primary font-bold">Today’s Command</p><h2 className="font-display text-2xl mt-2">{read.dos[0] || read.headline}</h2></section>
      <section className="border-t border-border pt-5"><h2 className="font-display text-lg mb-3">Daily Score + Compatibility</h2><p className="text-3xl text-primary font-bold mb-3">{cueDayPercent(read.y, read.m, read.d)}%</p><DayFit profile={profile} y={read.y} m={read.m} d={read.d} /></section>
      <section className="border-t border-border pt-5"><h2 className="font-display text-lg">Power Colors to Wear Today</h2><div className="flex flex-wrap gap-2 mt-3">{colors?.best.map(c => <Tag key={c.name} tone="good">{c.name}</Tag>)}</div></section>
      <section className="border-t border-border pt-5"><h2 className="font-display text-lg">Best Number to Use Today</h2><p className="text-4xl font-display font-bold text-primary mt-3">{read.personal.reduced}</p></section>
      <section className="border-t border-border pt-5"><h2 className="font-display text-lg">What to Avoid Today</h2><ul className="mt-3 space-y-2 text-sm text-muted-foreground">{[...read.avoids, ...(secrets?.avoidToday.map(s => `${s.title}: ${s.detail}`) ?? [])].map(x => <li key={x}>{x}</li>)}</ul></section>
      {!!secrets?.doToday.length && <section className="border-t border-border pt-5"><h2 className="font-display text-lg">Today’s Rituals & Timing</h2><ul className="mt-3 space-y-2 text-sm">{calendarRitualsFor(read.y, read.m, read.d).allowed.map(s => <li key={s.title}><span className="text-primary">{s.title}</span> · {s.detail}</li>)}</ul></section>}
      <details className="border-t border-border pt-5"><summary className="cursor-pointer font-display text-lg">Everyday rules</summary><ul className="mt-3 space-y-2 text-sm text-muted-foreground">{secrets?.alwaysOn.map(s => <li key={s.title}>{s.title} · {s.detail}</li>)}</ul></details>
    </>}
  </div>;
}
