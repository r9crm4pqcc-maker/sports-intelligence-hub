// Explicit readout of the 7-step engine plus the 8 checks the card was asked to show.
import { monthName, type DateMatrix } from "./full-decode";
import { numberFit } from "./path28";
import { recordVibrations, type RecordStats } from "./sports-record-vibrations";
import {
  SPECIAL_NUMBERS,
  fmt,
  signRelation,
  numberRelation,
  chineseMonthSign,
  type Num,
  type Sign,
  type VoteResult,
} from "./vote-decode";

export type Tone = "friend" | "enemy" | "neutral" | "master" | "info";
export interface BriefLine { tone: Tone; text: string }
export interface BriefSection { n: number; title: string; lines: BriefLine[] }
export interface DoingRow { label: string; edge: string; reason: string }
export interface BriefEntity {
  recordStats?: RecordStats;
  py?: Num; pm?: Num; pw?: Num; ph?: readonly number[];
  side: "home" | "away" | "venue";
  kind: "team" | "player" | "city" | "stadium";
  name: string;
  role?: string;
  jersey?: string;
  date?: readonly [number, number, number];
  yearSign?: Sign;
  lp?: Num;
  pd?: Num;
  lucky?: number;
  matrix?: DateMatrix;
}
export interface MatchBrief { doing: DoingRow[]; sections: BriefSection[]; upgrades: BriefSection[] }

const MASTERS = new Set([11, 22, 33]);
const CHART_COMPOUNDS = new Set([11, 22, 28, 33]);

function toneOf(word: string): Tone {
  if (word === "Friend" || word === "Beneficial") return "friend";
  if (word === "Enemy" || word === "Fatal" || word === "Challenging") return "enemy";
  if (word === "Master" || word === "Extreme") return "master";
  return "neutral";
}

function chartWord(a: number, b: number): { word: "Friend" | "Neutral" | "Enemy"; note: string } {
  const hit = numberFit(a, b);
  if (hit.rel === "enemy") return { word: "Enemy", note: `${hit.pct ?? 10}% compatibility` };
  if (hit.rel === "friend") {
    return { word: "Friend", note: hit.pct != null ? `${hit.pct}% friendly` : "friendly on the chart" };
  }
  return { word: "Neutral", note: `${hit.pct ?? 60}% compatibility; no friend or enemy pair` };
}

function lpKeys(n: Num): number[] {
  const keys = [n.reduced];
  if (n.compound !== n.reduced && CHART_COMPOUNDS.has(n.compound)) keys.unshift(n.compound);
  return [...new Set(keys)];
}

function mdLabel(date?: readonly [number, number, number]): string | undefined {
  if (!date) return undefined;
  return `${monthName(date[1])} ${date[2]}`;
}

function venueBucket(matrix: DateMatrix | undefined, label: string | undefined): "Beneficial" | "Fatal" | "Challenging" | "Neutral" | "Unknown" {
  if (!matrix || !label) return "Unknown";
  if (matrix.fatal.includes(label)) return "Fatal";
  if (matrix.beneficial.includes(label) || matrix.soulmate.includes(label) || matrix.lovers.includes(label)) return "Beneficial";
  if (matrix.challenging.includes(label)) return "Challenging";
  return "Neutral";
}

function isKeyPlayer(role?: string): boolean {
  return /pitcher|quarterback|^qb$|goalie|fighter|^player$|goalkeeper|keeper/i.test(role ?? "");
}

