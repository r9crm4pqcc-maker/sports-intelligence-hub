import { reduce, dayNumber, calcDateEnergy, calcPersonalDay, calcPersonalYear, digitSum } from "./numerology";
import { PROFILE } from "./profile";
import { chineseMonthSign, chineseSign, lifePath, numberRelation, secretRelation, signRelation, type Sign } from "./vote-decode";

// ── Color maps from the methodology ─────────────────────────────────────────
const ENERGY_COLORS: Record<string, { cleat: string[]; shin: string[]; sock: string[] }> = {
  "1":  { cleat: ["Gold","Yellow","Orange"], shin: ["Red","Orange"], sock: ["Black","Navy"] },
  "8":  { cleat: ["Gold","Yellow","Royal Blue"], shin: ["Black","Dark Blue"], sock: ["Black","Dark Green"] },
  "10": { cleat: ["Gold","Yellow","Orange","Royal Blue"], shin: ["Orange","Gold"], sock: ["Black","Dark Navy"] },
  "28": { cleat: ["Gold","Yellow","Royal Blue"], shin: ["Gold","Orange"], sock: ["Black","Dark Navy"] },
  "6":  { cleat: ["Green","Light Blue"], shin: ["Green","Teal"], sock: ["White","Light Blue"] },
  "42": { cleat: ["Green","Light Blue"], shin: ["Green","Teal"], sock: ["White","Silver"] },
  "7":  { cleat: ["Purple","Indigo"], shin: ["Purple","Violet"], sock: ["Dark Navy","Black"] },
  "16": { cleat: ["Purple","Indigo"], shin: ["Indigo","Dark Blue"], sock: ["Black","Dark Navy"] },
  "9":  { cleat: ["Red","Black"], shin: ["Red","Crimson"], sock: ["Black","Dark Red"] },
  "18": { cleat: ["Red","Black"], shin: ["Red","Black"], sock: ["Black","Charcoal"] },
  "11": { cleat: ["White","Silver"], shin: ["White","Silver"], sock: ["White","Light Grey"] },
  "22": { cleat: ["Iridescent","Gold"], shin: ["White","Gold"], sock: ["Silver","White"] },
  "2":  { cleat: ["Silver","Cream"], shin: ["Silver","Light Blue"], sock: ["White","Silver"] },
  "3":  { cleat: ["Yellow","Gold"], shin: ["Yellow","Orange"], sock: ["White","Gold"] },
  "4":  { cleat: ["Blue","Grey"], shin: ["Navy","Grey"], sock: ["Dark Blue","Black"] },
  "5":  { cleat: ["Turquoise","Light Blue"], shin: ["Turquoise","Cyan"], sock: ["White","Light Blue"] },
};

function getColorConfig(energy: number, compound: number) {
  const key = String(compound) in ENERGY_COLORS ? String(compound)
    : String(energy) in ENERGY_COLORS ? String(energy) : String(energy);
  return ENERGY_COLORS[key] ?? ENERGY_COLORS["1"];
}

const ZODIAC_SIGNS = [
  "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig",
];

const ZODIAC_COMPATIBILITY: Record<string, string[]> = {
  Rat: ["Ox", "Dragon", "Monkey"],
  Ox: ["Rat", "Snake", "Rooster"],
  Tiger: ["Horse", "Dog", "Pig"],
  Rabbit: ["Goat", "Dog", "Pig"],
  Dragon: ["Rat", "Monkey", "Rooster"],
  Snake: ["Ox", "Rooster", "Monkey"],
  Horse: ["Tiger", "Dog"],
  Goat: ["Rabbit", "Pig"],
  Monkey: ["Rat", "Dragon", "Snake"],
  Rooster: ["Ox", "Dragon", "Snake"],
  Dog: ["Tiger", "Rabbit", "Horse"],
  Pig: ["Tiger", "Rabbit", "Goat"],
};

function getChineseYearCompatibility(birthYear: number, gameYear: number) {
  const birthSign = ZODIAC_SIGNS[(birthYear - 4) % 12];
  const yearSign = ZODIAC_SIGNS[(gameYear - 4) % 12];
  const isSame = birthSign === yearSign;
  const compatible = ZODIAC_COMPATIBILITY[birthSign]?.includes(yearSign) ?? false;
  const score = isSame ? 95 : compatible ? 82 : 58;
  const label = isSame ? "Same Zodiac" : compatible ? "Compatible Zodiac" : "Challenging Zodiac";
  return { birthSign, yearSign, score, label };
}

