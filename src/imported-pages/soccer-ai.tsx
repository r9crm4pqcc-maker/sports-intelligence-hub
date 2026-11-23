// @ts-nocheck
import { useMemo, useState } from "react";
import { PROFILE } from "@/lib/profile";
import { calcDateEnergy, calcPersonalYear, reduce } from "@/lib/numerology";
import { birthPair, cueDayBand, cueDayPercent, OX_NEXT_12, VIRGO } from "@/lib/path28";
import { readDay } from "@/lib/life-studio";
import { chineseMonthSign, numberRelation } from "@/lib/vote-decode";
import { SportsPageHeader } from "@/components/sports-page-header";
import { centralDateParts } from "@/lib/sports-pregame-record";

const ORANGE = "#FF6A00";
const ME = { year: 2009, month: 9, day: 8 };
const POWER = ["Black", "White", "Green", "Orange"];
const COLORS = [
  { n: 28, name: "Grey", note: "28 · money" },
  { n: 11, name: "Black, white, gold", note: "11 · dominance" },
  { n: 9, name: "Red", note: "9 · enemy of the 1" },
  { n: 4, name: "Blue and green", note: "4" },
  { n: 7, name: "Purple", note: "7" },
  { n: 5, name: "Pink", note: "5" },
  { n: 6, name: "Orange", note: "33/6" },
];
const BRANDS = [
  { name: "Nike", y: 1964, m: 1, d: 25 },
  { name: "Adidas", y: 1949, m: 8, d: 18 },
  { name: "Mizuno", y: 1906, m: 4, d: 1 },
  { name: "Under Armour", y: 1996, m: 7, d: 1 },
  { name: "Air Jordan", y: 1984, m: 4, d: 1 },
];
const ACT: Record<number, string> = {
  1: "Start something. Take the first action.",
  2: "Wait. Don't force the deal.",
  3: "Write and send. This is the day to email a coach.",
  4: "Keep the structure. Don't freelance.",
  5: "Change the angle.",
  6: "Play for the group.",
  7: "Study it before you decide.",
  8: "Negotiate or sign.",
  9: "Enemy of the 1. Do not start, sign, or wear red.",
  11: "One dominant action. Then stop.",
  22: "Build something that stays.",
  28: "Money and a contract.",
  33: "Serve the group, then lead.",
};

const BIRTH = {
  firstName: "Cristian", middleName: "", lastName: "Zavala",
  year: 2009, month: 9, day: 8, time: "11:18", place: "Chicago",
};