export function buildMatchBrief(
  v: VoteResult,
  entities: BriefEntity[],
  names: { home: string; away: string; month: number },
): MatchBrief {
  const name = (side: "home" | "away" | "venue" | null) =>
    side === "home" ? names.home : side === "away" ? names.away : side === "venue" ? "Venue" : "Even";
  const doing: DoingRow[] = v.steps.map((s) => ({
    label: s.label,
    edge: s.edge ? name(s.edge) : "Even",
    reason: s.reason,
  }));

  const homeLp = v.reads.home.lp;
  const awayLp = v.reads.away.lp;
  const ud = v.universalDay;
  const chart: BriefLine[] = [];
  for (const [side, lp] of [["home", homeLp], ["away", awayLp]] as const) {
    if (!lp) continue;
    for (const k of lpKeys(lp)) {
      const hit = chartWord(k, ud.reduced);
      chart.push({
        tone: toneOf(hit.word),
        text: `${name(side)} Life Path ${k} vs Universal Day ${fmt(ud)} — ${hit.word} (${hit.note})`,
      });
    }
  }
  if (!chart.length) {
    chart.push({ tone: "info", text: "Team founding dates are not available for a number-to-day comparison." });
  }

  const stackFor = (side: "home" | "away"): BriefLine[] => {
    const rows = v.votes.filter((x) => x.side === side);
    const total = rows.reduce((s, x) => s + x.weight, 0) || 1;
    const strong = rows.filter((x) => x.weight / total >= 0.15).length;
    const head: BriefLine = {
      tone: strong ? "friend" : "neutral",
      text: `${name(side)} — ${rows.length} layer${rows.length === 1 ? "" : "s"} stacking, ${strong} strong`,
    };
    if (!rows.length) return [head, { tone: "neutral", text: "No layer landed on this side." }];
    return [
      head,
      ...rows.map((x) => {
        const pct = Math.round((100 * x.weight) / total);
        return {
          tone: (pct >= 15 ? "friend" : "info") as Tone,
          text: `${pct >= 15 ? "Strong" : "Light"} ${pct}% · ${x.layer} — ${x.reason}`,
        };
      }),
    ];
  };

  const animals: BriefLine[] = [];
  const flagged = new Set<string>();
  const flag = (who: string, sign: Sign, other: string, otherSign: Sign) => {
    const rel = signRelation(sign, otherSign);
    const key = `${who}|${sign}|${otherSign}|${rel}`;
    if (flagged.has(key)) return;
    flagged.add(key);
    animals.push({
      tone: sign===otherSign || rel==="friend" ? "friend" : rel==="enemy" ? "enemy" : "neutral",
      text: `${who} (${sign}) ${sign===otherSign ? "matches" : rel === "friend" ? "is friends with" : rel==="enemy" ? "is enemies with" : "is neutral with"} ${other} (${otherSign})`,
    });
  };
  const dated = entities.filter((e) => e.yearSign);
  for (const e of dated) {
    const sign = e.yearSign!;
    const who = e.kind === "team" ? e.name : `${e.name}${e.role ? ` (${e.role})` : ""}`;
    flag(who, sign, `the ${v.yearSign} year`, v.yearSign);
    flag(who, sign, `the ${v.monthSign} month`, v.monthSign);
    if(e.date){
      flag(`${who} birth/founding month`,chineseMonthSign(e.date[1],e.date[2]),`the ${v.yearSign} year`,v.yearSign);
      flag(`${who} birth/founding month`,chineseMonthSign(e.date[1],e.date[2]),`the ${v.monthSign} month`,v.monthSign);
    }
  }
  for(const e of entities.filter(e=>!e.date))animals.push({tone:"info",text:`${e.name}${e.role ? ` (${e.role})` : ""}: birth/founding date unavailable; year, month and day relations cannot be verified.`});
  const homeSign = v.reads.home.sign;
  const awaySign = v.reads.away.sign;
  for (const e of dated.filter((x) => x.kind === "player")) {
    const opp = e.side === "home" ? awaySign : e.side === "away" ? homeSign : undefined;
    const oppName = e.side === "home" ? names.away : names.home;
    if (opp && e.yearSign) flag(`${e.name}${e.role ? ` (${e.role})` : ""}`, e.yearSign, oppName, opp);
  }
  if (!animals.length) {
    animals.push({
      tone: "neutral",
      text: `No friend or enemy animal flags against the ${v.yearSign} year or ${v.monthSign} month.`,
    });
  }

  const dayKeys = new Set<number>([ud.reduced, ud.compound, v.dayOfMonth.reduced, v.dayOfMonth.compound]);
  if (v.dayOfMonth.compound === 28) { dayKeys.add(8); dayKeys.add(1); }
  const jerseys: BriefLine[] = [];
  for (const e of entities.filter((x) => x.kind === "player" && x.jersey!=null && /^\d+$/.test(x.jersey))) {
    const j = Number(e.jersey);
    const hits: string[] = [];
    if (dayKeys.has(j)) hits.push(`matches a day key number (${[...dayKeys].join(", ")})`);
    if (e.lucky != null && j === e.lucky) hits.push(`matches Lucky Number ${e.lucky}`);
    if (e.lp && (j === e.lp.reduced || j === e.lp.compound)) hits.push(`matches Life Path ${fmt(e.lp)}`);
    jerseys.push({
      tone: hits.length ? "friend" : "neutral",
      text: hits.length
        ? `${e.name}${e.role ? ` (${e.role})` : ""} #${j} — ${hits.join("; ")}`
        : `${e.name}${e.role ? ` (${e.role})` : ""} #${j} — no resonance with the day, Lucky Number, or Life Path`,
    });
  }
  if (!jerseys.length) jerseys.push({ tone: "info", text: "No verified jersey data for this game. Posted starter / roster jerseys and shared-catalog edits are read automatically; unknown numbers are not guessed." });

  const starters = (["away", "home"] as const).map((side) =>
    entities.find((e) => e.kind === "player" && e.side === side && isKeyPlayer(e.role) && e.lp),
  );
  const [awayStar, homeStar] = starters;
  const duel: BriefLine[] = [];
  if (awayStar?.lp && homeStar?.lp) {
    const role = /pitcher/i.test(`${awayStar.role} ${homeStar.role}`) ? "Pitcher vs pitcher" : "Key player vs key player";
    duel.push({ tone: "info", text: `${role} on ${v.dayOfMonth.compound}/${ud.reduced}: ${awayStar.name} vs ${homeStar.name}` });
    for (const a of lpKeys(awayStar.lp)) {
      for (const b of lpKeys(homeStar.lp)) {
        const hit = chartWord(a, b);
        duel.push({ tone: toneOf(hit.word), text: `Life Path ${awayStar.name} ${a} vs ${homeStar.name} ${b} — ${hit.word} (${hit.note})` });
      }
    }
    for (const star of [awayStar, homeStar]) {
      if (!star.pd) continue;
      const hit = chartWord(star.pd.reduced, ud.reduced);
      duel.push({
        tone: toneOf(hit.word),
        text: `${star.name} Personal Day ${fmt(star.pd)} vs Universal Day ${fmt(ud)} — ${hit.word} (${hit.note})`,
      });
    }
    if (awayStar.yearSign && homeStar.yearSign) {
      const rel = signRelation(awayStar.yearSign, homeStar.yearSign);
      duel.push({
        tone: rel === "neutral" ? "neutral" : rel === "friend" ? "friend" : "enemy",
        text: `Animals: ${awayStar.name} ${awayStar.yearSign} vs ${homeStar.name} ${homeStar.yearSign} — ${rel}`,
      });
    }
  } else {
    duel.push({ tone: "info", text: `Key-player comparison: ${awayStar ? awayStar.name : `${names.away} — verified starter or birth date unavailable`} vs ${homeStar ? homeStar.name : `${names.home} — verified starter or birth date unavailable`}. Posted starters and shared catalog dates are connected automatically.` });
  }

  const masters: BriefLine[] = [];
  const seenMaster = new Set<string>();
  const markMaster = (label: string, n?: number) => {
    if (n == null || !MASTERS.has(n)) return;
    const key = `${label}|${n}`;
    if (seenMaster.has(key)) return;
    seenMaster.add(key);
    masters.push({ tone: "master", text: `${label} is ${n} — master number, elevated` });
  };
  markMaster(`Universal Day ${fmt(ud)}`, ud.reduced);
  markMaster(`Universal Day compound ${ud.compound}`, ud.compound);
  markMaster(`Calendar day ${v.dayOfMonth.compound}`, v.dayOfMonth.reduced);
  markMaster(`Calendar day ${v.dayOfMonth.compound}`, v.dayOfMonth.compound);
  for (const e of entities) {
    markMaster(`${e.name} Life Path`, e.lp?.reduced);
    markMaster(`${e.name} Life Path compound`, e.lp?.compound);
    markMaster(`${e.name} Personal Day`, e.pd?.reduced);
    markMaster(`${e.name} Personal Day compound`, e.pd?.compound);
    markMaster(`${e.name} Lucky Number`, e.lucky);
    if (e.jersey) markMaster(`${e.name} jersey`, Number(e.jersey));
  }
  for(const e of entities)for(const [label,number] of [["Personal Year",e.py],["Personal Month",e.pm],["Personal Week",e.pw]] as const) {
    markMaster(`${e.name}${e.role ? ` (${e.role})` : ""} ${label}`,number?.reduced);
    if(number?.compound!==number?.reduced)markMaster(`${e.name} ${label} compound`,number?.compound);
  }
  for(const e of entities)e.ph?.forEach((hour,index)=>markMaster(`${e.name} ${["start","mid-game","closing"][index]} Personal Hour`,hour));
  if (!masters.length) masters.push({ tone: "neutral", text: "No 11, 22, or 33 elevation in the verified entity dates." });

  const extreme: BriefLine[] = [];
  const eventNums = [ud.compound, ud.reduced, v.dayOfMonth.compound, v.dayOfMonth.reduced];
  const eventNote = eventNums.filter((n) => SPECIAL_NUMBERS[n]).map((n) => SPECIAL_NUMBERS[n]);
  const dayIsMaster = eventNums.some((n) => MASTERS.has(n));

  return {
    doing,
    sections: finish(v, entities, names, chart, stackFor, animals, jerseys, duel, masters, extreme, dayIsMaster, eventNote),
    upgrades: accuracyUpgrades(v,entities),
  };
}