// ─── ShemUniverse Number Compatibility Matrix ────────────────────────────────
// Keyed pairs: `${a}-${b}` = percentage 0-100. Neutral defaults to 60, enemy to 30.
type CompatEntry = { friendly?: Record<number, number>; neutral?: number[]; enemy?: number[] };
const COMPAT: Record<number, CompatEntry> = {
  1:  { friendly: { 11:93, 7:90, 28:80, 8:80, 2:80, 1:80 }, neutral: [3,4,5,6,22,33], enemy: [9] },
  2:  { friendly: { 8:85, 28:80, 1:80, 3:80 }, neutral: [4,5,6,7,11,22,33], enemy: [9] },
  3:  { friendly: { 5:91, 8:88, 6:80, 28:80, 11:80, 33:80, 3:80, 2:80 }, neutral: [1,7,9,22], enemy: [4] },
  4:  { friendly: { 6:96, 9:80, 8:80, 7:80, 4:80, 2:80 }, neutral: [1,11,22,28,33], enemy: [3,5] },
  5:  { friendly: { 3:91, 33:85, 5:85, 7:80, 9:80, 8:80 }, neutral: [1,2,11,28], enemy: [4,6,22] },
  6:  { friendly: { 4:96, 9:80, 8:80, 22:80, 3:80 }, neutral: [1,11,28,33], enemy: [5,7] },
  7:  { friendly: { 11:99, 28:93, 1:90, 5:80, 4:80, 22:80 }, neutral: [2,7,33], enemy: [6,8,9] },
  8:  { friendly: { 1:82, 2:82, 3:82, 4:82, 5:82, 6:82, 8:82, 22:82, 28:82, 33:82 }, neutral: [9,11], enemy: [7] },
  9:  { friendly: { 4:80, 5:80, 6:80 }, neutral: [3,8], enemy: [1,2,7,11,22,28,33] },
  11: { friendly: { 7:99, 1:93, 3:80 }, neutral: [2,4,5,6,8,22,28,33], enemy: [9] },
  22: { friendly: { 8:85, 6:80, 7:80 }, neutral: [1,2,3,4,11,22,28,33], enemy: [5,9] },
  28: { friendly: { 1:93, 8:86, 7:80, 28:80, 2:80, 3:80 }, neutral: [4,6,11,22,33,5], enemy: [9] },
  33: { friendly: { 8:90, 5:85, 3:80 }, neutral: [1,2,4,6,7,11,22,28,33], enemy: [9] },
};

export function compatPct(a: number, b: number): number {
  const lookup = (x: number, y: number): number | null => {
    const row = COMPAT[x]; if (!row) return null;
    if (row.friendly?.[y] != null) return row.friendly[y]!;
    if (row.neutral?.includes(y)) return 60;
    if (row.enemy?.includes(y)) return 25;
    return null;
  };
  const v1 = lookup(a, b); const v2 = lookup(b, a);
  if (v1 != null && v2 != null) return Math.round((v1 + v2) / 2);
  return v1 ?? v2 ?? 55;
}

export function compatLabel(pct: number): "FRIENDLY" | "NEUTRAL" | "ENEMY" {
  if (pct >= 75) return "FRIENDLY";
  if (pct >= 50) return "NEUTRAL";
  return "ENEMY";
}

