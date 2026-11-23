// Story Reading: the "read every layer, listen for the story" method from the
// user's reading-method document, plus the sports rules from the CUE notes
// (betting number meanings, Personal Day before Month/Year, 9 = endings,
// championship warnings, Fatal stronger than Challenging).
// It never shows a percentage and never prints a score: it answers the seven
// questions in order, resolves conflicts, and names the side whose story is
// clearer. Internally it still has to compare, so each layer only records which
// side it speaks for and whether it contradicts that side.
import { numberRelation, signRelation, signBond, chineseSign, colorVsEnergy, reduceNum, fmt, type Num, type Sign } from "./vote-decode";

export type StorySide = "home" | "away";
export type Relation = (a: number, b: number) => "worst" | "enemy" | "soulmate" | "friend" | "same" | "neutral";

export interface StoryEntityInput {
  side: StorySide | "venue";
  kind: "team" | "player" | "city" | "stadium";
  name: string;
  role?: string;
  date?: readonly [number, number, number];
  record?: string;
  streak?: string;
  colors?: string[];
  jersey?: string;
  read: {
    lp: Num; py: Num; pm: Num; pd: Num; pw: Num;
    ph: readonly [number, number, number]; hourKnown: boolean;
    lucky: number; today: string[];
  } | null;
}
export interface StoryGameInput {
  away: string; home: string; dateLabel: string; league: string; eventName?: string;
  year: number; month: number; day: number;
  dayLp: Num; secondary: Num; doyRoot: number; woyRoot: number;
  moonPhase: string; yearSign: Sign; monthSign: Sign;
  entities: StoryEntityInput[];
  relation?: Relation;
}
export interface StoryLayer { title: string; lines: string[] }
export interface StoryQuestion { n: number; question: string; answer: string; lean: StorySide | null }
export interface StoryReading {
  game: string;
  selected: StorySide;
  selectedName: string;
  summary: string;
  convergence: string[];
  conflict: string;
  confidence: "High" | "Medium-High" | "Medium";
  confidenceWhy: string;
  selective: string | null;
  questions: StoryQuestion[];
  layers: StoryLayer[];
  text: string;
}

// ── Number language ─────────────────────────────────────────────────────────
const DAY_THEME: Record<number, string> = {
  1: "a leader's day: new beginnings and strong individual performances",
  2: "a patient, balancing day where partnerships matter",
  3: "a creative, social, unpredictable day: volatile games and upsets are possible",
  4: "a structure-and-grind day: defensive, low-scoring, grind-it-out games",
  5: "a change-and-chaos day: high variance, spreads and totals can swing",
  6: "a harmony day: team chemistry and cohesive units win",
  7: "an analytical, loner day that suits underdogs and strategic wins",
  8: "a power-and-authority day: money, karma and big results",
  9: "an endings-and-completion day: streaks end and closers finish strong",
  11: "a high-voltage, intuitive day where pressure is everything",
  22: "a master-builder day: scale and execution, building or destroying",
  33: "an elite master day for the runners of the world",
};
const CHARACTER: Record<number, string> = {
  1: "a leader's franchise built to go first",
  2: "a patient, partnership-driven franchise",
  3: "an expressive, streaky franchise",
  4: "a franchise of structure and grind",
  5: "a franchise of permanent change and unpredictability",
  6: "a chemistry-first franchise that plays for each other",
  7: "an analytical, independent franchise that likes being doubted",
  8: "a franchise with permanent power and authority",
  9: "a franchise built to finish and close chapters",
  11: "a franchise with permanent master-number intensity, high voltage",
  22: "a master-builder franchise, made for scale",
  33: "an elite master-number franchise",
};
const MOOD: Record<number, string> = {
  1: "steps out front and wants to lead",
  2: "waits, reacts and needs a partner to click",
  3: "plays loose and expressive, but streaky",
  4: "grinds, disciplined, in a low-margin game",
  5: "is restless and unpredictable",
  6: "is connected and plays for each other",
  7: "goes inward and calculates, and can go quiet",
  8: "is powerful and wants to impose itself",
  9: "is closing a chapter: it finishes something or gets finished",
  11: "is high-voltage and intuitive, and lives on pressure",
  22: "is built to execute at scale",
  33: "is elite and carries the room",
};
const YEAR_THEME: Record<number, string> = {
  1: "a beginnings season", 2: "a patience season", 3: "a communication and visibility season", 4: "a foundations season",
  5: "a change season", 6: "a responsibility and family season", 7: "a knowledge season, depth over speed",
  8: "a money-and-power season", 9: "a completion season", 11: "a heightened-awareness season",
  22: "a master-building season", 28: "a wealth-and-strategy season", 33: "an influence season",
};
const CHAPTER: Record<number, string> = {
  1: "starting", 2: "waiting", 3: "expressing", 4: "building", 5: "shifting", 6: "bonding", 7: "studying",
  8: "taking control", 9: "closing out", 11: "feeling everything", 22: "building big", 33: "leading",
};
const STRONG_CLOSE = new Set([1, 8, 9, 11]);
const MASTER = new Set([11, 22, 33]);
const say = (map: Record<number, string>, n: number) => map[n] ?? map[reduceNum(n)] ?? `a ${n} energy`;

