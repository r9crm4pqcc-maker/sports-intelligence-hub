import { useEffect, useState } from "react";
import { Link } from "@/lib/wouter";
import { useLife } from "./context";
import { Card, CardTitle, Page, Stat, Tag } from "./kit";
import { buildChart, animalLabel, nameReading, NUMBER_MEANINGS_FULL, type BirthProfile } from "@/lib/life-studio";
import { calcPersonalYear } from "@/lib/numerology";
import { PATH_28, OX_YEAR, OX_MATCHES, OX_NEXT_12, VIRGO, VIRGO_MATCHES, FRIENDLY, isPath28, yearFace, yearCopy, oxGoodYears, oxEnemyYears, birthPair } from "@/lib/path28";

function useNow() {
  const [now, setNow] = useState({ y: 2026, m: 11, d: 4 });
  useEffect(() => {
    const t = new Date();
    setNow({ y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() });
  }, []);
  return now;
}

export default function ChartPage() {
  const { profile, setProfile, ready, lookups } = useLife();
  const now = useNow();
  const chart = buildChart(profile, now);
  const path28 = isPath28(chart.lifePath.compound);
  const chapters = ["edit", "life", "birthday", "year", "chinese", "western", "vedic", "enemy", "lucky", "friendly", "name"];

  return (
    <Page kicker="Core engine" title={chart.name || "Your chart"} lede="Everything here is calculated from one birthdate. Add a clock time for the hour pillar and a rising estimate.">
      <nav className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {chapters.map((id) => (
          <a key={id} href={`#${id}`} className="shrink-0 rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-primary capitalize">{id}</a>
        ))}
      </nav>

      <Card>
        <div id="edit"><CardTitle>Birth data</CardTitle></div>
        <ProfileForm key={ready ? "set" : "boot"} profile={profile} onSave={setProfile} />
      </Card>

      <Card>
        <div id="life"><CardTitle>Life path</CardTitle></div>
        <div className="grid sm:grid-cols-3 gap-3">
          <Stat label="Life path" value={path28 ? PATH_28.label : `${chart.lifePath.compound}/${chart.lifePath.reduced}`} hint={path28 ? PATH_28.kicker : chart.meaning?.title} />
          <Stat label="Compound" value={String(chart.core.lifePathCompound)} hint="Month + day + year, each reduced, then summed. 28 is kept as wealth." />
          <Stat label="Planet" value={chart.core.planet} hint={chart.meaning?.keywords} />
        </div>
        {path28 ? <Path28Reading /> : <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{chart.meaning?.meaning}</p>}
      </Card>

      <Card>
        <div id="birthday"><CardTitle>Birthday number</CardTitle></div>
        <Stat label="Birthday" value={`${chart.birthday.compound}/${chart.birthday.reduced}`} hint={NUMBER_MEANINGS_FULL[chart.birthday.reduced]?.meaning} />
        {path28 && profile.day === 8 && (
          <div className="mt-4 space-y-3 text-sm">
            <p className="font-display text-lg text-foreground">{PATH_28.birthday.title}</p>
            <p className="text-foreground/90 leading-relaxed">{PATH_28.birthday.body}</p>
            {PATH_28.birthday.traits.map((t) => (
              <p key={t.title}><span className="text-foreground font-medium">{t.title}.</span> <span className="text-muted-foreground">{t.body}</span></p>
            ))}
            <p className="text-muted-foreground leading-relaxed">{PATH_28.birthday.insight}</p>
          </div>
        )}
        {chart.sun === "Virgo" && <VirgoReading />}
      </Card>

      <Card>
        <div id="year"><CardTitle>Personal year</CardTitle></div>
        <YearCard profile={profile} cycleYear={chart.py.cycleYear} face={yearFace(chart.py.compound, chart.py.reduced)} />
      </Card>

      <Card>
        <div id="chinese"><CardTitle>Chinese animal</CardTitle></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Stat label="Year" value={animalLabel(chart.yearAnimal)} hint={profile.year === 2009 && chart.yearAnimal === "Ox" ? OX_YEAR.line : "The year animal."} />
          <Stat label="Month" value={animalLabel(chart.birthMonthAnimal)} hint={`Personal month ${chart.birthPersonalMonth.reduced}. The 9 is the personal month. The animal is separate.`} />
          <Stat label="Hour" value={chart.hour ? animalLabel(chart.hour) : "Add a time"} hint={chart.hourDaylight ? `Clock ${profile.time} is daylight time. Standard time is ${chart.hourStandard}, and that is the hour.` : "Two-hour pillar from standard time."} />
        </div>
        {chart.yearAnimal === "Ox" && <OxReading />}
      </Card>

      <Card>
        <div id="western"><CardTitle>Western chart</CardTitle></div>
        <p className="text-sm text-muted-foreground">The tropical placements are on their own page.</p>
        <Link href="/sky" className="inline-block mt-2 text-sm text-primary">Open the Western chart</Link>
      </Card>

      <Card>
        <div id="vedic"><CardTitle>Vedic chart</CardTitle></div>
        <p className="text-sm text-muted-foreground">The sidereal chart and its colors, numbers, days, months, directions, and metals are on their own page.</p>
        <Link href="/vedic" className="inline-block mt-2 text-sm text-primary">Open the Vedic chart</Link>
      </Card>

      <Card>
        <div id="enemy"><CardTitle>Enemy months and hours</CardTitle></div>
        <p className="text-sm text-muted-foreground mb-3">A month is an enemy when its animal clashes with your birth month, the {animalLabel(chart.birthMonthAnimal)}. An hour is an enemy when its animal clashes with your birth hour, the {chart.hour ? animalLabel(chart.hour) : "hour you add"}. That enemy hour is {chart.enemyHours.map((h) => `${animalLabel(h.sign)} ${h.label}`).join(", ") || "none"}. The fourth animal is Cat. Your sun is {chart.sun}, so the opposite sign is hard and the other signs of the same element are friendly. The personal month number is only how to move. It does not make a month a friend or an enemy.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {chart.months.map((mo) => (
            <Tag key={mo.month} tone={mo.enemy ? "bad" : mo.earth === "friend" ? "good" : "neutral"}>
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][mo.month - 1]} {animalLabel(mo.animal)} {mo.enemy ? "enemy" : mo.earth}
              {mo.west === "enemy" ? ` · ${mo.sun} hard` : mo.west === "friend" ? ` · ${mo.sun} friendly` : ""}
              {` · move ${mo.personalMonth.reduced}`}
            </Tag>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {chart.hours.map((h) => (
            <Tag key={h.label} tone={h.enemy ? "bad" : h.rel === "friend" ? "good" : "neutral"}>{h.label} {animalLabel(h.sign)}{h.enemy ? " · enemy" : ""}</Tag>
          ))}
        </div>
      </Card>

      <Card>
        <div id="lucky"><CardTitle>Lucky numbers</CardTitle></div>
        <p className="text-sm text-foreground">99, 98, 28, 8</p>
        <p className="text-sm text-muted-foreground mt-2">Power colors: black and white, black & orange, green.</p>
      </Card>

      {path28 && (
        <Card>
          <div id="friendly"><CardTitle>Friendly</CardTitle></div>
          <p className="text-xs text-muted-foreground mb-3">Highest match first. These are the given percents, not a new calculation.</p>
          <FriendlyList title="Countries" rows={FRIENDLY.countries} />
          <FriendlyList title="Cities" rows={FRIENDLY.cities} />
          <FriendlyList title="Clothing" rows={clothingRows(profile, lookups)} />
          <FriendlyList title="Cars" rows={FRIENDLY.cars} />
        </Card>
      )}

      <Card>
        <div id="name"><CardTitle>Name</CardTitle></div>
        {(() => {
          const read = nameReading(profile);
          const letter = read.first?.letter ?? "";
          const vowel = read.firstVowel?.letter ?? "";
          return (
            <div className="space-y-2 text-sm">
              <p className="text-foreground text-base">{read.name} = {read.root}</p>
              <p className="text-foreground">Reduced {read.root}/{read.reducedCompound} · Full value {read.root}/{read.fullCompound}</p>
              <p className="text-foreground">All the vowels {read.vowels}</p>
              <p className="text-foreground">First letter ({letter.toLowerCase()}) {read.first?.n}</p>
              <p className="text-foreground">First vowel ({vowel.toLowerCase()}) {read.firstVowel?.n}</p>
              <p className="text-muted-foreground leading-relaxed">The 1–9 chart adds every letter once, across the whole name. The full value uses A as 1 through Z as 26. Both totals reduce to {read.root}. {letter} is how you step in. {vowel} is the first vowel, the private tone. The vowels together are {read.vowels}.</p>
            </div>
          );
        })()}
      </Card>
    </Page>
  );
}

function VirgoReading() {
  return (
    <div className="mt-4 space-y-3 text-sm">
      <p className="font-display text-lg text-foreground">{VIRGO.title}</p>
      <p className="text-xs text-muted-foreground">{VIRGO.line}</p>
      <p className="text-foreground/90 leading-relaxed">{VIRGO.overview}</p>
      <p className="text-muted-foreground leading-relaxed">{VIRGO.insight}</p>
      <p className="text-foreground/90 leading-relaxed">{VIRGO.strength}</p>
      <p className="text-muted-foreground leading-relaxed">{VIRGO.weakness}</p>
      <p className="font-display text-lg text-foreground">{VIRGO.love.title}</p>
      <p className="text-muted-foreground leading-relaxed">{VIRGO.love.body}</p>
      <p className="text-foreground">{VIRGO.opposite.sign} · {VIRGO.opposite.pct}. {VIRGO.opposite.note}.</p>
      <p className="text-muted-foreground leading-relaxed">{VIRGO.opposite.body} {VIRGO.caution}</p>
      <p className="text-foreground">Friendly: {VIRGO.friends.signs.map((s) => `${s.sign} ${s.pct}%`).join(" · ")}.</p>
      <p className="text-muted-foreground leading-relaxed">{VIRGO.friends.body} {VIRGO.friends.windows}</p>
      <p className="font-display text-lg text-foreground">{VIRGO.health.title}</p>
      <p className="text-muted-foreground leading-relaxed">{VIRGO.health.body}</p>
      <p className="text-foreground">Vulnerability: {VIRGO.health.vulnerability}. Remedy: {VIRGO.health.remedy}.</p>
      <p className="text-muted-foreground">{VIRGO.health.insight}</p>
      <p className="font-display text-lg text-foreground">Career and money</p>
      <p className="text-muted-foreground leading-relaxed">{VIRGO.career.body}</p>
      <p className="text-foreground">{VIRGO.career.tags.join(" · ")}</p>
      <p className="text-muted-foreground">{VIRGO.career.paths.join(" · ")}</p>
      <p className="text-muted-foreground leading-relaxed">{VIRGO.career.style} {VIRGO.career.watch}</p>
      <p className="text-muted-foreground">All 12, most compatible first.</p>
      <PctBars rows={VIRGO_MATCHES.map((m) => ({ name: m.sign, pct: m.pct }))} />
    </div>
  );
}

function clothingRows(profile: { year: number; month: number; day: number }, lookups: { kind: string; name: string; year: number; month: number; day: number }[]) {
  const known = new Set(FRIENDLY.clothes.map((c) => c.name.toLowerCase()));
  const extra = lookups
    .filter((l) => /brand|cloth/i.test(l.kind) && !known.has(l.name.toLowerCase()))
    .map((l) => ({ name: l.name, pct: birthPair(profile, l).pct }));
  return [...FRIENDLY.clothes, ...extra].sort((a, b) => b.pct - a.pct);
}

function PctBars({ rows }: { rows: { name: string; pct: number }[] }) {
  return (
    <div className="space-y-2 mt-2">
      {rows.map((row) => (
        <div key={row.name} className="grid grid-cols-[8.5rem_1fr_2.75rem] items-center gap-2">
          <span className="text-sm text-foreground truncate">{row.name}</span>
          <span className="h-2 rounded-full bg-border overflow-hidden">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${row.pct}%` }} />
          </span>
          <span className="text-sm text-right text-foreground">{row.pct}%</span>
        </div>
      ))}
    </div>
  );
}

function FriendlyList({ title, rows }: { title: string; rows: { name: string; pct: number }[] }) {
  return (
    <div className="mt-4">
      <p className="text-sm text-foreground">{title}</p>
      <PctBars rows={rows} />
    </div>
  );
}

function OxReading() {
  const good = oxGoodYears();
  const enemy = oxEnemyYears();
  return (
    <div className="mt-4 space-y-4 text-sm">
      <div>
        <p className="font-display text-lg text-foreground">{OX_YEAR.title}</p>
        <p className="text-foreground/90 leading-relaxed mt-1">{OX_YEAR.body}</p>
      </div>
      <p className="text-muted-foreground">Strengths: {OX_YEAR.glance.strengths.join(", ")}. Weaknesses: {OX_YEAR.glance.weaknesses.join(", ")}. Hidden gift: {OX_YEAR.glance.gift}.</p>
      <p className="text-muted-foreground leading-relaxed">{OX_YEAR.friendlyIntro}</p>
      <p className="text-foreground">{OX_MATCHES.filter((m) => m.tone === "friend" || m.tone === "self").map((m) => `${m.animal} ${m.pct}%`).join(" · ")}</p>
      <p className="text-muted-foreground leading-relaxed">{OX_YEAR.goodYearsIntro}</p>
      <p className="text-foreground">{good.map((g) => `${g.animal} ${g.year}`).join(" · ")}</p>
      <p className="text-muted-foreground leading-relaxed">{OX_YEAR.enemyIntro} Goat, 10% match.</p>
      <p className="text-muted-foreground leading-relaxed">{OX_YEAR.enemyYearsIntro}</p>
      <p className="text-foreground">{enemy.map((g) => `Goat ${g.year}`).join(" · ")}</p>
      <div>
        <p className="font-display text-lg text-foreground">Next 12 lunar years</p>
        <p className="text-xs text-muted-foreground mb-2">Lunar years, not calendar years. 2026 is the Horse, and it is neutral.</p>
        <ul className="space-y-1">
          {OX_NEXT_12.map((row) => (
            <li key={row.year} className="flex justify-between gap-3">
              <span className="text-foreground">{row.year} · {row.animal}{row.year === 2026 ? " · now" : ""}</span>
              <span className="text-muted-foreground text-right">{row.tone}<br />{row.span}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-foreground/90 leading-relaxed">{OX_YEAR.strength}</p>
      <p className="text-muted-foreground leading-relaxed">{OX_YEAR.weakness}</p>
      <p className="text-foreground">Do: {OX_YEAR.dos.join(" · ")}</p>
      <p className="text-muted-foreground">Don't: {OX_YEAR.donts.join(" · ")}</p>
      <div>
        {OX_YEAR.study.map((s) => <p key={s.n} className="mt-2"><span className="text-foreground font-medium">{s.n} {s.title}.</span> <span className="text-muted-foreground">{s.body}</span></p>)}
      </div>
      <p className="text-foreground">Balance. Strengths: {OX_YEAR.balance.strengths.join(", ")}.</p>
      <p className="text-muted-foreground">Challenges: {OX_YEAR.balance.challenges.join(", ")}.</p>
      <p className="text-muted-foreground">All 12, most compatible first.</p>
      <PctBars rows={OX_MATCHES.map((m) => ({ name: m.animal, pct: m.pct }))} />
    </div>
  );
}

function Path28Reading() {
  const p = PATH_28;
  return (
    <div className="mt-4 space-y-4 text-sm">
      <p className="text-foreground/90 leading-relaxed">{p.overview}</p>
      <div>
        <p className="font-display text-lg text-foreground">Personality</p>
        <p className="text-foreground font-medium mt-1">{p.personality.title}</p>
        <p className="text-muted-foreground leading-relaxed">{p.personality.body}</p>
        <p className="text-foreground font-medium mt-2">Advantages</p>
        <p className="text-muted-foreground leading-relaxed">{p.personality.advantage}</p>
        <p className="text-foreground font-medium mt-2">What you need to do</p>
        <p className="text-muted-foreground leading-relaxed">{p.personality.do}</p>
        <p className="text-foreground font-medium mt-2">Watch out</p>
        <p className="text-muted-foreground leading-relaxed">{p.personality.watch}</p>
      </div>
      <div>
        <p className="font-display text-lg text-foreground">Strengths</p>
        {p.strengths.map((s) => <p key={s.title} className="mt-1"><span className="text-foreground font-medium">{s.title}.</span> <span className="text-muted-foreground">{s.body}</span></p>)}
      </div>
      <div>
        <p className="font-display text-lg text-foreground">Weaknesses</p>
        {p.weaknesses.map((s) => <p key={s.title} className="mt-1"><span className="text-foreground font-medium">{s.title}.</span> <span className="text-muted-foreground">{s.body}</span></p>)}
      </div>
      <div>
        <p className="font-display text-lg text-foreground">Career</p>
        <p className="text-muted-foreground leading-relaxed mt-1">{p.career.body}</p>
        <p className="mt-2 text-foreground">{p.career.tags.join(" · ")}</p>
        <p className="text-muted-foreground mt-1">{p.career.paths.join(" · ")}</p>
        <p className="text-muted-foreground leading-relaxed mt-2">{p.career.style}</p>
        <p className="text-muted-foreground leading-relaxed mt-1">{p.career.watch}</p>
      </div>
      <div>
        <p className="font-display text-lg text-foreground">Love</p>
        <p className="text-muted-foreground leading-relaxed mt-1">{p.love.body}</p>
        <p className="mt-2 text-foreground">{p.love.traits.join(" · ")}</p>
        <p className="text-muted-foreground leading-relaxed mt-2">{p.love.match}</p>
        <p className="text-muted-foreground leading-relaxed mt-1">{p.love.bonding}</p>
        <p className="text-muted-foreground leading-relaxed mt-1">{p.love.watch}</p>
      </div>
      <div>
        <p className="font-display text-lg text-foreground">Study</p>
        {p.study.map((s) => <p key={s.n} className="mt-2"><span className="text-foreground font-medium">{s.n} {s.title}.</span> <span className="text-muted-foreground">{s.body}</span></p>)}
      </div>
    </div>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function cycleSpan(month: number, day: number, cycleYear: number) {
  const end = new Date(Date.UTC(cycleYear + 1, month - 1, day));
  end.setUTCDate(end.getUTCDate() - 1);
  return `${MONTHS[month - 1]} ${day}, ${cycleYear} – ${MONTHS[end.getUTCMonth()]} ${end.getUTCDate()}, ${end.getUTCFullYear()}`;
}

export function YearCard({ profile, cycleYear, face }: { profile: BirthProfile; cycleYear: number; face: number }) {
  const [pick, setPick] = useState(1);
  const years = [cycleYear - 1, cycleYear, cycleYear + 1];
  const chosen = years[pick] ?? cycleYear;
  const py = calcPersonalYear(profile.month, profile.day, profile.month, profile.day, chosen);
  const shown = yearFace(py.compound, py.reduced);
  const copy = yearCopy(shown);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {years.map((y, i) => {
          const row = calcPersonalYear(profile.month, profile.day, profile.month, profile.day, y);
          const n = yearFace(row.compound, row.reduced);
          return (
            <button key={y} type="button" onClick={() => setPick(i)} className={`rounded-xl border px-2 py-2 text-sm ${i === pick ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
              <span className="block font-medium">{y}</span>
              <span className="text-xs">{i === 0 ? "" : i === 1 ? "Now · " : ""}Year {n}</span>
            </button>
          );
        })}
      </div>
      <Stat label="Personal year" value={String(shown)} hint={copy?.title ?? `Cycle ${face}`} />
      <p className="text-xs text-muted-foreground">{cycleSpan(profile.month, profile.day, chosen)}</p>
      {chosen === 2027 && (
        <p className="text-xs text-muted-foreground">This personal year is 28, Wealth and Authority, from September 8. Before that, February 6 through September 7 is still Personal Year 9 sitting on the Goat year. That overlap is the caution window. Two different clocks.</p>
      )}
      {copy && (
        <div className="text-sm space-y-2">
          <p className="font-display text-lg text-foreground">{copy.title}</p>
          <p className="text-foreground/90 leading-relaxed">{copy.body}</p>
          <p className="text-foreground font-medium">Key opportunities</p>
          <ul className="text-muted-foreground space-y-1">{copy.opportunities.map((o) => <li key={o}>{o}</li>)}</ul>
          <p className="text-foreground font-medium">Watch out</p>
          <p className="text-muted-foreground leading-relaxed">{copy.watch}</p>
          <p className="text-foreground font-medium">Guidance</p>
          <p className="text-muted-foreground leading-relaxed">{copy.guidance}</p>
        </div>
      )}
    </div>
  );
}

function ProfileForm({ profile, onSave }: { profile: BirthProfile; onSave: (p: BirthProfile) => void }) {
  const [form, setForm] = useState(profile);
  const [msg, setMsg] = useState("");
  const set = (k: keyof BirthProfile, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form className="grid sm:grid-cols-2 gap-3" onSubmit={(e) => {
      e.preventDefault();
      const year = +form.year, month = +form.month, day = +form.day;
      if (!form.firstName.trim() || month < 1 || month > 12 || day < 1 || day > 31 || year < 1800 || year > 2200) {
        setMsg("Check the name and the date.");
        return;
      }
      onSave({ ...form, firstName: form.firstName.trim(), year, month, day, time: String(form.time || ""), place: form.place });
      setMsg("Saved on this device.");
    }}>
      <Field label="First" value={form.firstName} onChange={(v) => set("firstName", v)} />
      <Field label="Middle" value={form.middleName} onChange={(v) => set("middleName", v)} />
      <Field label="Last" value={form.lastName} onChange={(v) => set("lastName", v)} />
      <Field label="Place" value={form.place} onChange={(v) => set("place", v)} />
      <Field label="Year" value={String(form.year)} onChange={(v) => set("year", v)} />
      <Field label="Month" value={String(form.month)} onChange={(v) => set("month", v)} />
      <Field label="Day" value={String(form.day)} onChange={(v) => set("day", v)} />
      <Field label="Time (24h)" value={form.time} onChange={(v) => set("time", v)} />
      <div className="sm:col-span-2 flex items-center gap-3">
        <button type="submit" className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Save chart</button>
        {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
      </div>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-xs text-muted-foreground">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
    </label>
  );
}