// ─── User's actual season schedule ───────────────────────────────────────────
export interface SeasonGame {
  date: string; month: number; day: number; year: number;
  lp: number; secondary: number; compat: number;
  opponent: string; venue: string; time: string; home: boolean;
}
export const SEASON_SCHEDULE: SeasonGame[] = [
  { date:"8/25/26",  month:8,  day:25, year:2026, lp:7,  secondary:7,  compat:59, opponent:"Prosser",         venue:"Hanson Stadium", time:"4:30 PM", home:false },
  { date:"8/28/26",  month:8,  day:28, year:2026, lp:28, secondary:28, compat:79, opponent:"Steinmetz",       venue:"Home",           time:"4:30 PM", home:true  },
  { date:"9/1/26",   month:9,  day:1,  year:2026, lp:11, secondary:1,  compat:79, opponent:"Clemente",        venue:"Home",           time:"4:30 PM", home:true  },
  { date:"9/3/26",   month:9,  day:3,  year:2026, lp:22, secondary:3,  compat:69, opponent:"Farragut (NC)",   venue:"Away",           time:"4:30 PM", home:false },
  { date:"9/8/26",   month:9,  day:8,  year:2026, lp:9,  secondary:8,  compat:41, opponent:"Foreman",         venue:"Hanson Stadium", time:"4:30 PM", home:false },
  { date:"9/15/26",  month:9,  day:15, year:2026, lp:7,  secondary:6,  compat:66, opponent:"Kelvyn Park",     venue:"Home",           time:"4:30 PM", home:true  },
  { date:"9/17/26",  month:9,  day:17, year:2026, lp:9,  secondary:8,  compat:41, opponent:"Phase 4 vs TBD",  venue:"Home",           time:"4:30 PM", home:true  },
  { date:"9/22/26",  month:9,  day:22, year:2026, lp:5,  secondary:22, compat:62, opponent:"Phase 5 @ TBD",   venue:"Away",           time:"4:30 PM", home:false },
  { date:"9/29/26",  month:9,  day:29, year:2026, lp:3,  secondary:11, compat:47, opponent:"Phoenix Military",venue:"Away",           time:"5:00 PM", home:false },
  { date:"10/9/26",  month:10, day:9,  year:2026, lp:11, secondary:9,  compat:60, opponent:"Northside (NC)",  venue:"Away",           time:"4:30 PM", home:false },
];

export interface SoccerGameDay {
  gameDate: string;
  universalEnergy: number;
  universalCompound: number;
  universalLabel: string;
  personalDay: number;
  personalDayCompound: number;
  compatibility: number;
  compatLabel: string;
  compatDesc: string;
  cleatColors: string[];
  shinColors: string[];
  sockColors: string[];
  bestNumbers: number[];
  bestNumberReasons: string[];
  jerseyRecommendation: number;
  jerseyReason: string;
  sockType: "grip" | "regular";
  sockHeight: "low" | "mid" | "high" | "otk";
  jerseyTuck: "tucked" | "untucked";
  gearFormula: string;
  rankedNumbers: { number: number; score: number; label: string; reason: string }[];
  colorHarmonizedWith: number[];
}

const OX: Sign = "Ox";
const HOURS: { sign: Sign; span: string }[] = [
  { sign: "Rat", span: "11 PM–1 AM" },
  { sign: "Ox", span: "1–3 AM" },
  { sign: "Tiger", span: "3–5 AM" },
  { sign: "Cat", span: "5–7 AM" },
  { sign: "Dragon", span: "7–9 AM" },
  { sign: "Snake", span: "9–11 AM" },
  { sign: "Horse", span: "11 AM–1 PM" },
  { sign: "Goat", span: "1–3 PM" },
  { sign: "Monkey", span: "3–5 PM" },
  { sign: "Rooster", span: "5–7 PM" },
  { sign: "Dog", span: "7–9 PM" },
  { sign: "Pig", span: "9–11 PM" },
];
const NUM_COLOR: Record<number, string> = {
  1: "Gold", 2: "Orange", 3: "Yellow", 4: "Green", 5: "Blue",
  6: "Indigo", 7: "Purple", 8: "Black", 9: "White", 11: "White", 22: "Gold",
};
const POWER = ["Black", "White", "Green", "Orange"];
const STONE: Record<number, { stone: string; metal: string }> = {
  1: { stone: "Ruby", metal: "Copper" },
  2: { stone: "Pearl", metal: "Silver" },
  3: { stone: "Citrine", metal: "Copper" },
  4: { stone: "Emerald", metal: "Copper" },
  5: { stone: "Turquoise", metal: "Silver" },
  6: { stone: "Moonstone", metal: "Silver" },
  7: { stone: "Amethyst", metal: "Silver" },
  8: { stone: "Black onyx", metal: "Copper" },
  9: { stone: "None", metal: "Copper" },
  11: { stone: "Clear quartz", metal: "Silver" },
  22: { stone: "None", metal: "Copper" },
};
const MANTRA: Record<number, string> = {
  1: "I start it. I finish it.",
  2: "I wait, then I play the pass.",
  3: "One clean idea. Then I go.",
  4: "Simple. On time. Again.",
  5: "Change the angle. Don't freeze.",
  6: "Find the runner. Then arrive.",
  7: "See it once. Don't talk myself out of it.",
  8: "Take the space. Hit it.",
  9: "Last ball matters. Let the rest go.",
  11: "Quiet first. Then the strike.",
  22: "Build the chance. Then take it.",
};
const BRANDS = [
  { name: "Nike", y: 1964, m: 1, d: 25 },
  { name: "Adidas", y: 1949, m: 8, d: 18 },
  { name: "Jordan", y: 1984, m: 4, d: 1 },
  { name: "Under Armour", y: 1996, m: 9, d: 25 },
  { name: "Puma", y: 1948, m: 10, d: 1 },
  { name: "New Balance", y: 1906, m: 1, d: 1 },
];