const isKey = (role?: string) => /pitcher|quarterback|^qb$|goalie|fighter|^player$|goalkeeper|keeper|star/i.test(role ?? "");
const isCoach = (role?: string) => /coach|manager/i.test(role ?? "");
const isOwner = (role?: string) => /owner/i.test(role ?? "");

// ── Special dates ───────────────────────────────────────────────────────────
type DateTone = "Soulmate" | "Beneficial" | "Lovers & Friends" | "Challenging" | "Fatal Attraction" | "None";
export function specialDate(today: string[] | undefined): DateTone {
  const t = (today ?? []).join(" | ");
  if (/Fatal/.test(t)) return "Fatal Attraction";
  if (/Soulmate/.test(t)) return "Soulmate";
  if (/Beneficial/.test(t)) return "Beneficial";
  if (/Lovers/.test(t)) return "Lovers & Friends";
  if (/Challenging/.test(t)) return "Challenging";
  return "None";
}
/** Doc: Beneficial/Soulmate actively help; Lovers supports; Challenging creates friction; Fatal is the stronger caution. */
export function dateQuality(tone: DateTone): number {
  return tone === "Soulmate" || tone === "Beneficial" ? 2 : tone === "Lovers & Friends" ? 1 : tone === "Challenging" ? -1 : tone === "Fatal Attraction" ? -1.5 : 0;
}
const DATE_WORDS: Record<DateTone, string> = {
  Soulmate: "a Soulmate date: the day feels fated and emotionally charged in its favor",
  Beneficial: "a Beneficial date: the day is actively helping",
  "Lovers & Friends": "a Lovers & Friends date: supportive and flowing",
  Challenging: "a Challenging / Rival date: the day is creating friction",
  "Fatal Attraction": "a Fatal Attraction date: high intensity, unstable, risky",
  None: "no special date today",
};

// ── Hour story ──────────────────────────────────────────────────────────────
export function hourStory(ph: readonly [number, number, number], dayLp: number, relation: Relation = numberRelation) {
  const [s, m, c] = ph;
  const strong = (n: number) => STRONG_CLOSE.has(n);
  const rel = relation(c, dayLp);
  const conflicted = rel === "enemy" || rel === "worst";
  const closing: "strong" | "weak" | "conflicted" = conflicted ? "conflicted" : strong(c) ? "strong" : "weak";
  let arc: string;
  if (strong(s) && !strong(c)) arc = "starts strong and fades";
  else if (!strong(s) && strong(c)) arc = "starts slow and finishes with power";
  else if (strong(s) && strong(c)) arc = "carries power from the first snap to the final whistle";
  else if (s === m && m === c) arc = "stays on one steady note all game";
  else arc = new Set([s, m, c]).size === 3 && !strong(m) ? "moves erratically with no power phase" : "never finds a power phase";
  const text = `${s} → ${m} → ${c}: ${arc}${closing === "strong" ? `; closing ${c} is a finisher's hour` : closing === "conflicted" ? `; closing ${c} fights the day's ${dayLp}` : `; closing ${c} is not a finishing hour`}.`;
  return { closing, arc, text };
}

