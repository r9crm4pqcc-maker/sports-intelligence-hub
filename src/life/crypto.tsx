import { useMemo, useState } from "react";
import { Card, Page, Tag } from "./kit";
import { COINS, type Coin } from "@/lib/coins";
import { buildChart, readDay } from "@/lib/life-studio";
import { cueDayBand, cueDayPercent, dayCompatibility } from "@/lib/path28";

export default function CryptoPage() {
  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() };
  });
  const [q, setQ] = useState("");
  const [list, setList] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("life-coins") || "[]"); } catch { return []; }
  });
  const [path, setPath] = useState("all");
  const dayPct = cueDayPercent(cursor.y, cursor.m, cursor.d);
  const rows = useMemo(() => {
    return COINS.filter((c) => !q || c.symbol.toLowerCase().includes(q.toLowerCase()) || c.name.toLowerCase().includes(q.toLowerCase()))
      .map((c) => coinRead(c, cursor))
      .filter((r) => path === "all" || String(r.lifeReduced) === path || (path === "28" && r.lifeCompound === 28));
  }, [q, cursor, path]);

  function toggle(symbol: string) {
    const next = list.includes(symbol) ? list.filter((s) => s !== symbol) : [symbol, ...list];
    setList(next);
    localStorage.setItem("life-coins", JSON.stringify(next));
  }

  return (
    <Page kicker="Crypto Research" title="Every coin has a birthday" lede="The day a coin went live gives it numbers, the way a birthday does. This reads those coins against the day you pick. Launch dates are the public genesis or first-trade dates, not a promise about price.">
      <Card>
        <p className="font-display text-2xl">You · {dayPct}% · {cueDayBand(dayPct)}</p>
        <p className="text-sm text-muted-foreground">Your Reports number for {cursor.m}/{cursor.d}/{cursor.y}. This is you, not the coin. Each coin below is its own life path, animal, and sun against this day’s energy, the same layers Reports uses.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-sm" value={cursor.m} onChange={(e) => setCursor({ ...cursor, m: +e.target.value || 1 })} />
          <input className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-sm" value={cursor.d} onChange={(e) => setCursor({ ...cursor, d: +e.target.value || 1 })} />
          <input className="w-24 rounded-lg border border-border bg-background px-2 py-1 text-sm" value={cursor.y} onChange={(e) => setCursor({ ...cursor, y: +e.target.value || cursor.y })} />
          <input className="rounded-lg border border-border bg-background px-3 py-1 text-sm" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="rounded-lg border border-border bg-background px-2 py-1 text-sm" value={path} onChange={(e) => setPath(e.target.value)}>
            <option value="all">All life paths</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 28].map((n) => <option key={n} value={String(n)}>{n}</option>)}
          </select>
        </div>
      </Card>
      {list.length > 0 && (
        <Card>
          <h2 className="font-display text-lg mb-2">My list</h2>
          <ul className="space-y-2 text-sm">
            {list.map((symbol) => {
              const coin = COINS.find((c) => c.symbol === symbol);
              if (!coin) return null;
              const r = coinRead(coin, cursor);
              return <li key={symbol}>{coin.symbol} · life path {r.life} · {r.dayPct}% with this day · {r.note}</li>;
            })}
          </ul>
        </Card>
      )}
      <div className="space-y-2">
        {rows.map((r) => (
          <Card key={r.coin.symbol}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg">{r.coin.symbol} · {r.coin.name}</p>
                <p className="text-xs text-muted-foreground">Live {r.coin.month}/{r.coin.day}/{r.coin.year}</p>
              </div>
              <button type="button" onClick={() => toggle(r.coin.symbol)} className="text-sm text-primary">{list.includes(r.coin.symbol) ? "Remove" : "My list"}</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Tag>Life path {r.life}</Tag>
              <Tag>Personal year {r.py}</Tag>
              <Tag>Personal month {r.pm}</Tag>
              <Tag>{r.animal}</Tag>
              <Tag tone={r.dayPct >= 63 ? "good" : r.dayPct <= 36 ? "bad" : "neutral"}>{r.dayPct}% with this day</Tag>
              {r.marks.map((m) => <Tag key={m} tone={m === "Fatal" ? "bad" : "good"}>{m}</Tag>)}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{r.note}</p>
          </Card>
        ))}
      </div>
    </Page>
  );
}

function coinRead(coin: Coin, cursor: { y: number; m: number; d: number }) {
  const profile = { firstName: coin.name, middleName: "", lastName: "", year: coin.year, month: coin.month, day: coin.day, time: "", place: "" };
  const chart = buildChart(profile, cursor);
  const read = readDay(profile, cursor.y, cursor.m, cursor.d);
  const marks = read.tones.filter((t) => t === "soulmate" || t === "fatal" || t === "love" || t === "beneficial" || t === "wealth").map((t) => t === "love" ? "Love" : t[0].toUpperCase() + t.slice(1));
  const fit = dayCompatibility({
    lifeCompound: chart.lifePath.compound,
    lifeReduced: chart.lifePath.reduced,
    universalReduced: read.universal.reduced,
    universalCompound: read.universal.compound,
    dayReduced: read.calendar.reduced,
    dayCompound: read.calendar.compound,
    combinedReduced: read.combined.reduced,
    combinedCompound: read.combined.compound,
    yearAnimal: chart.yearAnimal,
    monthAnimal: read.monthAnimal,
    sun: chart.sun,
    daySun: read.sun,
  });
  const layers = [fit.numberPct, fit.month, fit.sky].filter((n): n is number => n != null);
  const dayLayer = fit.numbers.find((n) => n.name === "Day");
  const note = `Life path ${fit.self} and the day ${dayLayer?.other ?? "—"} are ${dayLayer?.rel ?? "neutral"}. ${fit.numbers.filter((n) => n.name !== "Together").map((n) => `${n.name} ${n.pct != null ? `${n.pct}%` : n.rel}`).join(" · ")}. ${chart.yearAnimal} with ${read.monthAnimal} month ${fit.month}% · ${chart.sun} with ${read.sun} ${fit.sky}%.`;
  return {
    coin,
    life: `${chart.lifePath.compound}/${chart.lifePath.reduced}`,
    lifeReduced: chart.lifePath.reduced,
    lifeCompound: chart.lifePath.compound,
    py: chart.py.reduced,
    pm: read.personalMonth.reduced,
    animal: chart.yearAnimal,
    dayPct: layers.length ? Math.round(layers.reduce((s, n) => s + n, 0) / layers.length) : 0,
    note,
    marks,
  };
}