function animalLine(a: Sign, b: Sign) {
  const rel = signRelation(a, b);
  const sec = secretRelation(a, b);
  if (rel === "friend") return "friend";
  if (rel === "enemy") return "enemy";
  if (sec === "secret-friend") return "secret friend";
  if (sec === "secret-enemy") return "secret enemy";
  if (a === b) return "same";
  return "neutral";
}

function yearSignFor(month: number, day: number, year: number): Sign {
  if (month < 2 || (month === 2 && day < 4)) return chineseSign(year - 1);
  return chineseSign(year);
}

export interface SoccerBrief {
  universal: number;
  universalCompound: number;
  personalDay: number;
  personalCompound: number;
  personalYear: number;
  lifePath: string;
  dayStatus: string;
  bestNumbers: { n: number; why: string }[];
  worstNumbers: { n: number; why: string }[];
  yearAnimal: string;
  yearFit: string;
  monthAnimal: string;
  monthFit: string;
  weekdayPlanet: string;
  hours: { span: string; sign: string; fit: string }[];
  bestHours: string;
  lowHours: string;
  primary: string;
  accent: string;
  avoidColors: string[];
  cleats: string;
  socks: string;
  shins: string;
  tape: string;
  pattern: string;
  face: string;
  sleep: string;
  planet: string;
  score: { tip: string; detail: string }[];
  aggression: string;
  think: string;
  aerial: string;
  brands: { name: string; fit: string; lp: string }[];
  avoidBrands: { name: string; fit: string; lp: string }[];
  stone: string;
  metal: string;
  pocket: string;
  protection: string;
  pressure: "High" | "Medium" | "Low";
  selfish: string;
  mantra: string;
}