// ── Records ─────────────────────────────────────────────────────────────────
export function parseRecord(rec?: string): { w: number; l: number; t: number; pct: number; vib: number } | null {
  const m = rec?.match(/(\d+)-(\d+)(?:-(\d+))?/);
  if (!m) return null;
  const w = +m[1], l = +m[2], t = m[3] ? +m[3] : 0;
  const games = w + l + t;
  return { w, l, t, pct: games ? (w + t / 2) / games : 0.5, vib: reduceNum(w + l + t) };
}
export function parseStreak(s?: string): { kind: "W" | "L"; n: number } | null {
  const m = s?.trim().match(/^([WL])\s*(\d+)$/i);
  return m ? { kind: m[1].toUpperCase() as "W" | "L", n: +m[2] } : null;
}

// ── Engine ──────────────────────────────────────────────────────────────────
interface SideRead {
  name: string;
  team?: StoryEntityInput;
  key?: StoryEntityInput;
  coach?: StoryEntityInput;
  owner?: StoryEntityInput;
  people: StoryEntityInput[];
  supports: string[];
  contradictions: string[];
  serious: string[];
  intensity: number;
}

export function buildStoryReading(g: StoryGameInput): StoryReading {
  const relation = g.relation ?? numberRelation;
  const day = g.dayLp.reduced;
  const name = (s: StorySide) => (s === "home" ? g.home : g.away);
  const other = (s: StorySide): StorySide => (s === "home" ? "away" : "home");
  const friendly = (a: number) => { const r = relation(a, day); return r === "friend" || r === "soulmate" || r === "same"; };
  const hostile = (a: number) => { const r = relation(a, day); return r === "enemy" || r === "worst"; };

  const side = (s: StorySide): SideRead => {
    const people = g.entities.filter((e) => e.side === s && e.kind === "player");
    const team = g.entities.find((e) => e.side === s && e.kind === "team") ?? people.find((p) => /fighter/i.test(p.role ?? ""));
    return {
      name: name(s),
      team,
      key: people.find((p) => p !== team && isKey(p.role) && p.read),
      coach: people.find((p) => isCoach(p.role) && p.read),
      owner: people.find((p) => isOwner(p.role) && p.read),
      people,
      supports: [], contradictions: [], serious: [], intensity: 0,
    };
  };
  const S: Record<StorySide, SideRead> = { away: side("away"), home: side("home") };
  const city = g.entities.find((e) => e.kind === "city");
  const stadium = g.entities.find((e) => e.kind === "stadium");
  const layers: StoryLayer[] = [];

  // Section 2 — the day itself.
  const eights = [g.dayLp.reduced, g.dayLp.compound, g.secondary.reduced, g.doyRoot, g.woyRoot].filter((n) => n === 8).length;
  const dayMasters = [g.dayLp.reduced, g.dayLp.compound, g.secondary.compound, g.doyRoot, g.woyRoot].filter((n) => MASTER.has(n)).length;
  const highStakes = eights >= 2 || dayMasters >= 1;
  const uy = reduceNum([...String(g.year)].reduce((a, c) => a + +c, 0));
  const um = reduceNum(uy + g.month);
  const waning = /waning|last quarter/i.test(g.moonPhase);
  const waxing = /waxing|first quarter/i.test(g.moonPhase);
  const animals = signRelation(g.yearSign, g.monthSign);
  const dayLine = `${fmt(g.dayLp)} day: ${say(DAY_THEME, day)}.`;
  layers.push({ title: "The day itself", lines: [
    `Lifepath of the day ${dayLine}`,
    `Secondary energy ${fmt(g.secondary)}: the undercurrent is ${say(MOOD, g.secondary.reduced).replace(/^is /, "")}.`,
    `Day of year root ${g.doyRoot}, week of year root ${g.woyRoot}. Universal Year ${uy}, Universal Month ${um}.${highStakes ? " Stacked 8s / master numbers at the game level raise the stakes of every game today." : ""}`,
    `Moon: ${g.moonPhase}. ${waning ? "A waning moon backs teams closing something out or playing with urgency." : waxing ? "A waxing moon backs teams that are building." : "Full/new moon: peak or reset energy; secondary."}`,
    `Chinese ${g.yearSign} year and ${g.monthSign} month are ${signBond(g.yearSign, g.monthSign) ?? (animals === "friend" ? "in harmony" : animals === "enemy" ? "in conflict" : "neutral to each other")} (supporting evidence only).`,
  ] });

  // Section 3 + 4 — each side's full stack.
  const hours: Record<StorySide, ReturnType<typeof hourStory> | null> = { away: null, home: null };
  const dates: Record<StorySide, number> = { away: 0, home: 0 };
  const closes: Record<StorySide, number> = { away: 0, home: 0 };
  const align: Record<StorySide, number> = { away: 0, home: 0 };
  const champ = /super bowl/i.test(g.eventName ?? "") ? "superbowl" : /nba finals|\bfinals\b/i.test(g.eventName ?? "") && /NBA/i.test(g.league) ? "nbafinals" : null;

  for (const s of ["away", "home"] as const) {
    const x = S[s];
    const t = x.team?.read;
    const lines: string[] = [];
    if (t) {
      lines.push(`Character: ${x.name} is ${say(CHARACTER, t.lp.reduced)} (founding Lifepath ${fmt(t.lp)}).`);
      lines.push(`Costume right now: Personal Year ${fmt(t.py)} is ${say(YEAR_THEME, t.py.compound in YEAR_THEME ? t.py.compound : t.py.reduced)}; Personal Month ${fmt(t.pm)} is a chapter of ${say(CHAPTER, t.pm.reduced)}; Personal Week ${fmt(t.pw)} adds flavor.`);
      lines.push(`Personal Day ${fmt(t.pd)} (read ahead of Month and Year): tonight this team ${say(MOOD, t.pd.reduced)}${friendly(t.pd.reduced) ? `, in step with the ${day} day` : hostile(t.pd.reduced) ? `, at odds with the ${day} day` : ""}.`);
      if (friendly(t.pd.reduced)) x.supports.push(`${x.name} Personal Day ${fmt(t.pd)} is friendly with the ${day} day`);
      if (hostile(t.pd.reduced)) x.contradictions.push(`${x.name} Personal Day ${fmt(t.pd)} clashes with the ${day} day`);
      if (t.hourKnown) {
        const h = hourStory(t.ph, day, relation);
        hours[s] = h;
        lines.push(`Hour story: ${h.text}`);
        closes[s] += h.closing === "strong" ? 1 : h.closing === "conflicted" ? -1 : 0;
      } else lines.push("Hour story: venue time not verified, so the hour progression cannot be read.");
      const tone = specialDate(t.today);
      dates[s] += dateQuality(tone);
      lines.push(`Special date: ${DATE_WORDS[tone]}.`);
      if (tone === "Fatal Attraction") x.contradictions.push(`${x.name} is on a Fatal Attraction date`);
      if (tone === "Challenging") x.contradictions.push(`${x.name} is on a Challenging date`);
      const texture: string[] = [];
      const lucky = t.lucky;
      if (lucky === g.day || reduceNum(lucky) === day) texture.push(`Lucky Number ${lucky} echoes the date`);
      const col = (x.team?.colors ?? []).filter((c) => colorVsEnergy(c, day) === "friend");
      if (col.length) texture.push(`${col.join(", ")} resonate with the ${day} day`);
      lines.push(`Texture: ${texture.length ? texture.join("; ") : "colors, logo code and Lucky Number stay quiet today"}.`);
      if (MASTER.has(t.lp.compound) || MASTER.has(t.lp.reduced)) x.intensity++;
      if ([t.pd.reduced, t.ph[2]].some((n) => MASTER.has(n) || n === 8 || n === 9)) x.intensity++;
    } else lines.push(`${x.name}: founding date not on file, so the team's own stack cannot be read.`);
    const rec = parseRecord(x.team?.record);
    lines.push(rec ? `Reputation: ${x.team?.record} (record vibration ${rec.vib}).` : "Reputation: record not available.");
    const streak = parseStreak(x.team?.streak);
    if (streak?.n === 9) {
      if (streak.kind === "W") { x.contradictions.push(`${x.name} carries a 9-game win streak, and 9 is ending energy`); lines.push("Streak: a 9-game win streak — 9 is endings; streaks often stop at 9."); }
      else { x.supports.push(`${x.name}'s 9-game losing streak is in ending energy`); lines.push("Streak: a 9-game losing streak — 9 is endings, so the skid is ready to end."); }
    }
    layers.push({ title: `${x.name} — full stack`, lines });

    // Key player, coach, owner.
    const pl: string[] = [];
    for (const [label, p, w] of [["Key player", x.key, 1], ["Coach", x.coach, 0.75], ["Owner", x.owner, 0.25]] as const) {
      if (!p?.read) continue;
      const r = p.read;
      const tone = specialDate(r.today);
      const h = r.hourKnown ? hourStory(r.ph, day, relation) : null;
      pl.push(`${label} ${p.name}${p.role ? ` (${p.role})` : ""}: Personal Day ${fmt(r.pd)}, ${say(MOOD, r.pd.reduced).replace(/^is /, "")}${h ? `; hours ${h.text}` : ""} ${tone !== "None" ? `On ${DATE_WORDS[tone]}.` : ""}`.trim());
      dates[s] += 0.5 * w * dateQuality(tone);
      if (h) closes[s] += 0.5 * w * (h.closing === "strong" ? 1 : h.closing === "conflicted" ? -1 : 0);
      if (friendly(r.pd.reduced)) align[s] += w;
      if (hostile(r.pd.reduced)) { align[s] -= w; if (label !== "Owner") x.contradictions.push(`${label.toLowerCase()} ${p.name} is on a ${fmt(r.pd)} day that fights the ${day} day`); }
      if (tone === "Fatal Attraction" && label !== "Owner") x.serious.push(`${label.toLowerCase()} ${p.name} is on a Fatal Attraction date`);
      if (tone === "Challenging" && label !== "Owner") x.contradictions.push(`${label.toLowerCase()} ${p.name} is on a Challenging date`);
      if (MASTER.has(r.pd.reduced) || r.pd.reduced === 8) x.intensity += 0.5;
      // Championship rules from the notes.
      if (champ === "superbowl" && /quarterback|^qb$/i.test(p.role ?? "")) {
        const birthSign = p.date ? chineseSign(p.date[0]) : null;
        if (r.lp.reduced === 9 || day === 9) x.serious.push(`quarterback ${p.name} faces the Super Bowl rule: no 9 Life Path QB or 9-day QB wins it`);
        if (birthSign && ["Cat", "Goat", "Tiger"].includes(birthSign)) x.serious.push(`quarterback ${p.name} was born in a ${birthSign} year, which the Super Bowl rule fades`);
      }
      if (champ === "nbafinals" && label === "Key player" && r.lp.reduced === 9) x.serious.push(`${p.name} is a 9 Life Path star, and the notes say a 9 Life Path NBA star does not win it all`);
    }
    if (!pl.length) pl.push("No verified key player, coach or owner birth dates for this side.");
    layers.push({ title: `${x.name} — key players, coach, owner`, lines: pl });
  }

  // Sections 5 + 6 — city and stadium.
  let homeEnv = 0;
  const env: string[] = [];
  for (const [label, e] of [["City", city], ["Stadium", stadium]] as const) {
    if (!e?.read) { env.push(`${label}: ${e?.name ?? "not on file"} — founding/opening date not on file.`); continue; }
    const tone = specialDate(e.read.today);
    const q = dateQuality(tone);
    homeEnv += q > 0 ? 1 : q < 0 ? -1 : 0;
    const h = e.read.hourKnown ? hourStory(e.read.ph, day, relation) : null;
    if (label === "Stadium" && h?.closing === "strong") homeEnv += 0.5;
    env.push(`${label} ${e.name}: ${say(CHARACTER, e.read.lp.reduced).replace("franchise", "place")} (Lifepath ${fmt(e.read.lp)}); Personal Day ${fmt(e.read.pd)}${h ? `, hours ${h.text}` : "."} Today it is on ${DATE_WORDS[tone]}${q > 0 ? `, which quietly helps ${g.home}` : q < 0 ? `, which creates friction for ${g.home}` : ""}.`);
  }
  layers.push({ title: "City and stadium", lines: env });

  // Section 7 — the seven questions, in order.
  const lean = (a: number, b: number, gap = 0.5): StorySide | null => (a - b >= gap ? "home" : b - a >= gap ? "away" : null);
  const ra = parseRecord(S.away.team?.record), rh = parseRecord(S.home.team?.record);
  const recGap = ra && rh ? rh.pct - ra.pct : 0;
  const q1 = ra && rh ? (Math.abs(recGap) >= 0.15 ? (recGap > 0 ? "home" : "away") : Math.abs(recGap) >= 0.05 ? (recGap > 0 ? "home" : "away") : null) : null;
  const q1clear = Math.abs(recGap) >= 0.15;
  const q2 = lean(dates.home, dates.away, 0.5);
  const q3 = (hours.home || hours.away) ? lean(closes.home, closes.away, 0.5) : null;
  const q4: StorySide | null = homeEnv >= 1 ? "home" : homeEnv <= -1 ? "away" : null;
  const q5 = lean(align.home, align.away, 0.5);
  const cleanSide = (s: StorySide) => S[s].contradictions.length + S[s].serious.length <= 1;
  const q6raw = lean(S.home.intensity, S.away.intensity, 1);
  const q6 = q6raw && cleanSide(q6raw) ? q6raw : null;
  const chaos = q6raw && !cleanSide(q6raw) ? q6raw : null;

  const q: StoryQuestion[] = [
    { n: 1, question: "What is the record baseline?", lean: q1, answer: ra && rh ? (q1 ? `${q1clear ? "A clear" : "A slight"} gap: ${name(q1)} walks in with the better reputation (${S[q1].team?.record} vs ${S[other(q1)].team?.record}).` : `The records are close (${S.away.team?.record} vs ${S.home.team?.record}).`) : "Records are not available for both sides." },
    { n: 2, question: "Which team has the better Special Date quality today?", lean: q2, answer: q2 ? `${name(q2)} — its date stack (team plus key people) is cleaner today.` : "Neither side has a clearly better special date today." },
    { n: 3, question: "Which team has the stronger and cleaner closing hour?", lean: q3, answer: !hours.home && !hours.away ? "Hours cannot be read without a verified venue time." : q3 ? `${name(q3)} — ${hours[q3]?.arc ?? "its people carry the better finish"}.` : "The closing hours are evenly matched." },
    { n: 4, question: "Does the home environment support the home team or fight it?", lean: q4, answer: q4 === "home" ? `City and stadium support ${g.home}.` : q4 === "away" ? `City and stadium create friction for ${g.home}.` : "The city and stadium stay neutral." },
    { n: 5, question: "Do the key players and coach align with the team energy?", lean: q5, answer: q5 ? `${name(q5)}'s key people line up with the day; ${name(other(q5))}'s do not as cleanly.` : "Key people are equally aligned, or their dates are missing." },
    { n: 6, question: "Is there Master-number or stacked 8/9 event intensity on one side?", lean: q6, answer: q6 ? `${name(q6)} carries the event intensity on a clean stack — dangerous in a good way.` : chaos ? `${name(chaos)} carries the intensity, but on a conflicted stack — chaos risk, not an edge.` : "No one-sided event intensity." },
  ];
  const leans = q.map((x) => x.lean);
  const count = (s: StorySide) => leans.filter((l) => l === s).length;
  // Record is "important but never the final word": a clear record gap speaks
  // with two voices, a slight one with one.
  const voice = (s: StorySide) => count(s) + (q1 === s && q1clear ? 1 : 0) + S[s].supports.length * 0.5 - S[s].contradictions.length * 0.5 - S[s].serious.length;
  let selected: StorySide;
  const va = voice("away"), vh = voice("home");
  if (Math.abs(vh - va) >= 0.5) selected = vh > va ? "home" : "away";
  // Close stories: home field is a real advantage in close games.
  else selected = q1clear && q1 ? q1 : "home";
  // Better record vs better Special Date + Closing Hour: trust the stack.
  if (q2 && q2 === q3 && q1 && q1 !== q2) selected = q2;
  const margin = Math.abs(vh - va);
  q.push({ n: 7, question: "Listening to the whole sentence, which side speaks more clearly with fewer contradictions?", lean: selected, answer: `${name(selected)}: ${count(selected)} of the six questions speak for it, with ${S[selected].contradictions.length + S[selected].serious.length} contradiction${S[selected].contradictions.length + S[selected].serious.length === 1 ? "" : "s"} against ${S[other(selected)].contradictions.length + S[other(selected)].serious.length} on the other side.` });

  // Section 8 — conflicts.
  const sel = S[selected], opp = other(selected);
  const conflicts: string[] = [];
  if (q1 && q1 === opp && q2 === selected && q3 === selected) conflicts.push(`Better record vs better Special Date + Closing Hour: ${name(opp)} has the reputation, but ${sel.name} has the cleaner date and the stronger finish. When the energetic stack is clearly cleaner on the weaker-record side, trust the stack.`);
  else if (q1 && q1 === opp) conflicts.push(`Record vs stack: ${name(opp)} walks in with the better record, but the record is reputation, not the whole story; ${sel.name}'s layers speak more clearly today.`);
  if (sel.serious.length) {
    const strongRest = count(selected) >= 3;
    conflicts.push(`${sel.serious[0][0].toUpperCase()}${sel.serious[0].slice(1)}. ${strongRest ? "The rest of the stack is very strong, so this stays a soft warning." : "Other layers are also weak, so this is a serious risk."}`);
  }
  if (selected === "away" && q4 === "home") conflicts.push(`Home field vs superior away energy: the city and stadium help ${g.home}, but home field only decides close games — it does not override a multi-layer away stack.`);
  if (chaos) conflicts.push(`Master-number intensity on a conflicted side: ${name(chaos)} has the high intensity but too many contradictions, which reads as chaos risk rather than power.`);
  if (!conflicts.length) {
    const dissent = q.slice(0, 6).find((x) => x.lean === opp);
    conflicts.push(dissent ? `The main dissent is question ${dissent.n} (${dissent.question.replace(/\?$/, "")}): ${dissent.answer} It is one layer against a cleaner overall narrative.` : `No layer speaks for ${name(opp)}; the only noise is ${sel.contradictions[0] ?? "missing data"}.`);
  }

  const contra = sel.contradictions.length + sel.serious.length;
  const fatalSerious = sel.serious.length > 0 && count(selected) < 3;
  const confidence: StoryReading["confidence"] = count(selected) >= 4 && contra <= 1 && !fatalSerious ? "High" : (count(selected) >= 3 || margin >= 2) && !fatalSerious ? "Medium-High" : "Medium";
  const confidenceWhy = confidence === "High"
    ? `${count(selected)} of six questions point the same way and almost nothing contradicts ${sel.name}.`
    : confidence === "Medium-High"
      ? `The story leans clearly to ${sel.name}, but ${contra ? `${contra} layer${contra === 1 ? " still pushes" : "s still push"} back` : "not every layer has spoken"}.`
      : `The two stories are close${fatalSerious ? " and a serious warning sits on the chosen side" : ""}; ${sel.name} is only slightly clearer.`;
  const selective = margin < 1 ? "Bet selectively: this reads close to a neutral match, and the notes say to pass on neutral matches." : null;

  const convergence = [
    ...q.slice(0, 6).filter((x) => x.lean === selected).map((x) => x.answer),
    ...sel.supports,
  ].slice(0, 5);
  if (!convergence.length) convergence.push(`${sel.name} has fewer contradictions than ${name(opp)}.`);

  const hs = hours[selected];
  const dateTone = specialDate(sel.team?.read?.today);
  const summary = [
    `This is ${say(DAY_THEME, day)}${highStakes ? ", with stacked numbers raising the stakes" : ""}.`,
    sel.team?.read ? `${sel.name} is ${say(CHARACTER, sel.team.read.lp.reduced)}, and tonight it ${say(MOOD, sel.team.read.pd.reduced)}.` : "",
    S[opp].team?.read ? `${name(opp)} is ${say(CHARACTER, S[opp].team!.read!.lp.reduced)}, and tonight it ${say(MOOD, S[opp].team!.read!.pd.reduced)}.` : "",
    hs ? `${sel.name}'s hours ${hs.arc}.` : "",
    dateTone !== "None" ? `${sel.name} is on ${DATE_WORDS[dateTone]}.` : "",
    q4 ? (q4 === "home" ? `The room — city and stadium — leans toward ${g.home}.` : `The room is working against ${g.home}.`) : "",
    `Put together, ${sel.name}'s story is the more coherent one${q1 && q1 === opp ? ", even against the better record" : ""}.`,
  ].filter(Boolean).join(" ");

  const game = `${g.away} @ ${g.home} — ${g.dateLabel}`;
  const text = [
    `GAME: ${game}`, "", `SELECTED SIDE: ${sel.name}`, "", "FULL READING SUMMARY:", summary, "",
    "KEY CONVERGENCE POINTS:", ...convergence.map((c) => `- ${c}`), "",
    "CONFLICTING LAYER AND RESOLUTION:", conflicts.join(" "), "",
    `CONFIDENCE: ${confidence}`, confidenceWhy,
  ].join("\n");

  return { game, selected, selectedName: sel.name, summary, convergence, conflict: conflicts.join(" "), confidence, confidenceWhy, selective, questions: q, layers, text };
}
