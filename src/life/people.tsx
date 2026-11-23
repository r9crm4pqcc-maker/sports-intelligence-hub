import { useMemo, useState } from "react";
import { useLife, rid, type FamilyPerson } from "./context";
import { Card, Page, Tag } from "./kit";
import { buildChart, fullName, pairRead, readDay } from "@/lib/life-studio";
import { birthPair, dayCompatibility, fitFace, numberFit, FRIENDLY } from "@/lib/path28";
import { readWord } from "@/lib/letterology";

export default function PeoplePage() {
  const { profile, family, setFamily, lookups, setLookups } = useLife();
  const you = { name: fullName(profile) || "You", year: profile.year, month: profile.month, day: profile.day };
  const [a, setA] = useState({ year: String(profile.year), month: String(profile.month), day: String(profile.day) });
  const [other, setOther] = useState({ name: "", year: "1990", month: "1", day: "1" });
  const [rel, setRel] = useState("Family");
  const [look, setLook] = useState({ kind: "Brand", name: "", year: "2000", month: "1", day: "1" });
  const left = { year: +a.year, month: +a.month, day: +a.day };
  const right = { year: +other.year, month: +other.month, day: +other.day };
  const datesOk = left.year > 0 && left.month >= 1 && left.month <= 12 && left.day >= 1 && left.day <= 31 && right.year > 0 && right.month >= 1 && right.month <= 12 && right.day >= 1 && right.day <= 31;
  const pair = datesOk
    ? pairRead({ name: other.name.trim() || "A", ...left }, { name: other.name.trim() || "B", ...right })
    : null;
  const cue = datesOk ? cuePair(profile, left, right) : null;
  const windows = useMemo(
    () => (datesOk ? dateWindows(left, right) : []),
    [a.year, a.month, a.day, other.year, other.month, other.day, datesOk],
  );
  const youChart = useMemo(() => buildChart(profile, { y: profile.year, m: profile.month, d: profile.day }), [profile]);
  const youFace = fitFace(youChart.lifePath.compound, youChart.lifePath.reduced);
  const typedBrand = readWord(look.name, false);
  const typedFit = typedBrand.letters.length ? numberFit(youFace, typedBrand.reducedRoot) : null;

  function addFamily() {
    if (!other.name.trim()) return;
    const person: FamilyPerson = { id: rid(), name: other.name.trim(), relation: rel, year: +other.year, month: +other.month, day: +other.day };
    setFamily([person, ...family]);
  }
  function addLookup() {
    if (!look.name.trim()) return;
    setLookups([{ id: rid(), kind: look.kind, name: look.name.trim(), year: +look.year, month: +look.month, day: +look.day }, ...lookups]);
  }

  return (
    <Page kicker="Compatibility" title="People, places, brands" lede="Any birthdate against any birthdate. Family stays on this device. Countries, cities, brands, cars, and schools are ranked from a founding or birth date against your chart.">
      <Card>
        <h2 className="font-display text-lg mb-3">Two birthdays</h2>
        <p className="text-xs text-muted-foreground mb-1">First birthday</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={a.month} onChange={(e) => setA({ ...a, month: e.target.value })} />
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={a.day} onChange={(e) => setA({ ...a, day: e.target.value })} />
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={a.year} onChange={(e) => setA({ ...a, year: e.target.value })} />
        </div>
        <p className="text-xs text-muted-foreground mb-1">Second birthday</p>
        <div className="grid sm:grid-cols-4 gap-2">
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-1" placeholder="Name, optional" value={other.name} onChange={(e) => setOther({ ...other, name: e.target.value })} />
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={other.month} onChange={(e) => setOther({ ...other, month: e.target.value })} />
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={other.day} onChange={(e) => setOther({ ...other, day: e.target.value })} />
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={other.year} onChange={(e) => setOther({ ...other, year: e.target.value })} />
        </div>
        {cue && (
          <div className="mt-4 space-y-2">
            <p className="font-display text-3xl text-primary">{cue.pct}%</p>
            <p className="text-sm text-foreground">Life path {cue.lp}% · {cue.animals} {cue.animal}% · {cue.suns} {cue.sky}%. Not the Reports day list.</p>
            {cue.fatal && <Tag tone="bad">Fatal attraction</Tag>}
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">{pair?.lines.map((l) => <li key={l}>{l}</li>)}</ul>
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={rel} onChange={(e) => setRel(e.target.value)} placeholder="Relation" />
          <button onClick={addFamily} className="rounded-lg border border-border px-3 py-2 text-sm">Save to family</button>
        </div>
      </Card>

      {windows.length > 0 && (
        <Card>
          <h2 className="font-display text-lg mb-2">When to meet</h2>
          <p className="text-xs text-muted-foreground mb-2">A day is listed only when the life path, the year animal, and the sun sign all suit both birthdays. The percent is the average of both. It is not the Reports day list.</p>
          <ul className="space-y-1 text-sm">
            {windows.map((w) => <li key={w.iso}>{w.label} · {w.pct}% · {w.why}</li>)}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="font-display text-lg mb-3">Family tree</h2>
        <ul className="space-y-3">
          {family.map((p) => {
            const r = pairRead(you, p);
            return (
              <li key={p.id} className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-2">
                <div>
                  <p className="text-foreground">{p.name} <span className="text-muted-foreground">· {p.relation}</span></p>
                  <p className="text-xs text-muted-foreground">{p.month}/{p.day}/{p.year} · {r.lines[0]} · {r.lines[1]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Tag tone={birthPair(you, p).pct >= 70 ? "good" : birthPair(you, p).pct <= 40 ? "bad" : "neutral"}>{birthPair(you, p).pct}%</Tag>
                  <button className="text-xs text-destructive" onClick={() => setFamily(family.filter((x) => x.id !== p.id))}>Remove</button>
                </div>
              </li>
            );
          })}
          {!family.length && <li className="text-sm text-muted-foreground">No one saved yet.</li>}
        </ul>
      </Card>

      <Card>
        <h2 className="font-display text-lg mb-3">Look up a founding date</h2>
        <div className="grid sm:grid-cols-5 gap-2">
          <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={look.kind} onChange={(e) => setLook({ ...look, kind: e.target.value })}>
            {["Company", "Team", "Brand", "City", "Country", "Person", "Car", "School"].map((k) => <option key={k}>{k}</option>)}
          </select>
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-2" placeholder="Name" value={look.name} onChange={(e) => setLook({ ...look, name: e.target.value })} />
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={look.year} onChange={(e) => setLook({ ...look, year: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={look.month} onChange={(e) => setLook({ ...look, month: e.target.value })} />
            <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={look.day} onChange={(e) => setLook({ ...look, day: e.target.value })} />
          </div>
        </div>
        {typedFit && <p className="mt-3 text-sm">Name {typedBrand.reducedRoot}/{typedBrand.reducedSum} against you: {typedFit.pct != null ? `${typedFit.pct}%` : typedFit.rel}.{typedFit.rel === "enemy" ? " Fatal attraction." : ""}</p>}
        <button onClick={addLookup} className="mt-3 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm">Save lookup</button>
        <ul className="mt-4 space-y-2 text-sm">
          {lookups.map((l) => {
            const fit = birthPair(you, l);
            return (
              <li key={l.id} className="flex justify-between gap-2">
                <span>{l.kind} · {l.name} · {fit.pct}% · life path {fit.lp}% · {fit.animals} {fit.animal}% · {fit.suns} {fit.sky}%{fit.fatal ? " · fatal" : ""}</span>
                <button className="text-xs text-destructive shrink-0" onClick={() => setLookups(lookups.filter((x) => x.id !== l.id))}>Remove</button>
              </li>
            );
          })}
        </ul>
        <BrandBars you={you} saved={lookups} />
      </Card>
    </Page>
  );
}

function cuePair(_profile: { year: number; month: number; day: number }, a: { year: number; month: number; day: number }, b: { year: number; month: number; day: number }) {
  return birthPair(a, b);
}

function layerScore(rel: string, pct: number | null) {
  if (rel === "enemy") return 10;
  if (pct != null) return pct;
  if (rel === "friend") return 80;
  return 60;
}

function dateWindows(first: { year: number; month: number; day: number }, second: { year: number; month: number; day: number }) {
  const blank = { firstName: "", middleName: "", lastName: "", time: "", place: "" };
  const charts = [first, second].map((p) => buildChart({ ...blank, ...p }, { y: p.year, m: p.month, d: p.day }));
  const start = new Date();
  const hits: { iso: string; label: string; pct: number; why: string }[] = [];
  for (let i = 0; i < 200; i++) {
    const dt = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i));
    const y = dt.getUTCFullYear();
    const m = dt.getUTCMonth() + 1;
    const d = dt.getUTCDate();
    const reads = charts.map((chart, idx) => {
      const who = idx === 0 ? first : second;
      const read = readDay({ ...blank, ...who }, y, m, d);
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
      const dayNum = fit.numbers.find((n) => n.name === "Day");
      const enemy = dayNum?.rel === "enemy" || fit.month <= 10 || fit.sky <= 10;
      const parts = [layerScore(dayNum?.rel ?? "neutral", dayNum?.pct ?? null), fit.month, fit.sky];
      return { read, enemy, pct: Math.round(parts.reduce((s, n) => s + n, 0) / parts.length) };
    });
    if (reads.some((r) => r.enemy)) continue;
    const shared = (["soulmate", "love", "beneficial", "wealth"] as const).filter((t) => reads.every((r) => r.read.tones.includes(t)));
    const pct = Math.round((reads[0].pct + reads[1].pct) / 2);
    if (pct < 60 && !shared.length) continue;
    hits.push({
      iso: reads[0].read.iso,
      label: `${m}/${d}/${y}`,
      pct,
      why: shared.length ? shared.join(", ") : "suits both",
    });
  }
  return hits.sort((x, y) => y.pct - x.pct || x.iso.localeCompare(y.iso)).slice(0, 8);
}

function BrandBars({ you, saved }: { you: { year: number; month: number; day: number }; saved: { id: string; kind: string; name: string; year: number; month: number; day: number }[] }) {
  const known = new Set(FRIENDLY.clothes.map((c) => c.name.toLowerCase()));
  const extra = saved
    .filter((l) => /brand|cloth/i.test(l.kind) && !known.has(l.name.toLowerCase()))
    .map((l) => ({ name: l.name, pct: birthPair(you, l).pct }));
  const rows = [...FRIENDLY.clothes, ...extra].sort((a, b) => b.pct - a.pct);
  const friendly = rows.filter((r) => r.pct >= 70);
  const unfriendly = rows.filter((r) => r.pct <= 40);
  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm text-foreground">Friendly brands</p>
      {friendly.map((r) => <p key={r.name} className="text-sm text-muted-foreground">{r.name} · {r.pct}%</p>)}
      <p className="text-sm text-foreground">Unfriendly brands</p>
      {unfriendly.length === 0 && <p className="text-sm text-muted-foreground">None saved under 40%.</p>}
      {unfriendly.map((r) => <p key={r.name} className="text-sm text-muted-foreground">{r.name} · {r.pct}%</p>)}
    </div>
  );
}