export function soccerBrief(month: number, day: number, year: number): SoccerBrief {
  const de = calcDateEnergy(month, day, year);
  const pd = calcPersonalDay(PROFILE.birthMonth, PROFILE.birthDay, month, day, year);
  const py = calcPersonalYear(PROFILE.birthMonth, PROFILE.birthDay, month, day, year);
  const face = 1;
  const ud = de.reduced;
  const relUd = numberRelation(face, ud);
  const relPd = numberRelation(8, pd.reduced);
  const relDay = numberRelation(face, dayNumber(day));
  const status = (r: string) => r === "same" ? "same" : r === "friend" || r === "soulmate" ? "friend" : r === "enemy" || r === "worst" ? "enemy" : "neutral";
  const yearAnimal = yearSignFor(month, day, year);
  const monthAnimal = chineseMonthSign(month, day);
  const yFit = animalLine(OX, yearAnimal);
  const mFit = animalLine(OX, monthAnimal);
  const enemyYear = yFit === "enemy" || yFit === "secret enemy";
  const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const planet = planets[dow];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const best: { n: number; why: string }[] = [
    { n: 1, why: "Life Path 28/1" },
    { n: 8, why: "Birthday" },
    { n: 28, why: "Life Path compound" },
    { n: 10, why: "Jersey that carries the 1" },
  ];
  if (status(relUd) !== "enemy") best.push({ n: ud, why: "Universal day" });
  if (status(relPd) !== "enemy" && pd.reduced !== ud) best.push({ n: pd.reduced, why: "Personal day" });
  if (![1, 8, 9].includes(py.reduced)) best.push({ n: py.reduced, why: "Personal year" });
  best.push({ n: 99, why: "Lucky" }, { n: 98, why: "Lucky" });
  const seen = new Set<number>();
  const bestNumbers = best.filter((x) => (seen.has(x.n) ? false : (seen.add(x.n), true))).slice(0, 8);

  const worstPool = [9, 4, 6, 7].filter((n) => numberRelation(face, n) === "enemy" || numberRelation(face, n) === "worst" || numberRelation(8, n) === "enemy");
  if (status(relUd) === "enemy") worstPool.unshift(ud);
  if (status(relPd) === "enemy") worstPool.unshift(pd.reduced);
  const worstSeen = new Set<number>();
  const worstNumbers = worstPool.filter((n) => !seen.has(n) && (worstSeen.has(n) ? false : (worstSeen.add(n), true))).slice(0, 4).map((n) => ({ n, why: n === 9 ? "Enemy of the 1" : "Clashes with today" }));

  const hours = HOURS.map((h) => ({ span: h.span, sign: h.sign, fit: h.sign === "Snake" ? "birth hour" : h.sign === "Pig" ? "enemy hour" : animalLine(OX, h.sign) }));
  const bestHours = hours.filter((h) => h.fit === "friend" || h.fit === "secret friend" || h.fit === "birth hour" || h.fit === "same").map((h) => `${h.sign} ${h.span}`).join(" · ");
  const lowHours = hours.filter((h) => h.fit === "enemy" || h.fit === "secret enemy" || h.fit === "enemy hour").map((h) => `${h.sign} ${h.span}`).join(" · ");

  const primary = POWER.includes(NUM_COLOR[pd.reduced] ?? "") ? NUM_COLOR[pd.reduced] : "Black";
  const accent = pd.reduced === 8 ? "White" : pd.reduced === 1 || ud === 1 ? "Gold" : "Green";
  const avoidColor = NUM_COLOR[status(relUd) === "enemy" ? ud : 9] ?? "Indigo";
  const avoidColors = [avoidColor, "Navy"].filter((c) => !POWER.includes(c) && c !== primary && c !== accent);

  const score: { tip: string; detail: string }[] =
    planet === "Mars" ? [
      { tip: "Finish it", detail: "Tuesday is Mars. The shot is the play, not the extra pass." },
      { tip: "Win the duel", detail: "First into the tackle, then the strike." },
      { tip: "Near post", detail: "Attack the ball. Don't wait on it." },
    ] : planet === "Sun" ? [
      { tip: "Take the shot", detail: "Sunday is the Sun. If you're free, you shoot." },
      { tip: "Own the wing", detail: "Start the move yourself." },
      { tip: "First touch finish", detail: "Don't take a second look." },
    ] : planet === "Moon" ? [
      { tip: "Read it, then go", detail: "Monday is the Moon. One look at the keeper, then the pass or the shot." },
      { tip: "Don't force the first chance", detail: "The second ball is the one." },
      { tip: "Stay on your feet", detail: "Patience, then the cut." },
    ] : planet === "Mercury" ? [
      { tip: "First touch", detail: "Wednesday is Mercury. The touch is the goal." },
      { tip: "One-touch in the box", detail: "Don't take a touch you don't need." },
      { tip: "Switch the point", detail: "Change the side, then arrive." },
    ] : planet === "Jupiter" ? [
      { tip: "Attack the cross", detail: "Thursday is Jupiter. Go up for it." },
      { tip: "Far-post run", detail: "Arrive late, finish first time." },
      { tip: "Take the bigger chance", detail: "Don't settle for the safe square pass." },
    ] : planet === "Venus" ? [
      { tip: "Combination, then the shot", detail: "Friday is Venus. The one-two opens it." },
      { tip: "Don't shoot from a crowd", detail: "Wait until the lane is clean." },
      { tip: "Set piece", detail: "A placed ball beats a smashed one today." },
    ] : [
      { tip: "Hit it", detail: "Saturday is Saturn. Power and a clean strike." },
      { tip: "Hold the defender off", detail: "Use the body, then the shot." },
      { tip: "Don't rush the first minute", detail: "Saturn pays the player who stays on it." },
    ];

  const brands = BRANDS.map((b) => {
    const lp = lifePath(b.y, b.m, b.d);
    const rel = numberRelation(lp.reduced, ud);
    return { name: b.name, fit: status(rel), lp: `${lp.compound}/${lp.reduced}` };
  });

  const stone = STONE[pd.reduced] ?? STONE[reduce(pd.reduced)];
  const pressure: SoccerBrief["pressure"] = status(relUd) === "enemy" || status(relDay) === "enemy" ? "Low" : status(relUd) === "friend" ? "High" : "Medium";

  return {
    universal: ud,
    universalCompound: de.compound,
    personalDay: pd.reduced,
    personalCompound: pd.compound,
    personalYear: py.reduced,
    lifePath: "28/1",
    dayStatus: `Life Path 1 and universal ${ud} are ${status(relUd)}. Birthday 8 and personal day ${pd.reduced} are ${status(relPd)}. Life Path 1 and the ${day} is ${status(relDay)}.`,
    bestNumbers,
    worstNumbers,
    yearAnimal,
    yearFit: `${yearAnimal} year is ${yFit} for the Ox.`,
    monthAnimal,
    monthFit: `${monthAnimal} month is ${mFit} for the Ox.`,
    weekdayPlanet: `${dayNames[dow]} · ${planet}`,
    hours,
    bestHours,
    lowHours,
    primary,
    accent,
    avoidColors,
    cleats: `${primary} primary, ${accent} accent`,
    socks: pd.reduced <= 4 || pd.reduced === 8 ? "Grip, low, tucked" : "Grip, mid",
    shins: accent === "White" ? "White" : "Black",
    tape: [1, 4, 8].includes(pd.reduced) ? `Yes — ${primary}` : "No",
    pattern: [1, 4, 8].includes(pd.reduced) ? "Solid. Don't split the kit." : [3, 5].includes(pd.reduced) ? "A pattern is fine. Keep the enemy color out of it." : "Solid is safer.",
    face: "Face north before kickoff. That is the Ox direction.",
    sleep: "Sleep with your head north.",
    planet: `${dayNames[dow]} · ${planet}`,
    score,
    aggression: [1, 5, 8].includes(pd.reduced) || planet === "Mars" || planet === "Sun" ? "Aggressive. Take the duel." : "Patient. Pick the moment.",
    think: [4, 6, 7].includes(pd.reduced) ? "Overthinking flag. Decide and play." : "Instinct. First picture is the right one.",
    aerial: planet === "Jupiter" || [4, 8].includes(ud) ? "Yes. Attack the ball in the air." : "No. Stay on the ground and finish with the feet.",
    brands: brands.filter((b) => b.fit === "friend" || b.fit === "same"),
    avoidBrands: brands.filter((b) => b.fit === "enemy"),
    stone: stone.stone,
    metal: stone.metal,
    pocket: stone.stone === "None" ? "No stone today." : "Pocket-test it for 3 days before it goes on the hand.",
    protection: enemyYear ? `Gold coin in the pocket. ${yearAnimal} is ${yFit} for the Ox. Don't wear the gold.` : "No enemy-year item today.",
    pressure,
    selfish: [1, 5, 8].includes(pd.reduced) ? "Play selfish. The shot is yours." : "Play safe. The extra pass comes first.",
    mantra: MANTRA[pd.reduced] ?? MANTRA[reduce(pd.reduced)] ?? MANTRA[1],
  };
}

