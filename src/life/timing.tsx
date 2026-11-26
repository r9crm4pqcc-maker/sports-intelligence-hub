import { useEffect, useState } from "react";
import { Link } from "@/lib/wouter";
import { useLife } from "./context";
import { Card, Page } from "./kit";
import { GOALS, daysInMonth, openOn, scanMonth, yearWindows, type Goal } from "@/lib/life-studio";
import { dailySecretsFor } from "@/lib/timing-secrets";

export default function TimingPage() {
  const { profile } = useLife();
  const [goal, setGoal] = useState<Goal>("money");
  const [cursor, setCursor] = useState({ y: 2026, m: 11 });
  const [item, setItem] = useState("cleats");
  const [from, setFrom] = useState({ y: 2026, m: 11, d: 4 });
  useEffect(() => {
    const t = new Date();
    const now = { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() };
    setCursor({ y: now.y, m: now.m });
    setFrom(now);
  }, []);
  const month = scanMonth(profile, cursor.y, cursor.m, goal);
  const windows = yearWindows(profile, cursor.y, goal);
  const opened = openOn(profile, item, from);
  const secrets = dailySecretsFor(from.y, from.m, from.d);

  return (
    <Page kicker="Goal timing" title="Best days" lede="Pick a goal, scan a month, then look at the strongest windows in the year. Scores are 0–10 from your chart. They are not odds.">
      <div className="flex flex-wrap gap-2">
        {GOALS.map((g) => (
          <button key={g.id} onClick={() => setGoal(g.id)} className={`rounded-full border px-3 py-1 text-xs ${goal === g.id ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{g.label}</button>
        ))}
      </div>
      <Card>
        <div className="flex items-center gap-3 mb-3">
          <button className="text-sm text-primary" onClick={() => setCursor((c) => c.m === 1 ? { y: c.y - 1, m: 12 } : { ...c, m: c.m - 1 })}>Prev</button>
          <p className="font-display text-lg">{cursor.m}/{cursor.y}</p>
          <button className="text-sm text-primary" onClick={() => setCursor((c) => c.m === 12 ? { y: c.y + 1, m: 1 } : { ...c, m: c.m + 1 })}>Next</button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: new Date(Date.UTC(cursor.y, cursor.m - 1, 1)).getUTCDay() }, (_, i) => <div key={`b${i}`} />)}
          {month.map((day) => (
            <Link key={day.d} href={`/day/${day.read.iso}`} className="rounded-md border border-border p-1 text-center hover:border-primary">
              <div className="text-xs text-foreground">{day.d}</div>
              <div className={`text-sm font-semibold ${day.score >= 7 ? "text-primary" : day.score <= 3 ? "text-destructive" : "text-muted-foreground"}`}>{day.score}</div>
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">{daysInMonth(cursor.y, cursor.m)} days. 7 and above is a strong window.</p>
      </Card>
      <Card>
        <h2 className="font-display text-lg mb-2">Strongest windows in {cursor.y}</h2>
        <ul className="space-y-2 text-sm">
          {windows.map((w) => (
            <li key={w.iso} className="flex flex-wrap justify-between gap-2">
              <Link href={`/day/${w.iso}`} className="text-foreground hover:text-primary">{w.label}</Link>
              <span className="text-primary">{w.score}/10 · {w.reasons.slice(0, 2).join(", ")}</span>
            </li>
          ))}
          {!windows.length && <li className="text-muted-foreground">No day cleared 7 this year for that goal. Use the month grid and take the highest.</li>}
        </ul>
      </Card>
      <Card>
        <h2 className="font-display text-lg mb-2">Lucky-number actions</h2>
        <p className="text-sm text-muted-foreground">Use a day whose personal number matches a primary lucky number when you wear the number, price something, or put it on a jersey.</p>
        <p className="text-sm mt-2">Match the personal day to a primary lucky number on your chart when the goal score on that date is 7 or higher.</p>
      </Card>
      <Card>
        <h2 className="font-display text-lg mb-2">Open this on a day</h2>
        <p className="text-sm text-muted-foreground mb-3">Cleats, a jersey, a tool. The day comes from your love and friendship, soulmate, wealth, and beneficial dates. The name of the thing is not numbered.</p>
        <input value={item} onChange={(e) => setItem(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="cleats, jersey, website" />
        <ul className="mt-3 space-y-2 text-sm">
          {opened.hits.map((h) => (
            <li key={h.iso}>
              <Link href={`/day/${h.iso}`} className="text-primary">{h.label}</Link>
              <span className="text-muted-foreground"> — {h.why}</span>
            </li>
          ))}
          {!opened.hits.length && <li className="text-muted-foreground">None of those dates in the next year.</li>}
        </ul>
      </Card>
    </Page>
  );
}