function accuracyUpgrades(v: VoteResult, entities: BriefEntity[]): BriefSection[] {
  const f = v.flags;
  const ud=v.universalDay;
  const color: BriefLine[] = [
    { tone: "info", text: `Color score home ${f.colorHome} / away ${f.colorAway} (max 2 each). Official team brand metadata and shared catalog colors use the selected mode's color-energy rules. The actual scored matches and conflicts are listed below; colors remain a secondary layer.` },
    ...v.votes.filter((x) => x.layer === "Colors").map((x) => ({
      tone: "info" as Tone,
      text: `${x.side === "home" ? "Home" : "Away"} +${x.weight} — ${x.reason}`,
    })),
  ];
  if (v.votes.every((x) => x.layer !== "Colors")) color.push({ tone: "neutral", text: "No color points landed." });
  if (f.volatility) color.push({ tone: "enemy", text: f.volatility });

  const userTone: Tone = /Fatal|Challenging/.test(f.userChart) ? "enemy" : /Beneficial|Soulmate|Lovers/.test(f.userChart) ? "friend" : "neutral";
  const toneOfStadium = (t: string): Tone => /Fatal|Challenging/.test(t) ? "enemy" : /Beneficial|Soulmate|Lovers/.test(t) ? "friend" : "neutral";

  return [
    { n: 1, title: "Colorology", lines: color },
    { n: 4, title: "Hour cycle", lines: [{ tone: "info", text: f.hour }, ...v.decision.volatility.filter(t => /flip|9-cycle|under|eclipse/i.test(t)).map(t => ({ tone: "enemy" as Tone, text: t }))] },
    { n: 5, title: "Master multiplier", lines: f.masters.length ? f.masters.map((t) => ({ tone: "master" as Tone, text: t })) : [{ tone: "neutral", text: f.equalMasters ? "Both sides hold a master number, so neither side gets the boost." : "No master multiplier. Neither side uniquely holds 11, 22, or 33." }] },
    { n: 6, title: "Record vibration", lines: [
      ...entities.filter(e=>e.kind==="team").flatMap(e=>recordVibrations(e.recordStats || {}).map(row=>{
        const relation=chartWord(row.root,ud.reduced);
        return {tone:toneOf(relation.word),text:`${e.name} ${row.label}: ${row.value}${row.root!==row.value ? ` → ${row.root}` : ""}; ${relation.word} with Universal Day ${fmt(ud)}.`};
      })),
      ...f.record9.map(text=>({tone:"enemy" as Tone,text})),
    ] },
    { n: 7, title: "Stadium founding vs each team", lines: f.stadium.length ? f.stadium.map((t) => ({ tone: toneOfStadium(t), text: t })) : [{ tone: "info", text: "Stadium opening date is not on file." }] },
    { n: 8, title: "Game window", lines: [
      { tone: "info", text: v.decision.lunar },
      { tone: "info", text: v.decision.powerColor },
      ...(v.decision.manifestation ? [{ tone: "master" as Tone, text: v.decision.manifestation }] : []),
      ...(v.decision.eclipse ? [{ tone: "enemy" as Tone, text: v.decision.eclipse }] : []),
    ] },
  ];
}