function reduceToNine(n: number) {
  return n <= 9 ? n : n % 9 || 9;
}

function scoreNumber(n: number, de: number, pd: number, lifePath: number, birthdayNum: number) {
  const targets = [lifePath, birthdayNum, de, pd, 10, 28, 8, 1, 9];
  let score = 0;
  if (n === 10) score += 100;
  if (n === 28) score += 96;
  if (n === lifePath) score += 90;
  if (n === birthdayNum) score += 88;
  if (n === de) score += 84;
  if (n === pd) score += 82;
  if (n === reduce(digitSum(lifePath + birthdayNum + pd))) score += 14;
  if (n === reduce(digitSum(pd + de))) score += 10;
  if (n === 8 && lifePath === 1) score += 12;
  if (n === 1 && pd === 1) score += 10;
  if (n === 9 && pd === 9) score += 12;
  score += Math.max(0, 60 - targets.indexOf(n) * 5);
  return score;
}

export function calcGameDay(
  gameMonth: number, gameDay: number, gameYear: number,
  lifePath: number, birthdayNum: number,
): SoccerGameDay {
  const de = calcDateEnergy(gameMonth, gameDay, gameYear);
  const personalYear = calcPersonalYear(PROFILE.birthMonth, PROFILE.birthDay, gameMonth, gameDay, gameYear).reduced;
  const zodiac = getChineseYearCompatibility(PROFILE.birthYear, gameYear);
  const pd = calcPersonalDay(
    PROFILE.birthMonth, PROFILE.birthDay,
    gameMonth, gameDay, gameYear
  );

  // Compatibility % — driven by ShemUniverse number compatibility matrix.
  // Blend lifepath↔universal-day, birthday↔personal-day, lifepath↔personal-day
  // and the REGULAR calendar day number (e.g. the 18th = 18/9).
  const dayNum = dayNumber(gameDay);
  const lpVsUniv = compatPct(lifePath, de.reduced);
  const bdayVsPd = compatPct(birthdayNum, pd.reduced);
  const lpVsPd   = compatPct(lifePath, pd.reduced);
  const lpVsDay  = compatPct(lifePath, dayNum);
  const compat = Math.round(lpVsUniv * 0.25 + bdayVsPd * 0.25 + lpVsPd * 0.2 + lpVsDay * 0.3);
  const tier = compatLabel(compat);
  const compatLabelStr = tier === "FRIENDLY" ? "Strong Flow" : tier === "NEUTRAL" ? "Neutral" : "Tension";
  const compatDesc = `${compat}% — LP ${lifePath} ↔ Universal ${de.reduced} (${lpVsUniv}%), Birthday ${birthdayNum} ↔ Personal Day ${pd.reduced} (${bdayVsPd}%), LP ${lifePath} ↔ Day ${gameDay}/${dayNum} (${lpVsDay}%)`;


  // Ranked numbers (compute early so colors can reference top 3)
  const rankedNumbers = [10, 28, lifePath, birthdayNum, de.reduced, pd.reduced, personalYear, 8, 1, 9, 11, 22]
    .filter((n, i, a) => a.indexOf(n) === i)
    .map(n => ({
      number: n,
      score: scoreNumber(n, de.reduced, pd.reduced, lifePath, birthdayNum) + (n === personalYear ? 86 : 0) + (n === zodiac.score ? 0 : 0),
      label: n === 10 ? "Primary" : n === 28 ? "Compound" : n === lifePath ? "Life Path" : n === birthdayNum ? "Birthday" : n === de.reduced ? "Universal" : n === pd.reduced ? "Personal Day" : n === personalYear ? "Personal Year" : n === 8 ? "Power" : n === 1 ? "Leader" : n === 9 ? "Completion" : n === 11 ? "Master 11" : "Master 22",
      reason: n === 10 ? "Strongest current jersey portal" : n === 28 ? "Life Path compound portal" : n === lifePath ? "Core identity number" : n === birthdayNum ? "Birthday gift" : n === de.reduced ? "Today's universal energy" : n === pd.reduced ? "Today's personal energy" : n === personalYear ? "Your current year cycle" : n === 8 ? "Authority and power" : n === 1 ? "Initiation and leadership" : n === 9 ? "Completion and harvest" : n === 11 ? "Intuition portal" : "Builder portal",
    }))
    .sort((a, b) => b.score - a.score);

  const top3Numbers = rankedNumbers.slice(0, 3).map(r => r.number);

  // Colors — harmonized with date energy AND top 3 jersey numbers
  const baseColors = getColorConfig(de.reduced, de.compound);
  const top3ColorSets = top3Numbers.map(n => {
    const r = n > 9 && !(n === 10 || n === 11 || n === 22 || n === 28) ? reduceToNine(n) : n;
    return getColorConfig(r, n);
  });

  function pickBestColor(slot: "cleat" | "shin" | "sock", base: string[]): string[] {
    const allCandidates = new Map<string, number>();
    base.forEach((c, i) => allCandidates.set(c, (allCandidates.get(c) ?? 0) + (i === 0 ? 10 : 5)));
    top3ColorSets.forEach((cs, rank) => {
      const weight = rank === 0 ? 8 : rank === 1 ? 5 : 3;
      cs[slot].forEach((c, i) => allCandidates.set(c, (allCandidates.get(c) ?? 0) + (i === 0 ? weight : Math.ceil(weight / 2))));
    });
    const sorted = [...allCandidates.entries()].sort((a, b) => b[1] - a[1]);
    const result = sorted.map(s => s[0]);
    return result.length >= 2 ? result.slice(0, 2) : [...result, ...base.slice(0, 2 - result.length)];
  }

  const colors = {
    cleat: pickBestColor("cleat", baseColors.cleat),
    shin: pickBestColor("shin", baseColors.shin),
    sock: pickBestColor("sock", baseColors.sock),
  };

  // Best numbers
  const bestNums = [...new Set([lifePath, birthdayNum, de.reduced, pd.reduced, personalYear, de.compound])].slice(0, 5);
  const bestReasons = [
    `${lifePath} — your Life Path power number`,
    `${birthdayNum} — your Birthday Number gift`,
    `${de.reduced} — today's universal energy`,
    `${personalYear} — your Personal Year cycle`,
    `${de.compound} — compound activation`,
    `${zodiac.birthSign} ↔ ${zodiac.yearSign} — ${zodiac.label}`,
  ];

  // Jersey recommendation
  const jersey = lifePath === 1 ? 10 : lifePath === 8 ? 8 : lifePath === 3 ? 3 : lifePath * 10 <= 99 ? lifePath * 10 : lifePath;
  const jerseyReason = `#${jersey} carries your Life Path ${lifePath} compound energy — activates your wealth/power portal`;
  const fusion = reduceToNine(de.reduced + pd.reduced + lifePath + birthdayNum);
  const sockType = fusion <= 4 || lifePath === 1 || birthdayNum === 8 ? "grip" : "regular";
  const sockHeight = fusion <= 3 ? "low" : fusion <= 6 ? "mid" : fusion <= 8 ? "high" : "otk";
  const jerseyTuck = [1, 4, 8, 10, 22].includes(jersey) || de.reduced >= 8 ? "tucked" : "untucked";
  const gearFormula = `Fusion ${fusion} = reduce(${de.reduced}+${pd.reduced}+${lifePath}+${birthdayNum}) → ${sockType}, ${sockHeight}, ${jerseyTuck}`;

  const gameDate = `${String(gameMonth).padStart(2,"0")}/${String(gameDay).padStart(2,"0")}/${gameYear}`;

  return {
    gameDate,
    universalEnergy: de.reduced,
    universalCompound: de.compound,
    universalLabel: de.label,
    personalDay: pd.reduced,
    personalDayCompound: pd.compound,
    compatibility: compat,
    compatLabel: compatLabelStr,
    compatDesc,
    cleatColors: colors.cleat,
    shinColors: colors.shin,
    sockColors: colors.sock,
    bestNumbers: bestNums,
    bestNumberReasons: bestReasons,
    jerseyRecommendation: jersey,
    jerseyReason,
    sockType,
    sockHeight,
    jerseyTuck,
    gearFormula,
    rankedNumbers,
    colorHarmonizedWith: top3Numbers,
  };
}

