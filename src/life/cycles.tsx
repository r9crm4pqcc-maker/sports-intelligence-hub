import { useEffect, useState } from "react";
import { useLife } from "./context";
import { readDay } from "@/lib/life-studio";
import { Page, Stat } from "./kit";
import { YearCard } from "./chart";
import { yearFace } from "@/lib/path28";
export default function CyclesPage() {
  const { profile } = useLife();
  const [date, setDate] = useState({ y: 2026, m: 11, d: 26 });
  useEffect(() => { const t = new Date(); setDate({ y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() }); }, []);
  const read = readDay(profile, date.y, date.m, date.d);
  return <Page kicker="Dates & Timing" title="Personal Cycles"><div className="grid gap-3 sm:grid-cols-3"><Stat label="Personal year" value={`${read.personalYear.compound}/${read.personalYear.reduced}`} /><Stat label="Personal month" value={`${read.personalMonth.compound}/${read.personalMonth.reduced}`} /><Stat label="Personal day" value={`${read.personal.compound}/${read.personal.reduced}`} /></div><YearCard profile={profile} cycleYear={read.personalYear.cycleYear ?? date.y} face={yearFace(read.personalYear.compound, read.personalYear.reduced)} /></Page>;
}
