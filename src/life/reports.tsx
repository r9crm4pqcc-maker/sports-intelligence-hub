import { useEffect, useState } from "react";
import { Link } from "@/lib/wouter";
import { useLife } from "./context";
import { useDailyPing } from "./home";
import { Card, Page, Stat, Tag } from "./kit";
import { buildChart, chineseMonthSign, daysInMonth, padDate, readDay, seasonOf, signRelation, LIST_LABEL, MONTH_SPAN, type Sign } from "@/lib/life-studio";
import { buildCalendarDayFit, DayFit } from "./day";
import { CAUTION_2027, DAY_28_ON_7, MONTH_NOW, POWER_WINDOW, ROADMAP, YEAR_NOW, calendarRelationLabel, isPath28 } from "@/lib/path28";

export default function ReportsPage() {
  const { profile } = useLife();
  const [tab, setTab] = useState<"day" | "month" | "year">("month");
  const [cursor, setCursor] = useState({ y: 2026, m: 11 });
  const [today, setToday] = useState({ y: 2026, m: 11, d: 4 });
  const [ping, setPing] = useState("");
  useEffect(() => {
    const t = new Date();
    const now = { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() };
    setToday(now);
    setCursor({ y: now.y, m: now.m });
  }, []);
  const day = readDay(profile, today.y, today.m, today.d);
  useDailyPing(day.headline, day.iso);
  const chart = buildChart(profile, today);
  const own = isPath28(chart.lifePath.compound) && profile.month === 9 && profile.day === 8;

  async function enablePing() {
    if (typeof Notification === "undefined") { setPing("This browser has no notifications."); return; }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") { setPing("Notifications stayed off."); return; }
    localStorage.removeItem("life-ping");
    setPing("On. The daily line fires when you open the app.");
    try { new Notification("Life Code", { body: day.headline }); } catch { /* ignore */ }
  }

  return (
    <Page kicker="Calendar" title="Calendar" wide lede="Your month, year animal, and daily compatibility. Personal-day timing is shown as a separate layer.">
      <div className="flex gap-2">
        {(["day", "month", "year"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full border px-3 py-1 text-sm capitalize ${tab === t ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{t === "month" ? "Calendar" : t}</button>
        ))}
      </div>

      {tab === "day" && (
        <Card>
          <h2 className="font-display text-2xl">{day.headline}</h2>
          <p className="text-sm text-muted-foreground mt-2">{day.reading}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {day.flags.map((f) => <Tag key={f}>{f}</Tag>)}
            <Tag tone={day.earth === "enemy" ? "bad" : day.earth === "friend" ? "good" : "neutral"}>Earth {day.earth}</Tag>
            <Tag tone={day.west === "enemy" ? "bad" : day.west === "friend" ? "good" : "neutral"}>Western {day.west}</Tag>
          </div>
          <button onClick={enablePing} className="mt-4 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm">Turn on the daily alert</button>
          {ping && <p className="text-xs text-muted-foreground mt-2">{ping}</p>}
          <DayFit profile={profile} y={day.y} m={day.m} d={day.d} />
          {own && day.d === 7 && (
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-display text-lg text-foreground">{DAY_28_ON_7.combo.headline}</p>
              <p className="text-foreground/90">{DAY_28_ON_7.combo.positive}</p>
              <p className="text-muted-foreground">{DAY_28_ON_7.combo.event}</p>
              <p className="text-foreground">{DAY_28_ON_7.life.title}. {DAY_28_ON_7.life.body}</p>
              <p className="text-foreground">{DAY_28_ON_7.day.title}. {DAY_28_ON_7.day.body}</p>
              <p className="text-foreground">{DAY_28_ON_7.combo.title}. {DAY_28_ON_7.combo.body}</p>
              <p className="text-muted-foreground">{DAY_28_ON_7.combo.negative}</p>
            </div>
          )}
        </Card>
      )}

      {tab === "month" && (
        <Card>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <button className="text-sm text-primary" onClick={() => setCursor((c) => c.m === 1 ? { y: c.y - 1, m: 12 } : { ...c, m: c.m - 1 })}>Prev</button>
            <select className="rounded-lg border border-border bg-background px-2 py-1 text-sm" value={cursor.m} onChange={(e) => setCursor((c) => ({ ...c, m: +e.target.value }))}>
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
            </select>
            <input className="w-24 rounded-lg border border-border bg-background px-2 py-1 text-sm" type="number" min={1900} max={2100} value={cursor.y} onChange={(e) => setCursor((c) => ({ ...c, y: +e.target.value || c.y }))} />
            <button className="text-sm text-primary" onClick={() => setCursor((c) => c.m === 12 ? { y: c.y + 1, m: 1 } : { ...c, m: c.m + 1 })}>Next</button>
          </div>
          <MonthBody profileYear={chart.yearAnimal} y={cursor.y} m={cursor.m} life={`${chart.lifePath.compound}/${chart.lifePath.reduced}`} py={chart.py.reduced} today={today} own={own} />
          {own && <MonthMarks y={cursor.y} m={cursor.m} />}
        </Card>
      )}

      {tab === "year" && (
        <Card>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <button className="text-sm text-primary" onClick={() => setCursor((c) => ({ ...c, y: c.y - 1 }))}>Prev</button>
            <input className="w-24 rounded-lg border border-border bg-background px-2 py-1 text-sm" type="number" min={1900} max={2100} value={cursor.y} onChange={(e) => setCursor((c) => ({ ...c, y: +e.target.value || c.y }))} />
            <button className="text-sm text-primary" onClick={() => setCursor((c) => ({ ...c, y: c.y + 1 }))}>Next</button>
          </div>
          <YearBody y={cursor.y} profile={profile} animal={chart.yearAnimal} today={today} />
          {own && <YearMarks y={cursor.y} />}
        </Card>
      )}
    </Page>
  );
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function monthRelation(yearAnimal: Sign, monthAnimal: Sign) {
  if (yearAnimal === monthAnimal) return `same sign as your ${yearAnimal}`;
  const rel = signRelation(yearAnimal, monthAnimal);
  if (rel === "friend") return `ally of your ${yearAnimal}`;
  if (rel === "enemy") return `clash of your ${yearAnimal}`;
  return `neutral to your ${yearAnimal}`;
}

function cellLine(tones: string[]) {
  if (tones.includes("fatal")) return "Do not force a deal.";
  if (tones.includes("soulmate")) return "Soulmate day. Show up.";
  if (tones.includes("wealth")) return "Money day.";
  if (tones.includes("love")) return "Friendship or a date.";
  if (tones.includes("beneficial")) return "Ask, launch, travel.";
  if (tones.includes("challenging")) return "Go easy.";
  if (tones.includes("master")) return "One important act.";
  if (tones.includes("twenty-eight")) return "Hold the big move.";
  return "Follow the day number.";
}

function WallSheet({ y, m, yearAnimal, life, sel, onPick }: { y: number; m: number; yearAnimal: Sign; life: string; sel: number; onPick: (d: number) => void }) {
  const { profile } = useLife();
  const dim = daysInMonth(y, m);
  const lead = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const days = Array.from({ length: dim }, (_, i) => {
    const d = i + 1;
    const { read, fit } = buildCalendarDayFit(profile, y, m, d);
    return { d, read, relation: fit.numbers.find((n) => n.name === "Universal")?.rel, animal: chineseMonthSign(m, d) };
  });
  const mid = days.find((x) => x.d === 15) ?? days[0];
  const animal = mid.animal;
  const turn = days.find((x) => x.animal !== days[0].animal);
  const pm = mid.read.personalMonth;
  const money = days.filter((x) => x.read.tones.includes("wealth") && !x.read.tones.includes("fatal")).map((x) => x.d);
  const power = days.filter((x) => (x.read.tones.includes("master") || x.read.tones.includes("twenty-eight")) && !x.read.tones.includes("fatal")).map((x) => x.d);
  const soul = days.filter((x) => x.read.tones.includes("soulmate") && !x.read.tones.includes("fatal")).map((x) => x.d);
  const noFly = days.filter((x) => x.read.tones.includes("fatal")).map((x) => x.d);
  const easy = days.filter((x) => x.read.tones.includes("challenging")).map((x) => x.d);
  const list = (xs: number[]) => xs.length ? xs.map((d) => `${MONTHS[m - 1].slice(0, 3)} ${d}`).join(", ") : "None this month";
  return (
    <div className="glass-card rounded-2xl overflow-hidden border-primary/40">
      <div className="p-4 sm:p-6 border-b border-border">
        <p className="font-display text-4xl sm:text-5xl font-black tracking-tight text-primary">{MONTHS[m - 1].toUpperCase()}</p>
        <p className="text-sm sm:text-base font-bold tracking-[0.08em] mt-1 text-primary">{y} · THE MONTH OF THE {animal.toUpperCase()} · {monthRelation(yearAnimal, animal).toUpperCase()}</p>
        <p className="text-sm mt-1 text-white/70">Life path {life} · year animal {yearAnimal}{ownLucky(profile) ? " · lucky 99, 98, 28, 8" : ""}. {turn ? `${animal} takes over on ${MONTHS[m - 1].slice(0, 3)} ${turn.d}. Before that it is ${days[0].animal}.` : `${MONTH_SPAN[animal]}.`}</p>
        <div className="mt-4 rounded-xl p-3 text-sm sm:text-base grid sm:grid-cols-2 gap-3 bg-muted/50 border border-border">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-primary">PERSONAL MONTH</p>
            <p className="mt-1 text-foreground"><span className="text-2xl font-black text-primary">{pm.compound}/{pm.reduced}</span> How to move this month. Not the day score.</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-primary">YOUR BEST DAYS</p>
            <p className="mt-1 text-white/85">Money: {list(money)}</p>
            <p className="text-white/85">Power: {list(power)}</p>
            <p className="text-white/85">Soulmate: {list(soul)}</p>
            <p className="mt-1 text-white/85">Don't fly: {list(noFly)}</p>
            <p className="text-white/85">Go easy: {list(easy)}</p>
          </div>
        </div>
      </div>
      <div className="px-1 sm:px-3 py-3" style={{ background: "#000" }}>
        <p className="text-base font-bold mb-1 px-1 text-primary">{MONTHS[m - 1]} {y} · Month of the {animal}</p>
        <p className="text-sm mb-2 px-1 text-white/60">The number under each date is the Universal Day. Its label shows compatibility with your Life Path; the calendar-date number is a separate layer.</p>
        <div className="grid grid-cols-7 text-[10px] sm:text-xs font-bold border-b border-primary/40 text-primary">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => <div key={d} className="min-w-0 truncate px-0.5 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: lead }, (_, i) => <div key={`b${i}`} className="min-w-0 min-h-24 border-b border-r border-border/60" />)}
          {days.map((x) => {
            const hot = x.read.tones.includes("wealth") || x.read.tones.includes("soulmate") || x.read.tones.includes("master");
            const warn = x.read.tones.includes("fatal") || x.read.tones.includes("challenging");
            const on = x.d === sel;
            return (
              <button key={x.d} type="button" onClick={() => onPick(x.d)} className="min-w-0 overflow-hidden min-h-24 text-left p-0.5 sm:p-1 border-b border-r border-border/60" style={{ background: on ? "rgba(24,220,104,0.22)" : hot && !x.read.tones.includes("fatal") ? "rgba(24,220,104,0.1)" : "transparent", outline: on ? "1px solid #18DC68" : "none" }}>
                <span className="block text-xs sm:text-sm font-black leading-none text-white">{x.d}{warn ? " ▲" : ""}{x.read.tones.includes("soulmate") ? " ★" : ""}</span>
                <span className="block text-[10px] sm:text-xs font-semibold leading-none mt-0.5 truncate text-primary">{x.read.labelU}</span>
                <span title={`${calendarRelationLabel(x.relation)} with your Life Path under Universal Day ${x.read.labelU}`} className="block text-[9px] sm:text-xs font-bold leading-tight mt-0.5 text-white/80 break-words">{calendarRelationLabel(x.relation)}</span>
                {x.animal !== days[0].animal && x.d === turn?.d && <span className="block text-[10px] font-bold truncate text-primary">{x.animal}</span>}
                <span className="block text-[10px] leading-tight mt-0.5 text-white/70 break-words line-clamp-2">{cellLine(x.read.tones)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ownLucky(profile: { month: number; day: number; year: number }) {
  return profile.month === 9 && profile.day === 8 && profile.year === 2009;
}

function MonthBody({ y, m, life, py, profileYear, today, own }: { y: number; m: number; life: string; py: number; profileYear: Sign; today: { y: number; m: number; d: number }; own: boolean }) {
  const { profile } = useLife();
  const [picked, setPicked] = useState<number | null>(null);
  const dim = daysInMonth(y, m);
  const sel = Math.min(picked ?? (today.y === y && today.m === m ? today.d : 1), dim);
  const read = readDay(profile, y, m, sel);
  const { fit } = buildCalendarDayFit(profile, y, m, sel);
  const universal = fit.numbers.find((n) => n.name === "Universal");
  const universalRelation = universal?.rel;
  const sample = readDay(profile, y, m, Math.min(15, dim));
  const animal = chineseMonthSign(m, sel);
  const earth = signRelation(profileYear, animal);
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-3 gap-3">
         <Stat label="Selected day" value={calendarRelationLabel(universalRelation)} hint={`${m}/${sel} · Universal ${universal?.other} · Life Path ${fit.self}`} />
        <Stat label="Chinese month" value={animal} hint={`${MONTH_SPAN[animal]} · ${m}/${sel} · versus your year animal: ${earth}`} />
        <Stat label="Western season" value={seasonOf(m, 15)} hint={`Sun on the 15th is ${sample.sun}. Personal month ${sample.personalMonth.reduced} is only how to move.`} />
      </div>
      <WallSheet y={y} m={m} yearAnimal={profileYear} life={life} sel={sel} onPick={setPicked} />
      <p className="text-xs text-muted-foreground">Calendar labels show Universal Day compatibility with your Life Path. The calendar-date number and Personal Month are separate layers.</p>
      <div className="rounded-xl border border-border p-3 space-y-3">
        <DayFit profile={profile} y={y} m={m} d={sel} />
        <p className="text-sm text-foreground">{read.headline}</p>
        <div className="flex flex-wrap gap-2">
          {read.tones.map((t) => <Tag key={t} tone={t === "fatal" || t === "challenging" ? "bad" : "good"}>{LIST_LABEL[t]}</Tag>)}
          <Tag tone={read.earth === "enemy" ? "bad" : read.earth === "friend" ? "good" : "neutral"}>Earth {read.earth}</Tag>
          <Tag tone={read.west === "enemy" ? "bad" : read.west === "friend" ? "good" : "neutral"}>Western {read.west}</Tag>
        </div>
        <p className="text-sm text-foreground/90">{read.universalLine}</p>
        <p className="text-sm text-foreground/90">{read.dayLine}</p>
        <p className="text-sm text-foreground/90">{read.combinedLine}</p>
        <p className="text-sm text-foreground">Do: {read.dos.slice(0, 3).join(" ")}</p>
        <p className="text-sm text-muted-foreground">Avoid: {read.avoids.slice(0, 2).join(" ")}</p>
        {own && sel === 7 && (
          <p className="text-sm text-foreground">{DAY_28_ON_7.combo.headline} {DAY_28_ON_7.combo.title}. {DAY_28_ON_7.combo.body}</p>
        )}
        <Link href={`/day/${read.iso}`} className="inline-block text-sm text-primary">Open the full day</Link>
      </div>
    </div>
  );
}

export function YearBody({ y, profile, animal, today }: { y: number; profile: ReturnType<typeof useLife>["profile"]; animal: string; today: { y:number;m:number;d:number } }) {
  const rows = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const read = readDay(profile, y, m, 15);
    return { m, read, animal: chineseMonthSign(m, 15) };
  });
  // January can still fall in the previous birthday-based cycle. In the
  // current calendar-year view, summarize the cycle active today instead.
  const py = y===today.y ? readDay(profile,today.y,today.m,today.d).personalYear : rows[0]?.read.personalYear;
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="Personal year" value={py ? `${py.compound}/${py.reduced}` : "—"} hint={`Cycle year ${py?.cycleYear ?? ""}`} />
        <Stat label="Chinese year" value={animal} hint="Your birth animal, scored against each month." />
        <Stat label="Universal year" value={String(rows[5]?.read.universalYear.reduced ?? "")} />
      </div>
      <ul className="divide-y divide-border text-sm">
        {rows.map((r) => (
          <li key={r.m} className="py-2 flex flex-wrap justify-between gap-2">
            <span>{padDate(r.m, 1).split(" ")[0]}</span>
            <span className="text-muted-foreground">PM {r.read.personalMonth.reduced} · {r.animal} · {r.read.earth} · {seasonOf(r.m, 15)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MonthMarks({ y, m }: { y: number; m: number }) {
  const marks = ROADMAP.filter((r) => r.y === y && monthOf(r.when) === m);
  const showNow = y === 2026 && m === 11;
  const showPower = y === 2026 && m === 12;
  if (!showNow && !showPower && marks.length === 0) return null;
  return (
    <div className="mt-4 space-y-3 text-sm">
      {showNow && (
        <div>
          <p className="font-display text-lg text-foreground">Personal Month {MONTH_NOW.face} · {MONTH_NOW.title}</p>
          <p className="text-xs text-muted-foreground">{MONTH_NOW.span}</p>
          <p className="text-foreground/90 mt-1">{MONTH_NOW.body}</p>
          <p className="text-muted-foreground mt-1">{MONTH_NOW.west}</p>
          <p className="text-muted-foreground">{MONTH_NOW.animal}</p>
        </div>
      )}
      {showPower && (
        <div>
          <p className="font-display text-lg text-foreground">Power window · {POWER_WINDOW.title}</p>
          <p className="text-xs text-muted-foreground">{POWER_WINDOW.span}</p>
          <p className="text-foreground/90 mt-1">{POWER_WINDOW.body}</p>
          <p className="text-muted-foreground">{POWER_WINDOW.layers}</p>
        </div>
      )}
      {marks.length > 0 && (
        <ul className="space-y-1">
          {marks.map((r) => <li key={r.when + r.title}><span className="text-foreground">{r.when} · {r.title}.</span> <span className="text-muted-foreground">{r.note}</span></li>)}
        </ul>
      )}
    </div>
  );
}

function YearMarks({ y }: { y: number }) {
  const marks = ROADMAP.filter((r) => r.y === y);
  return (
    <div className="mt-4 space-y-3 text-sm">
      {y === 2026 && (
        <div>
          <p className="font-display text-lg text-foreground">Personal Year {YEAR_NOW.face} · {YEAR_NOW.title}</p>
          <p className="text-xs text-muted-foreground">{YEAR_NOW.span}</p>
          <p className="text-foreground/90 mt-1">{YEAR_NOW.body}</p>
          <p className="text-muted-foreground mt-1">{YEAR_NOW.why}</p>
          <p className="text-muted-foreground">{YEAR_NOW.universal}</p>
          <p className="text-muted-foreground">{YEAR_NOW.animal}</p>
        </div>
      )}
      {y === 2027 && (
        <div>
          <p className="font-display text-lg text-foreground">{CAUTION_2027.title}</p>
          <p className="text-xs text-muted-foreground">{CAUTION_2027.span}</p>
          <p className="text-foreground mt-1">{CAUTION_2027.best}</p>
          <p className="text-muted-foreground">{CAUTION_2027.body}</p>
          <p className="text-muted-foreground">{CAUTION_2027.layers}</p>
        </div>
      )}
      {marks.length > 0 && (
        <ul className="space-y-1">
          {marks.map((r) => <li key={r.when + r.title}><span className="text-foreground">{r.when} · {r.title}.</span> <span className="text-muted-foreground">{r.note}</span></li>)}
        </ul>
      )}
    </div>
  );
}

function monthOf(when: string) {
  const name = when.split(" ")[0];
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return names.indexOf(name) + 1;
}