// ── Training plan ────────────────────────────────────────────────────────────
export function getWeeklyPlan(personalYear: number, lifePath: number) {
  const energy = personalYear;
  const focus = energy <= 3 ? "Speed & Creativity" : energy <= 6 ? "Tactical & Teamwork" : "Power & Finishing";
  return {
    focus,
    mon: { type: "Technical", desc: "Ball mastery — 500 touches, first touch control, weak foot work" },
    tue: { type: "Speed & Agility", desc: "Shuttle runs, ladder drills, explosive start bursts" },
    wed: { type: "Tactical", desc: "Video review + position-specific movement patterns (winger runs)" },
    thu: { type: "Strength", desc: "Gym — legs (squats, lunges), core stability, rotational power" },
    fri: { type: "Match Prep", desc: "Light training, mental visualization, gear selection ritual" },
    sat: { type: "MATCH DAY", desc: "Check game day energy, cleat colors, jersey number before kickoff" },
    sun: { type: "Recovery", desc: "Active recovery — walk, stretch, foam roll. Reflect on your numbers" },
  };
}

// ── Diet plan ────────────────────────────────────────────────────────────────
export const DIET_PLAN = {
  preMatch: [
    "3–4 hrs before: Complex carbs — pasta, rice, sweet potato",
    "1–2 hrs before: Banana + peanut butter (fast energy)",
    "30 min before: Small handful of dates (natural sugar spike)",
  ],
  hydration: [
    "Morning: 16–20 oz water immediately on waking",
    "Training: 8 oz every 20 min",
    "Post-match: Electrolyte drink + 24 oz water within 30 min",
  ],
  recovery: [
    "Within 30 min post-match: Protein shake + fruit",
    "Dinner: Lean protein (chicken, fish), rice, vegetables",
    "Before bed: Casein protein or cottage cheese",
  ],
  luckyFoods: ["Dates (energy portal food — 28/10 vibration)", "Bananas (3 energy — creative power)", "Almonds (grounding — 4 vibration)"],
};