function finish(
  v: VoteResult,
  entities: BriefEntity[],
  names: { home: string; away: string; month: number },
  chart: BriefLine[],
  stackFor: (side: "home" | "away") => BriefLine[],
  animals: BriefLine[],
  jerseys: BriefLine[],
  duel: BriefLine[],
  masters: BriefLine[],
  _extreme: BriefLine[],
  dayIsMaster: boolean,
  eventNote: string[],
): BriefSection[] {
  const extreme: BriefLine[] = [];
  for (const e of entities) {
    if (!e.date || e.kind === "city" || e.kind === "stadium") continue;
    const [, m, d] = e.date;
    if (m !== names.month || d !== v.dayOfMonth.compound) continue;
    const whoMaster = MASTERS.has(e.lp?.reduced ?? -1) || MASTERS.has(e.lp?.compound ?? -1);
    const combined = whoMaster || dayIsMaster || eventNote.length > 0;
    const why = [
      whoMaster ? `Life Path ${e.lp ? fmt(e.lp) : ""} is a master` : "",
      dayIsMaster ? "the game date carries a master number" : "",
      eventNote[0] ?? "",
    ].filter(Boolean).join("; ");
    extreme.push({
      tone: combined ? "master" : "friend",
      text: combined
        ? `EXTREME — ${e.name} birthday falls on the game date (${monthName(m)} ${d}) and ${why}`
        : `${e.name} birthday falls on the game date (${monthName(m)} ${d}), but no master or event number is attached`,
    });
  }
  if (!extreme.length) {
    extreme.push({
      tone: "neutral",
      text: `No exact birthday / founding-day resonance among verified entries.${entities.some(e=>!e.date) ? " Some entity dates are unavailable, so a complete absence of resonance cannot be confirmed." : ""}`,
    });
  }

  const city = entities.find((e) => e.kind === "city");
  const stadium = entities.find((e) => e.kind === "stadium");
  const cityMd = mdLabel(city?.date);
  const stadMd = mdLabel(stadium?.date);
  const venue: BriefLine[] = [];
  for (const side of ["away", "home"] as const) {
    const team = entities.find((e) => e.kind === "team" && e.side === side);
    const who = side === "home" ? names.home : names.away;
    if (!team?.matrix) {
      venue.push({ tone: "info", text: `${who}: founding date missing, so city and stadium stay Unchecked.` });
      continue;
    }
    const cityHit = venueBucket(team.matrix, cityMd);
    const stadHit = venueBucket(team.matrix, stadMd);
    const line = (place: string, label: string | undefined, hit: string) =>
      label
        ? `${place} (${label}) is ${hit} for ${who}`
        : `${place} date is not on file — Neutral for ${who} (unchecked)`;
    venue.push({ tone: toneOf(cityHit === "Unknown" ? "Neutral" : cityHit), text: line(city?.name ?? "City", cityMd, cityHit === "Unknown" ? "Neutral" : cityHit) });
    venue.push({ tone: toneOf(stadHit === "Unknown" ? "Neutral" : stadHit), text: line(stadium?.name ?? "Stadium", stadMd, stadHit === "Unknown" ? "Neutral" : stadHit) });
  }

  return [
    { n: 1, title: "Number compatibility chart", lines: chart },
    { n: 2, title: "Stacking breakdown", lines: [...stackFor("away"), ...stackFor("home")] },
    { n: 3, title: "Chinese animal friend / enemy", lines: animals },
    { n: 4, title: "Jersey number resonance", lines: jerseys },
    { n: 5, title: "Pitcher vs pitcher (or key player)", lines: duel },
    { n: 6, title: "Master number highlights", lines: masters },
    { n: 7, title: "Extreme resonance", lines: extreme },
    { n: 8, title: "Venue and city for each side", lines: venue },
  ];
}
