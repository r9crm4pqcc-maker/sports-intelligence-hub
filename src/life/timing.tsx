import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/wouter";
import { useLife } from "./context";
import { Page, Tag } from "./kit";
import { daysInMonth, readDay } from "@/lib/life-studio";
import { dateTypes } from "@/lib/date-types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TimingPage() {
  const { profile } = useLife();
  const [cursor, setCursor] = useState({ y: 2026, m: 11 });
  const [today, setToday] = useState<{ y: number; m: number; d: number } | null>(null);
  useEffect(() => {
    const t = new Date();
    const now = { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() };
    setCursor({ y: now.y, m: now.m });
    setToday(now);
  }, []);
  const month = useMemo(() => Array.from({ length: daysInMonth(cursor.y, cursor.m) }, (_, i) => readDay(profile, cursor.y, cursor.m, i + 1)), [profile, cursor.y, cursor.m]);
  const current = today ? readDay(profile, today.y, today.m, today.d) : null;
  const types = current ? dateTypes(current.tones) : [];
  const monthLabel = new Date(Date.UTC(cursor.y, cursor.m - 1, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <Page kicker="Dates & Timing" title="Date types">
      <section className="space-y-3">
        <h2 className="font-display text-lg">Today{current ? ` · ${new Date(Date.UTC(current.y, current.m - 1, current.d)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}` : ""}</h2>
        {!current ? <p className="text-sm text-muted-foreground">Reading date…</p> : types.length ? <div className="flex flex-wrap gap-2">{types.map(t => <Tag key={t.type} tone={t.type === "fatal" || t.type === "challenging" ? "bad" : "good"}>{t.label}</Tag>)}</div> : <p className="text-sm text-muted-foreground">No special date type today.</p>}
      </section>
      <section className="border-t border-border pt-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => setCursor((c) => c.m === 1 ? { y: c.y - 1, m: 12 } : { ...c, m: c.m - 1 })}><ChevronLeft /></Button>
          <h2 className="font-display text-lg">{monthLabel}</h2>
          <Button variant="ghost" size="icon" aria-label="Next month" onClick={() => setCursor((c) => c.m === 12 ? { y: c.y + 1, m: 1 } : { ...c, m: c.m + 1 })}><ChevronRight /></Button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] text-muted-foreground">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <span key={d}>{d}</span>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: new Date(Date.UTC(cursor.y, cursor.m - 1, 1)).getUTCDay() }, (_, i) => <div key={`b${i}`} />)}
          {month.map((day) => (
            <Link key={day.d} href={`/day/${day.iso}`} aria-label={`${day.iso}: ${dateTypes(day.tones).map(t => t.label).join(", ") || "No special date type"}`} className={`min-w-0 min-h-24 rounded-md border p-1 text-center hover:border-primary ${day.iso === current?.iso ? "border-primary bg-primary/10" : "border-border"}`}>
              <div className="text-xs text-foreground font-semibold mb-1">{day.d}</div>
              {dateTypes(day.tones).map(t => <span key={t.type} className={`block text-[9px] leading-tight break-words mb-1 ${t.type === "fatal" || t.type === "challenging" ? "text-destructive" : "text-primary"}`}>{t.label}</span>)}
            </Link>
          ))}
        </div>
      </section>
      <section className="border-t border-border pt-5 space-y-3">
        <h2 className="font-display text-lg">Date meanings</h2>
        {dateTypes(["soulmate", "beneficial", "love", "wealth"]).map(t => <p key={t.type} className="text-sm"><span className="text-primary font-medium">{t.label}</span> · {t.meaning}</p>)}
      </section>
    </Page>
  );
}