function dayRoot(day: number) {
  return reduce(day);
}
function dayColor(n: number) {
  if (n === 28) return "Grey";
  if (n === 11) return "Black, white, gold";
  if (n === 9) return "Red";
  if (n === 4) return "Blue and green";
  if (n === 7) return "Purple";
  if (n === 5) return "Pink";
  if (n === 6 || n === 33) return "Orange";
  return "";
}
function withThem(universal: number, day: number) {
  if (day === 9) return "The day is a 9, so you do not email, start, or sign. The universal number does not override it.";
  const act = ACT[day] ?? "Follow the day energy.";
  if (universal === day) return act;
  return `${act} The universal is separate. It does not cancel the day.`;
}
function oneCall(y: number, m: number, d: number) {
  const read = readDay(BIRTH, y, m, d);
  const dayN = read.calendar.reduced;
  const marks = read.tones.filter((t) => ["soulmate", "love", "beneficial", "fatal", "challenging", "wealth", "twenty-eight"].includes(t));
  if (dayN === 9 || marks.includes("fatal")) {
    const extra = ["soulmate", "love", "beneficial"].filter((t) => marks.includes(t));
    const why = marks.includes("fatal")
      ? "Skip. Fatal attraction. Do not email, start, or sign."
      : "Skip. The day is a 9, the enemy of the 1.";
    return { date: `${m}/${d}`, why: extra.length ? `${why} ${extra.join(" and ")} is on the chart. Do not force it.` : why, good: false };
  }
  const parts: string[] = [];
  if (marks.includes("soulmate")) parts.push("Soulmate");
  if (marks.includes("love")) parts.push("Love");
  if (marks.includes("beneficial")) parts.push("Beneficial");
  const signDay = d === 8 || d === 17 || d === 26 || d === 28 || dayN === 8;
  if (signDay) parts.push("Negotiate or sign");
  else if (dayN === 1 || dayN === 11) parts.push("Start something new");
  else if (dayN === 3) parts.push("Email coaches");
  else if (marks.includes("challenging")) parts.push("Challenging. Keep it small");
  if (!parts.length) return null;
  return { date: `${m}/${d}`, why: parts.join(" · "), good: !marks.includes("challenging") || parts.length > 1 };
}
function relWord(a: number, b: number) {
  const r = numberRelation(a, b);
  if (r === "same") return "same";
  if (r === "friend" || r === "soulmate") return "friend";
  if (r === "enemy" || r === "worst") return "enemy";
  return "neutral";
}
function enemyFamily(n: number) {
  return [9, 18, 27, 99].includes(n) || dayRoot(n) === 9;
}
function parseDay(s: string) {
  return new Date(s);
}
function yearRow(month: number, day: number, year: number) {
  const when = new Date(year, month - 1, day);
  return OX_NEXT_12.find((row) => {
    const [a, b] = row.span.split(" – ");
    const start = parseDay(a);
    const end = parseDay(b);
    return when >= start && when <= end;
  }) ?? OX_NEXT_12[0];
}
function daysIn(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}
function addDays(y: number, m: number, d: number, n: number) {
  const dt = new Date(y, m - 1, d + n);
  return { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate() };
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "#0c0c0b", border: "1px solid rgba(255,255,255,0.09)" }}>
      <p className="text-[10px] font-bold tracking-[0.16em] mb-2" style={{ color: ORANGE }}>{title}</p>
      {children}
    </div>
  );
}

