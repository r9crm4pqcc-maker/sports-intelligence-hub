import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/wouter";
import { Button } from "@/components/ui/button";
import { UsDateInput } from "@/components/us-date-input";
import { SoccerGearTracker } from "@/components/soccer-gear-tracker";
import { Page, CardTitle, Stat, Tag } from "@/life/kit";
import { useLife } from "@/life/context";
import { buildChart, readDay, openOn } from "@/lib/life-studio";
import { calcDateEnergy, reduce } from "@/lib/numerology";
import { numberRelation } from "@/lib/vote-decode";
import { buildCalendarDayFit } from "@/life/day";
const tabs = ["Match Day Protocol", "Jersey Optimizer", "Cleats & Gear", "Color & Direction", "Enemy Year Protection", "Recruiting & Contracts"];
export default function SoccerAIPage() {
  const { profile } = useLife();
  const [tab, setTab] = useState(tabs[0] ?? "Match Day Protocol");
  const [date, setDate] = useState("2026-11-26");
  const [jersey, setJersey] = useState("11");
  const [enemyMode, setEnemyMode] = useState(false);
  useEffect(() => { const t = new Date(); setDate(`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`); const update = () => setEnemyMode(localStorage.getItem("life-enemy-mode") === "on"); update(); window.addEventListener("life-settings-changed", update); return () => window.removeEventListener("life-settings-changed", update); }, []);
  const [y, m, d] = date.split("-").map(Number);
  const read = readDay(profile, y ?? 2026, m ?? 11, d ?? 26);
  const chart = buildChart(profile, { y: y ?? 2026, m: m ?? 11, d: d ?? 26 });
  const fit = buildCalendarDayFit(profile, y ?? 2026, m ?? 11, d ?? 26).fit;
  const gearWindows = useMemo(() => openOn(profile, "cleats", { y: y ?? 2026, m: m ?? 11, d: d ?? 26 }), [profile, date]);
  const jerseyRelation = numberRelation(chart.lifePath.reduced, reduce(Number(jersey) || 0));
  return <Page kicker="Tools" title="Soccer AI" wide>
    <div className="flex items-center justify-between gap-4 flex-wrap"><label className="text-xs text-muted-foreground">Match date<UsDateInput value={date} onChange={next => { if (next) setDate(next); }} label="Match date, MM/DD/YYYY" className="block mt-1 border border-border rounded-md bg-background px-3 py-2 text-sm" /></label><Tag tone={fit.numberPct != null && fit.numberPct >= 70 ? "good" : "neutral"}>{fit.numberPct ?? "—"}% number compatibility</Tag></div>
    <div role="tablist" aria-label="Soccer categories" className="flex gap-1 overflow-x-auto border-b border-border pb-2">{tabs.map(t => <Button key={t} variant="ghost" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`text-xs shrink-0 rounded-md ${tab === t ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>{t}</Button>)}</div>
    <section className="border-t border-border pt-5 space-y-4">
    {tab === "Match Day Protocol" && <><CardTitle>Match Day Protocol</CardTitle><ol className="list-decimal list-inside space-y-4 text-sm"><li>Confirm your match date: {date} · Universal {read.labelU}; calendar day {read.labelDay}.</li><li>Check your jersey against Life Path {chart.lifePath.compound}/{chart.lifePath.reduced}.</li><li>Use your competition colors: {chart.colors.primary}; {chart.colors.secondary}; {chart.colors.accent}.</li><li>Confirm cleats and gear activation in your tracker.</li><li>Check enemy hours: {chart.enemyHours.map(h => h.label).join(", ") || "Birth time needed"}.</li></ol></>}
    {tab === "Jersey Optimizer" && <><CardTitle>Jersey Number Optimizer</CardTitle><label className="text-sm">Jersey number<input aria-label="Jersey number" type="number" min={1} max={99} value={jersey} onChange={e => setJersey(e.target.value)} className="block mt-2 w-28 border border-border rounded-md bg-background px-3 py-2" /></label><Stat label="Number compatibility" value={jerseyRelation} />{chart.lifePath.reduced === 1 && <><p className="text-sm">Existing soccer recommendations: 11 · dominance; 28 · money; 8 · contracts; 1 · leadership; 98 · 8 energy.</p><p className="text-sm text-destructive">Avoid 9, 18, 27, 99 for competition.</p></>}</>}
    {tab === "Cleats & Gear" && <><CardTitle>Cleats & Gear Activation Tracker</CardTitle><SoccerGearTracker /><h3 className="font-display text-lg mt-5">Activation windows</h3><ul className="text-sm space-y-2">{gearWindows.hits.slice(0,5).map(h => <li key={h.iso}>{h.label} · {h.why}</li>)}</ul></>}
    {tab === "Color & Direction" && <><CardTitle>Competition colors</CardTitle><p>{chart.colors.primary} · {chart.colors.secondary} · {chart.colors.accent}</p><p className="text-sm text-muted-foreground">Numerology leads. Western and Vedic direction readings remain separate.</p><div className="grid gap-4 sm:grid-cols-2"><div><h3 className="font-display font-bold">Western competition</h3><p className="text-sm mt-2">White or silver · north / east.</p></div><div><h3 className="font-display font-bold">Vedic competition</h3><p className="text-sm mt-2">Red or navy · south, east, west, north-west, south-west.</p></div></div></>}
    {tab === "Enemy Year Protection" && <><CardTitle>2027 Enemy Year Protection</CardTitle><Tag tone={enemyMode ? "hot" : "neutral"}>{enemyMode ? "Protection mode on" : "Protection mode off"}</Tag><p className="text-sm">Ox / Goat clash: February 6, 2027 – January 25, 2028.</p><p className="text-sm">Existing soccer rule: defer major signings during the Goat enemy year; check enemy hours before competition.</p><Link href="/settings" className="text-sm text-primary">Enemy Year Mode settings</Link></>}
    {tab === "Recruiting & Contracts" && <><CardTitle>Recruiting / Contract Timing</CardTitle><p className="text-sm">Existing protocol: a 3 emails coaches; an 8 or 28 negotiates or signs; a 1 starts. A 9 or fatal date skips new commitments.</p><Link href="/timing" className="text-primary text-sm">Contract timing windows</Link></>}
    </section>
  </Page>;
}