export default function SoccerAIPage() {
  const today = centralDateParts();
  const [month, setMonth] = useState(today.month);
  const [day, setDay] = useState(today.day);
  const [year, setYear] = useState(today.year);
  const selectedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const updateDate = (value: string) => {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return;
    setYear(Number(match[1]));
    setMonth(Number(match[2]));
    setDay(Number(match[3]));
  };

  const board = useMemo(() => {
    const de = calcDateEnergy(month, day, year);
    const py = calcPersonalYear(ME.month, ME.day, month, day, year);
    const pmCompound = py.reduced + month;
    const pm = reduce(pmCompound);
    const root = dayRoot(day);
    const uRel = relWord(1, de.reduced);
    const dRel = relWord(1, root);
    const pct = cueDayPercent(year, month, day);
    const band = cueDayBand(pct);
    const row = yearRow(month, day, year);
    const monthAnimal = chineseMonthSign(month, day);
    const color = dayColor(root);
    const dow = new Date(year, month - 1, day).getDay();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
    const week = Array.from({ length: 7 }, (_, i) => {
      const dt = addDays(year, month, day, i);
      const p = cueDayPercent(dt.y, dt.m, dt.d);
      const e = calcDateEnergy(dt.m, dt.d, dt.y);
      return { ...dt, pct: p, band: cueDayBand(p), u: e.reduced, day: dayRoot(dt.d) };
    });
    const keys = [];
    for (let d = 1; d <= daysIn(year, month); d++) {
      const call = oneCall(year, month, d);
      if (call) keys.push(call);
    }
    const brands = BRANDS.map((b) => {
      const pair = birthPair(ME, { year: b.y, month: b.m, day: b.d });
      return { name: b.name, pct: pair.pct, why: `${pair.a} with ${pair.b}. ${pair.animals}. ${pair.suns}.`, fatal: pair.fatal };
    }).sort((a, b) => b.pct - a.pct);
    return { de, py, pm, pmCompound, root, uRel, dRel, pct, band, row, monthAnimal, color, dow: days[dow], planet: planets[dow], week, keys, brands };
  }, [month, day, year]);

  return (
    <div className="max-w-7xl space-y-5">
      <SportsPageHeader eyebrow="Sports AI · Soccer" title="Soccer AI" description="Cristian Zavala · Winger · North Grand. Choose a date to review soccer timing, color, number, and cycle guidance." actions={
        <div>
          <label htmlFor="soccer-game-date" className="text-[10px] font-semibold text-white/55">
            Game date
            <input id="soccer-game-date" type="date" value={selectedDate} onChange={(event) => updateDate(event.target.value)}
              className="mt-1 block h-10 rounded-lg border border-white/10 bg-[#10100f] px-3 text-sm font-semibold text-white outline-none [color-scheme:dark] focus:border-[#ff6a00]/60" />
          </label>
        </div>
      } />

      <div className="rounded-2xl p-4 flex items-end justify-between" style={{ background: "#000", border: "1px solid #FF6A00" }}>
        <div>
          <p className="text-[10px] tracking-[0.16em] text-white/40">MATCH</p>
          <p className="text-4xl font-black" style={{ color: ORANGE }}>{board.pct}%</p>
          <p className="text-xs text-white">{board.band}. Life path 1 and the day {board.root} are {board.dRel}. Universal {board.de.reduced} is {board.uRel}.</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-white/50">{board.dow} · {board.planet}</p>
          <p className="text-sm font-bold text-white">{month}/{day}/{year}</p>
        </div>
      </div>

      <Card title="UNIVERSAL AND THE DAY">
        <p className="text-sm text-white">Universal <b style={{ color: ORANGE }}>{board.de.compound}/{board.de.reduced}</b>. {board.de.label}.</p>
        <p className="text-sm text-white mt-1">Day energy <b style={{ color: ORANGE }}>{day}/{board.root}</b>. {ACT[board.root]}</p>
        <p className="text-sm text-white mt-1">Together <b style={{ color: ORANGE }}>{board.de.reduced}/{board.root}</b>. Not added into one number.</p>
        <p className="text-xs text-white/70 mt-2">{withThem(board.de.reduced, board.root)}</p>
      </Card>

      <Card title="PERSONAL YEAR AND MONTH">
        <p className="text-sm text-white">Personal year <b style={{ color: ORANGE }}>{board.py.compound}/{board.py.reduced}</b>. Rolls on September 8.</p>
        <p className="text-sm text-white mt-1">Personal month <b style={{ color: ORANGE }}>{board.pmCompound}/{board.pm}</b>. 20 is a hidden 11.</p>
      </Card>

      <Card title="HOW TO PLAY IT">
        <p className="text-sm text-white">{board.planet} day. {board.planet === "Mars" ? "Finish the chance." : board.planet === "Sun" ? "Take the shot." : board.planet === "Moon" ? "Read it, then go." : board.planet === "Mercury" ? "First touch decides it." : board.planet === "Jupiter" ? "Attack the cross." : board.planet === "Venus" ? "One-two, then the shot." : "Hit it clean. Don't rush the first minute."}</p>
        <p className="text-xs text-white/70 mt-2">{board.dRel === "enemy" ? "The day number is an enemy. Play what is already open. Do not force a new move." : "The day number is not an enemy. You can start the action the universal is asking for."}</p>
      </Card>

      <Card title="JERSEY · 9/8/2009">
        <p className="text-sm text-white">11 · dominance</p>
        <p className="text-sm text-white">28 · money</p>
        <p className="text-sm text-white">8 · contracts</p>
        <p className="text-sm text-white">1 · leadership</p>
        <p className="text-sm mt-2" style={{ color: ORANGE }}>Enemy of the 1: 9, 18, 27, 99. Do not wear them.</p>
      </Card>

      <Card title="COLORS">
        <p className="text-[11px] text-white/50 mb-2">Most days, wear the power colors: black, white, black and orange, green.</p>
        {COLORS.map((c) => <p key={c.note} className="text-xs text-white">{c.name} · {c.note}</p>)}
        <p className="text-xs mt-2 text-white"><b style={{ color: ORANGE }}>Today follows the day energy {board.root}.</b> {board.color && board.root !== 9 ? `Favorable: ${board.color}.` : "No extra color. Stay in the power colors."}</p>
        <p className="text-xs text-white"><b style={{ color: ORANGE }}>Don't wear.</b> Red. The 9 is the enemy of the 1.{board.root === 9 ? " That is today's day energy, so red is off." : ""}</p>
      </Card>

      <Card title="CHINESE">
        <p className="text-sm text-white">You: Ox year. Rooster month, so the month enemy is Cat. Dragon day. Snake hour.</p>
        <p className="text-sm text-white mt-1">This year: {board.row.animal}, {board.row.span}. {board.row.tone}.</p>
        <p className="text-sm text-white mt-1">Enemy sign: Goat. Enemy year: Feb 6, 2027 – Jan 25, 2028.</p>
        <p className="text-sm text-white mt-1">This month: {board.monthAnimal}.</p>
        <p className="text-xs text-white/75 mt-2">Friend hours: Rat 11 PM–1 AM · Snake 9–11 AM, your hour · Rooster 5–7 PM.</p>
        <p className="text-xs text-white/75">Enemy hour: Pig, 9–11 PM. That is the only enemy hour.</p>
      </Card>

      <Card title="CONTRACTS AND RECRUITING">
        <p className="text-xs text-white">The day energy decides it. A 3 emails. An 8 or a 28 signs. A 1 starts. A 9 or a fatal date only skips. Soulmate, love, and beneficial marks sit on that same line. They do not add a second, opposite line.</p>
        <p className="text-xs text-white mt-1">Major signings wait out the Goat enemy year, Feb 6, 2027 – Jan 25, 2028. This Horse year is neutral.</p>
        <div className="mt-2 space-y-0.5">
          {board.keys.filter((k) => k.good).slice(0, 8).map((k) => <p key={k.date} className="text-[11px] text-white">{k.date} · {k.why}</p>)}
        </div>
      </Card>

      <Card title="MATCH % · BRANDS">
        <p className="text-[11px] text-white/45 mb-1">Same birthday match as two people. A coach or a team needs a real date before it gets a percent.</p>
        {board.brands.map((b) => (
          <p key={b.name} className="text-xs text-white"><b style={{ color: ORANGE }}>{b.pct}%</b> {b.name}{b.fatal ? " · fatal" : ""} · {b.why}</p>
        ))}
      </Card>

      <Card title="STRENGTHS AND WATCH-OUTS">
        <p className="text-xs text-white">Life path 28/1. You start it and you play for the result. Watch the 9. Do not burn the bridge just to lead.</p>
        <p className="text-xs text-white mt-1">Ox. You read people and you do not quit. Watch the Goat year and the Pig hour. The fourth animal is Cat, not rabbit.</p>
        <p className="text-xs text-white mt-1">{VIRGO.line}. Detail and a clean system. Watch perfectionism, and Pisces, the 10% opposite.</p>
      </Card>

      <Card title="LUCKY NUMBER AND LETTERS">
        <p className="text-sm text-white">Numbers: 1, 8, 11, 28, 98.</p>
        <p className="text-sm text-white">Letters: A, J, S for the 1. H, Q, Z for the 8.</p>
        <p className="text-xs text-white/60 mt-1">98 is an 8. 99 is an 18/9. It stays with the enemy family.</p>
      </Card>

      <Card title="WEEK">
        {board.week.map((w) => (
          <p key={`${w.m}/${w.d}`} className="text-xs text-white flex justify-between"><span>{w.m}/{w.d} · universal {w.u} · day {w.day}</span><span style={{ color: ORANGE }}>{w.pct}% {w.band}</span></p>
        ))}
      </Card>

      <Card title="MONTH · KEY DAYS">
        <p className="text-[11px] text-white/45 mb-1">{month}/{year}. One line per date. The day number wins.</p>
        {board.keys.map((k) => <p key={k.date} className="text-[11px] text-white">{k.date} · {k.why}</p>)}
      </Card>
    </div>
  );
}
