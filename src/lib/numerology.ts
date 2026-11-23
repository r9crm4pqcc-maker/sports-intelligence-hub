// ─── Pythagorean letter→number chart ─────────────────────────────────────────
const PYTHAGOREAN: Record<string, number> = {
  A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,
  J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,
  S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8,
};

const MASTER = new Set([11, 22, 33]);
const VOWELS = new Set(["A","E","I","O","U"]);

/** Reduce to single digit, preserving master numbers 11, 22, 33.
 *  20 is a hidden 11 and never reduces to 2 — a pure 2 stays 2. */
export function reduce(n: number): number {
  if (n <= 9 || MASTER.has(n)) return n;
  const next = [...String(n)].reduce((a, d) => a + +d, 0);
  const r = reduce(next);
  // Only a pure 2 is 2; anything bigger that lands on 2 is 11 energy.
  return r === 2 ? 11 : r;
}

/** Calendar day-of-month energy: 18 → 9, 20 → hidden 11, 2 → pure 2. */
export function dayNumber(day: number): number {
  return reduce(day);
}

/** Consistent compound/reduced display, for example 18/9 or 11. */
export function formatCompound(compound: number, reduced: number): string {
  return compound === reduced ? String(reduced) : `${compound}/${reduced}`;
}

export function calcUniversalYear(year: number): { compound: number; reduced: number } {
  const compound = digitSum(year);
  return { compound, reduced: reduce(compound) };
}

export function calcUniversalMonth(year: number, month: number): { compound: number; reduced: number } {
  const uy = calcUniversalYear(year).reduced;
  const compound = uy + month;
  return { compound, reduced: reduce(compound) };
}

export function calcUniversalDay(year: number, month: number, day: number): { compound: number; reduced: number } {
  const um = calcUniversalMonth(year, month).reduced;
  const compound = um + day;
  return { compound, reduced: reduce(compound) };
}

export interface LunarNumberProfile {
  phase: string;
  lunarAge: number;
  lunarLifePath: number;
  favoredNumbers: number[];
  gg33LuckyNumbers: number[];
  lunarLuckyNumbers: number[];
}

/** Approximate astronomical lunar age based on the standard 2000-01-06 new moon epoch. */
export function calcLunarNumberProfile(year: number, month: number, day: number, lifePath: number, birthday: number): LunarNumberProfile {
  const synodicMonth = 29.53058867;
  const epoch = Date.UTC(2000, 0, 6, 18, 14) / 86400000;
  const current = Date.UTC(year, month - 1, day, 12) / 86400000;
  const lunarAge = ((current - epoch) % synodicMonth + synodicMonth) % synodicMonth;
  const phaseIndex = Math.floor(((lunarAge + synodicMonth / 16) % synodicMonth) / (synodicMonth / 8));
  const phases = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
  const phaseNumbers = [[1,10,19,28],[2,11,20,29],[3,12,21,30],[4,13,22,31],[5,14,23],[6,15,24],[7,16,25],[8,17,26]];
  const lunarDay = Math.max(1, Math.min(30, Math.floor(lunarAge) + 1));
  const lunarLifePath = reduce(lunarDay);
  const universal = calcUniversalDay(year, month, day).reduced;
  const unique = (values: number[]) => [...new Set(values.filter(n => n > 0))];
  return {
    phase: phases[phaseIndex],
    lunarAge: Number(lunarAge.toFixed(1)),
    lunarLifePath,
    favoredNumbers: phaseNumbers[phaseIndex],
    gg33LuckyNumbers: unique([lifePath, birthday, reduce(lifePath + birthday), 11, 22]),
    lunarLuckyNumbers: unique([lunarDay, lunarLifePath, universal, reduce(lunarLifePath + universal)]),
  };
}

/** Pythagorean value of any word/phrase (compound + reduced, 20 = hidden 11). */
export function pythagoreanValue(text: string): { compound: number; reduced: number } {
  let compound = 0;
  for (const ch of text.toUpperCase().normalize("NFD").replace(/[^A-Z]/g, "")) {
    compound += PYTHAGOREAN[ch] ?? 0;
  }
  return { compound, reduced: reduce(compound) };
}


/** Full digit sum of a number string — first pass (compound) */
export function digitSum(n: number): number {
  return [...String(n)].reduce((a, d) => a + +d, 0);
}

/** Convert date parts to numbers — each part reduced separately (master-aware) */
function reducePart(n: number): number {
  return reduce(digitSum(n));
}

export interface LifePeriod {
  period: 1 | 2 | 3;
  number: number;
  from: number;
  to: number | null;
  ruling: string;
}

export interface PinnacleAge {
  period: 1 | 2 | 3 | 4;
  number: number;
  from: number;
  to: number | null;
}

export interface CoreNumbers {
  lifePath: number;
  lifePathCompound: number;
  expression: number;
  expressionCompound: number;
  soulUrge: number;
  soulUrgeCompound: number;
  personality: number;
  personalityCompound: number;
  birthday: number;
  birthdayReduced: number;
  personalYear: number;
  personalYearCompound: number;
  karmicLessons: number[];
  karmicDebts: number[];
  hiddenPassion: number;
  subconsciousSelf: number;
  planesOfExpression: { physical: number; mental: number; emotional: number; intuitive: number };
  pinnacles: [number, number, number, number];
  pinnacleAges: [PinnacleAge, PinnacleAge, PinnacleAge, PinnacleAge];
  challenges: [number, number, number, number];
  mulank: number;
  planet: string;
  maturityNumber: number;
  balanceNumber: number;
  cornerstone: number;
  capstone: number;
  firstVowel: number;
  lifePeriods: [LifePeriod, LifePeriod, LifePeriod];
}

const PLANET_MAP: Record<number, string> = {
  1:"Sun", 2:"Moon", 3:"Jupiter", 4:"Uranus/Rahu",
  5:"Mercury", 6:"Venus", 7:"Neptune/Ketu", 8:"Saturn", 9:"Mars",
};

// Planes of Expression letter maps
const PHYSICAL_LETTERS = new Set(["D","E","M","N","V","W"]);
const MENTAL_LETTERS   = new Set(["A","H","J","Q","S","Z"]);
const EMOTIONAL_LETTERS= new Set(["B","C","F","K","L","O","T","U","X"]);
const INTUITIVE_LETTERS= new Set(["G","I","P","R","Y"]);

function isVowel(ch: string, idx: number, word: string): boolean {
  const c = ch.toUpperCase();
  if (VOWELS.has(c)) return true;
  // Y is vowel if it's the only vowel in its syllable (simplified: Y with no other vowels adjacent)
  if (c === "Y") {
    const neighbors = (word[idx-1]||"") + (word[idx+1]||"");
    return ![...neighbors].some(n => VOWELS.has(n.toUpperCase()));
  }
  return false;
}

function nameToDigits(name: string, type: "all"|"vowels"|"consonants"): number[] {
  const letters = [...name.toUpperCase()].filter(c => /[A-Z]/.test(c));
  const word = letters.join("");
  return letters
    .map((c, i) => ({ c, i }))
    .filter(({ c, i }) => {
      if (type === "all") return true;
      const v = isVowel(c, i, word);
      return type === "vowels" ? v : !v;
    })
    .map(({ c }) => PYTHAGOREAN[c] ?? 0);
}

function sumName(name: string, type: "all"|"vowels"|"consonants"): { compound: number; reduced: number } {
  const compound = nameToDigits(name, type).reduce((a, b) => a + b, 0);
  return { compound, reduced: reduce(compound) };
}

function calcExpression(nameParts: string[], type: "all"|"vowels"|"consonants" = "all"): { compound: number; reduced: number } {
  const partSums = nameParts
    .filter(p => p.trim().length > 0)
    .map(p => sumName(p, type).reduced);
  const compound = partSums.reduce((a, b) => a + b, 0);
  return { compound, reduced: reduce(compound) };
}

const KARMIC_DEBT_TRIGGERS = new Set([13, 14, 16, 19]);

export function calcCoreNumbers(
  firstName: string,
  middleName: string,
  lastName: string,
  birthMonth: number,
  birthDay: number,
  birthYear: number,
  currentYear: number = new Date().getFullYear(),
): CoreNumbers {
  const nameParts = [firstName, middleName, lastName].filter(Boolean);
  const fullNameStr = nameParts.join(" ");

  // ── Life Path ──
  const mPart = reduce(birthMonth);
  const dPart = reduce(birthDay);
  const yRaw  = digitSum(birthYear);
  const yPart = reduce(yRaw);
  const lpCompound = mPart + dPart + yPart;
  const lifePath = reduce(lpCompound);

  // ── Karmic Debts (check compounds before final reduction) ──
  const karmicDebts: number[] = [];
  for (const c of [lpCompound, birthDay, birthYear]) {
    if (KARMIC_DEBT_TRIGGERS.has(c)) karmicDebts.push(c);
  }
  // also check compound expression before final reduce
  const exprRaw = calcExpression(nameParts, "all");
  if (KARMIC_DEBT_TRIGGERS.has(exprRaw.compound)) karmicDebts.push(exprRaw.compound);
  const uniqueDebts = [...new Set(karmicDebts)];

  // ── Expression ──
  const expr = calcExpression(nameParts, "all");

  // ── Soul Urge (vowels) ──
  const soul = calcExpression(nameParts, "vowels");

  // ── Personality (consonants) ──
  const pers = calcExpression(nameParts, "consonants");

  // ── Birthday ──
  const birthdayReduced = reduce(birthDay);

  // ── Personal Year (rolls over on the birthday) ──
  const _refDate = new Date();
  const _refM = currentYear === _refDate.getFullYear() ? _refDate.getMonth() + 1 : 12;
  const _refD = currentYear === _refDate.getFullYear() ? _refDate.getDate() : 31;
  const _beforeBday = _refM < birthMonth || (_refM === birthMonth && _refD < birthDay);
  const py = calcPersonalYear(birthMonth, birthDay, _refM, _refD, currentYear);
  const pyCompound = py.compound;
  const personalYear = py.reduced;


  // ── Karmic Lessons (missing digits 1–9 in full name) ──
  const allDigits = new Set(nameToDigits(fullNameStr, "all"));
  const karmicLessons = [1,2,3,4,5,6,7,8,9].filter(n => !allDigits.has(n));

  // ── Hidden Passion (most frequent digit) ──
  const freq: Record<number, number> = {};
  for (const d of nameToDigits(fullNameStr, "all")) freq[d] = (freq[d] || 0) + 1;
  const hiddenPassion = Number(Object.entries(freq).sort((a,b) => b[1]-a[1])[0]?.[0] ?? 1);

  // ── Subconscious Self ──
  const subconsciousSelf = 9 - karmicLessons.length;

  // ── Planes of Expression ──
  const planes = { physical: 0, mental: 0, emotional: 0, intuitive: 0 };
  for (const c of fullNameStr.toUpperCase()) {
    if (!(/[A-Z]/.test(c))) continue;
    if (PHYSICAL_LETTERS.has(c))  planes.physical++;
    else if (MENTAL_LETTERS.has(c))   planes.mental++;
    else if (EMOTIONAL_LETTERS.has(c)) planes.emotional++;
    else if (INTUITIVE_LETTERS.has(c)) planes.intuitive++;
  }

  // ── Pinnacles & Challenges ──
  const m = reduce(birthMonth);
  const d2 = reduce(birthDay);
  const y2 = reduce(digitSum(birthYear));
  const p1 = reduce(m + d2);
  const p2 = reduce(d2 + y2);
  const p3 = reduce(p1 + p2);
  const p4 = reduce(m + y2);
  const c1 = Math.abs(m - d2);
  const c2 = Math.abs(d2 - y2);
  const c3 = Math.abs(c1 - c2);
  const c4 = Math.abs(m - y2);

  // ── Pinnacle Ages ──
  const p1End = 36 - lifePath;
  const pinnacleAges: [PinnacleAge, PinnacleAge, PinnacleAge, PinnacleAge] = [
    { period:1, number:p1, from:0, to:p1End },
    { period:2, number:p2, from:p1End+1, to:p1End+9 },
    { period:3, number:p3, from:p1End+10, to:p1End+18 },
    { period:4, number:p4, from:p1End+19, to:null },
  ];

  // ── Mulank & Planet ──
  const mulank = reduce(birthDay);
  const planet = PLANET_MAP[mulank] ?? "Unknown";

  // ── Maturity Number ──
  const maturityNumber = reduce(lifePath + expr.reduced);

  // ── Balance Number ──
  const initials = nameParts.map(p => p.charAt(0).toUpperCase()).filter(c => /[A-Z]/.test(c));
  const balanceSum = initials.reduce((sum, c) => sum + (PYTHAGOREAN[c] ?? 0), 0);
  const balanceNumber = reduce(balanceSum);

  // ── Cornerstone (first letter of first name) ──
  const firstLetter = (nameParts[0] ?? "A").charAt(0).toUpperCase();
  const cornerstone = PYTHAGOREAN[firstLetter] ?? 1;

  // ── Capstone (last letter of last name) ──
  const lastNamePart = nameParts[nameParts.length - 1] ?? "A";
  const lastLetter = lastNamePart.charAt(lastNamePart.length - 1).toUpperCase();
  const capstone = PYTHAGOREAN[lastLetter] ?? 1;

  // ── First Vowel ──
  const fullUpper = nameParts[0]?.toUpperCase() ?? "";
  const fv = [...fullUpper].find(c => VOWELS.has(c)) ?? "A";
  const firstVowel = PYTHAGOREAN[fv] ?? 1;

  // ── Life Path Periods (3 major cycles) ──
  const period1End = 36 - lifePath;
  const period2End = period1End + 27;
  const lifePeriods: [LifePeriod, LifePeriod, LifePeriod] = [
    { period:1, number: reduce(birthMonth), from:0, to:period1End, ruling:"Birth Month" },
    { period:2, number: reduce(birthDay), from:period1End+1, to:period2End, ruling:"Birth Day" },
    { period:3, number: reduce(digitSum(birthYear)), from:period2End+1, to:null, ruling:"Birth Year" },
  ];

  return {
    lifePath, lifePathCompound: lpCompound,
    expression: expr.reduced, expressionCompound: expr.compound,
    soulUrge: soul.reduced, soulUrgeCompound: soul.compound,
    personality: pers.reduced, personalityCompound: pers.compound,
    birthday: birthDay, birthdayReduced,
    personalYear, personalYearCompound: pyCompound,
    karmicLessons, karmicDebts: uniqueDebts,
    hiddenPassion, subconsciousSelf,
    planesOfExpression: planes,
    pinnacles: [p1, p2, p3, p4],
    pinnacleAges,
    challenges: [c1, c2, c3, c4],
    mulank, planet,
    maturityNumber, balanceNumber, cornerstone, capstone, firstVowel,
    lifePeriods,
  };
}

// ── Date Energy ──────────────────────────────────────────────────────────────
export interface DateEnergy {
  fullSum: number;
  compound: number;
  reduced: number;
  secondary: number;
  isMaster: boolean;
  label: string;
}

export function calcDateEnergy(month: number, day: number, year: number): DateEnergy {
  const digits = `${String(month).padStart(2,"0")}${String(day).padStart(2,"0")}${year}`;
  const fullSum = [...digits].reduce((a, d) => a + +d, 0);
  const compound = fullSum;
  const reduced = reduce(fullSum);
  // secondary = reduce one level less
  const secondary = digitSum(fullSum) < 10 ? fullSum : digitSum(fullSum);
  const isMaster = MASTER.has(reduced) || MASTER.has(compound);
  const labels: Record<number, string> = {
    1:"Action & Leadership", 2:"Cooperation & Patience",
    3:"Creativity & Expression", 4:"Structure & Discipline",
    5:"Freedom & Change", 6:"Harmony & Service",
    7:"Reflection & Wisdom", 8:"Power & Abundance",
    9:"Completion & Release", 11:"Master Portal – Illumination",
    22:"Master Builder – Manifestation", 33:"Master Teacher – Service",
  };
  return { fullSum, compound, reduced, secondary, isMaster, label: labels[reduced] ?? "" };
}

// ── Personal Year (rolls over on the birthday) ───────────────────────────────
export function calcPersonalYear(
  birthMonth: number, birthDay: number,
  targetMonth: number, targetDay: number, targetYear: number
): { compound: number; reduced: number; cycleYear: number } {
  const beforeBirthday =
    targetMonth < birthMonth || (targetMonth === birthMonth && targetDay < birthDay);
  const effYear = beforeBirthday ? targetYear - 1 : targetYear;
  const compound = reduce(birthMonth) + reduce(birthDay) + reduce(digitSum(effYear));
  return { compound, reduced: reduce(compound), cycleYear: effYear };
}

// ── Personal Day (PY → PM → PD chain) ────────────────────────────────────────
export function calcPersonalDay(
  birthMonth: number, birthDay: number,
  targetMonth: number, targetDay: number, targetYear: number
): { compound: number; reduced: number } {
  const py = calcPersonalYear(birthMonth, birthDay, targetMonth, targetDay, targetYear).reduced;
  // Personal Month = PY + calendar month (reduced); Personal Day = reduced PM +
  // digit sum of the calendar day (the 13th counts as 1+3 = 4, the 30th as 3+0 = 3).
  // e.g. PY 9, September → PM 9; the 13th → 9 + 4 = 13/4 Personal Day.
  const pm = reduce(py + targetMonth);
  const compound = pm + digitSum(targetDay);
  return { compound, reduced: reduce(compound) };
}


// ── Athlete Personal Day (SportsCode method) ────────────────────────────────
// Personal Day = athlete's current Personal Year cycle + calendar month + the
// digit sum of the calendar day (the 30th counts as 3+0 = 3, never 30).
export interface AthletePersonalDay {
  personalYear: number;
  personalYearCompound: number;
  cycleYear: number;
  daySum: number;
  compound: number;
  reduced: number;
  isMaster: boolean;
  expression: string; // e.g. "8 + 9 + 3 = 20 → 2"
  meaning: string;
}
export function calcAthletePersonalDay(
  birthMonth: number, birthDay: number,
  targetMonth: number, targetDay: number, targetYear: number
): AthletePersonalDay {
  const py = calcPersonalYear(birthMonth, birthDay, targetMonth, targetDay, targetYear);
  const daySum = digitSum(targetDay); // 30 → 3, 22 → 4, etc.
  const pm = py.reduced + targetMonth; // Personal Month first
  const compound = pm + daySum; // Personal Day = PM + day digits
  const reduced = reduce(compound);
  const meanings: Record<number, string> = {
    1: "Attack day — initiative, leading, first to the ball",
    2: "Support day — patience, teamwork, waiting for chances",
    3: "Expression day — creativity, flair, showtime energy",
    4: "Grind day — discipline, defense, structure wins",
    5: "Chaos day — speed, risk, unpredictable swings",
    6: "Harmony day — service, balance, team chemistry",
    7: "Intuition day — reading the game, strategic IQ",
    8: "Power day — dominance, physicality, big moments",
    9: "Completion day — finishing, legacy, closing it out",
    11: "Master portal — peak instinct, heightened awareness",
    22: "Master builder — career-defining performance possible",
    33: "Master teacher — elevating everyone around them",
  };
  return {
    personalYear: py.reduced,
    personalYearCompound: py.compound,
    cycleYear: py.cycleYear,
    daySum,
    compound: pm + daySum,
    reduced,
    isMaster: reduced !== compound && [11, 22, 33].includes(reduced),
    expression: `PM ${pm} + ${daySum} = ${compound}${compound !== reduced ? ` → ${reduced}` : ""}`,
    meaning: meanings[reduced] ?? "",
  };
}

// ── Lucky Color map ──────────────────────────────────────────────────────────
export const LUCKY_COLORS: Record<number, { primary: string; secondary: string }> = {
  1: { primary: "Gold", secondary: "Yellow" },
  2: { primary: "Silver", secondary: "Cream" },
  3: { primary: "Yellow", secondary: "Gold" },
  4: { primary: "Blue", secondary: "Grey" },
  5: { primary: "Turquoise", secondary: "Light Blue" },
  6: { primary: "Royal Blue", secondary: "Green" },
  7: { primary: "Purple", secondary: "Indigo" },
  8: { primary: "Black", secondary: "Dark Blue" },
  9: { primary: "Red", secondary: "Gold" },
  10: { primary: "Gold", secondary: "Royal Blue" },
  11: { primary: "White", secondary: "Silver" },
  22: { primary: "Iridescent", secondary: "Gold" },
  28: { primary: "Gold", secondary: "Royal Blue" },
};

// ── Compatibility score ───────────────────────────────────────────────────────
export function calcCompatibility(
  lp1: number, expr1: number,
  lp2: number, expr2: number,
): { score: number; label: string; detail: string } {
  const HARMONY: Record<string, number> = {
    "1-1":70,"1-2":80,"1-3":85,"1-4":60,"1-5":75,"1-6":65,"1-7":70,"1-8":80,"1-9":65,
    "2-2":75,"2-3":80,"2-4":85,"2-5":65,"2-6":90,"2-7":80,"2-8":70,"2-9":85,
    "3-3":75,"3-4":60,"3-5":85,"3-6":80,"3-7":65,"3-8":70,"3-9":80,
    "4-4":70,"4-5":55,"4-6":75,"4-7":65,"4-8":85,"4-9":60,
    "5-5":65,"5-6":70,"5-7":80,"5-8":65,"5-9":75,
    "6-6":80,"6-7":75,"6-8":70,"6-9":90,
    "7-7":70,"7-8":65,"7-9":80,
    "8-8":75,"8-9":65,"9-9":75,
  };
  const key = [Math.min(lp1,lp2), Math.max(lp1,lp2)].join("-");
  const base = HARMONY[key] ?? 70;
  const exprBonus = (expr1 === expr2) ? 8 : Math.abs(expr1 - expr2) <= 2 ? 4 : 0;
  const score = Math.min(99, base + exprBonus);
  const label = score >= 85 ? "Excellent" : score >= 70 ? "Strong" : score >= 55 ? "Moderate" : "Challenging";
  const detail = `Life Path ${lp1} × ${lp2} harmony — ${label} flow`;
  return { score, label, detail };
}

// ── Personal Month ──────────────────────────────────────────────────────────
export function calcPersonalMonth(
  personalYear: number, targetMonth: number
): { compound: number; reduced: number } {
  const compound = personalYear + targetMonth;
  return { compound, reduced: reduce(compound) };
}

// ── Personal Week ───────────────────────────────────────────────────────────
export function calcPersonalWeek(
  personalMonth: number, weekOfMonth: number
): { compound: number; reduced: number } {
  const compound = personalMonth + weekOfMonth;
  return { compound, reduced: reduce(compound) };
}

// ── Address / Phone / Vehicle Numerology ────────────────────────────────────
export function calcAddressNumber(address: string): { compound: number; reduced: number; meaning: string } {
  const digits = [...address].filter(c => /[0-9]/.test(c));
  const letters = [...address.toUpperCase()].filter(c => /[A-Z]/.test(c));
  const digitSum = digits.reduce((a, d) => a + +d, 0);
  const letterSum = letters.reduce((a, c) => a + (PYTHAGOREAN[c] ?? 0), 0);
  const compound = digitSum + letterSum;
  const reduced = reduce(compound);
  const meanings: Record<number, string> = {
    1:"Independence, leadership, new beginnings. Great for entrepreneurs and self-starters.",
    2:"Partnership, peace, diplomacy. Ideal for couples and mediators.",
    3:"Creativity, self-expression, social energy. Great for artists and entertainers.",
    4:"Stability, hard work, security. Great for building foundations and families.",
    5:"Change, adventure, freedom. Lots of activity and visitors. Not the most stable.",
    6:"Love, family, responsibility. The ideal family home. Nurturing energy.",
    7:"Solitude, spirituality, introspection. Great for writers, researchers, spiritual seekers.",
    8:"Abundance, power, business success. Strong material energy. Watch for workaholism.",
    9:"Compassion, endings, universal love. Attracts all types. Great for healers and humanitarians.",
    11:"Spiritual illumination. High vibration home. Can be intense.",
    22:"Master builder. Ideal for creating something of lasting legacy.",
  };
  return { compound, reduced, meaning: meanings[reduced] ?? "Unique vibration" };
}

export function calcPhoneNumber(phone: string): { compound: number; reduced: number; meaning: string } {
  const digits = [...phone].filter(c => /[0-9]/.test(c));
  const compound = digits.reduce((a, d) => a + +d, 0);
  const reduced = reduce(compound);
  const meanings: Record<number, string> = {
    1:"Attracts leadership opportunities and independent contacts.",
    2:"Promotes peaceful communication and partnership calls.",
    3:"Social and creative connections flow to this number.",
    4:"Reliable, practical communications. Business-oriented.",
    5:"High activity — lots of calls, changes, and exciting contacts.",
    6:"Family and relationship-focused communications.",
    7:"Attracts private, meaningful, and spiritual connections.",
    8:"Power calls — business deals, financial opportunities.",
    9:"Humanitarian connections, completion of cycles through communication.",
    11:"Intuitive and inspired communications. Spiritual connections.",
    22:"Master networking. Large-scale connections.",
  };
  return { compound, reduced, meaning: meanings[reduced] ?? "Unique vibration" };
}

export function calcVehicleNumber(plate: string): { compound: number; reduced: number; meaning: string; compatibility: string } {
  const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const sum = [...clean].reduce((a, c) => {
    if (/[0-9]/.test(c)) return a + +c;
    return a + (PYTHAGOREAN[c] ?? 0);
  }, 0);
  const reduced = reduce(sum);
  const meanings: Record<number, string> = {
    1:"Fast, independent energy. Great for solo drivers who like to lead on the road.",
    2:"Smooth, safe, cooperative energy. Good for carpooling and family drives.",
    3:"Fun, social car. Great for road trips and adventures with friends.",
    4:"Reliable, sturdy, practical. Great for work vehicles and daily commuters.",
    5:"Adventure mobile. Loves change, travel, and open roads. Watch for speeding.",
    6:"Family car. Safe, nurturing energy. Great for hauling kids and groceries.",
    7:"The thinker's car. Good for long, contemplative drives. Prefers quiet roads.",
    8:"Power vehicle. Attracts status and success. Luxury energy.",
    9:"Humanitarian ride. Good for service vehicles, volunteering, and community work.",
    11:"Intuitive ride. You feel guided on the road. Trust your driving instincts.",
    22:"Master builder's vehicle. Made for big journeys and legacy trips.",
  };
  return { compound: sum, reduced, meaning: meanings[reduced] ?? "Unique vibration", compatibility: "" };
}

// ── Detailed 1–33 Number Interpretations ────────────────────────────────────
export const NUMBER_MEANINGS_FULL: Record<number, { title: string; keywords: string; meaning: string; planet: string; element: string; tarot: string; crystal: string; color: string }> = {
  1: { title:"The Leader", keywords:"Independence, originality, ambition, drive", meaning:"The number of creation and new beginnings. Pure masculine/yang energy. Self-starters who forge their own path. Natural leaders who don't follow — they create.", planet:"Sun", element:"Fire", tarot:"The Magician", crystal:"Citrine, Ruby", color:"Gold, Red" },
  2: { title:"The Diplomat", keywords:"Cooperation, sensitivity, balance, peace", meaning:"The number of duality and partnerships. Feminine/yin energy. Peacemakers and mediators. Highly intuitive, sensitive to others' needs.", planet:"Moon", element:"Water", tarot:"The High Priestess", crystal:"Moonstone, Pearl", color:"Silver, White" },
  3: { title:"The Communicator", keywords:"Creativity, expression, joy, social", meaning:"The number of creative self-expression. The artist, writer, speaker. Social butterfly energy. Natural charm and magnetism.", planet:"Jupiter", element:"Fire", tarot:"The Empress", crystal:"Yellow Topaz, Amethyst", color:"Yellow, Purple" },
  4: { title:"The Builder", keywords:"Structure, discipline, hard work, stability", meaning:"The number of foundations and order. Builder of systems and structures. Practical, reliable, and determined. The backbone of society.", planet:"Uranus/Rahu", element:"Earth", tarot:"The Emperor", crystal:"Sapphire, Emerald", color:"Blue, Green" },
  5: { title:"The Adventurer", keywords:"Freedom, change, versatility, travel", meaning:"The number of freedom and dynamic change. Sensory experience seeker. Adaptable, resourceful, and magnetic. Hates routine.", planet:"Mercury", element:"Air", tarot:"The Hierophant", crystal:"Turquoise, Aquamarine", color:"Turquoise, Light Blue" },
  6: { title:"The Nurturer", keywords:"Love, responsibility, harmony, family", meaning:"The number of love and domestic harmony. The cosmic parent. Drawn to beauty, art, and service. Healing presence.", planet:"Venus", element:"Earth", tarot:"The Lovers", crystal:"Rose Quartz, Jade", color:"Blue, Pink" },
  7: { title:"The Seeker", keywords:"Wisdom, spirituality, analysis, solitude", meaning:"The number of the mystic and philosopher. Deep thinker who seeks truth beyond surface reality. Introspective, analytical, spiritual.", planet:"Neptune/Ketu", element:"Water", tarot:"The Chariot", crystal:"Amethyst, Labradorite", color:"Purple, Violet" },
  8: { title:"The Powerhouse", keywords:"Authority, abundance, karma, achievement", meaning:"The number of material mastery and karmic balance. Executive energy. Born to lead organizations, build empires, and manage wealth.", planet:"Saturn", element:"Earth", tarot:"Strength", crystal:"Obsidian, Tiger's Eye", color:"Black, Dark Blue" },
  9: { title:"The Humanitarian", keywords:"Compassion, wisdom, completion, universal love", meaning:"The number of universal service and completion. Old soul energy. Compassionate, wise, and selfless. The final single digit. In GG33, 9 carries Gold / Deep Red completion energy — not the same as raw 1/Red leadership energy.", planet:"Mars", element:"Fire", tarot:"The Hermit", crystal:"Garnet, Bloodstone", color:"Gold, Deep Red" },
  10: { title:"Wheel of Fortune", keywords:"Completion, new cycle, leadership, fortune", meaning:"The complete cycle — 1 (beginning) + 0 (infinite potential). Fortune favors the bold. Completion energy leading to new leadership.", planet:"Sun+Pluto", element:"Fire/Ether", tarot:"Wheel of Fortune", crystal:"Citrine", color:"Gold" },
  11: { title:"Master Illuminator", keywords:"Intuition, inspiration, spiritual messenger", meaning:"The first master number. Channel between the spiritual and physical. Visionary energy. Extremely sensitive and psychically gifted.", planet:"Moon (higher octave)", element:"Light", tarot:"Justice", crystal:"Clear Quartz, Selenite", color:"White, Silver" },
  12: { title:"The Sacrifice", keywords:"Surrender, perspective shift, spiritual growth", meaning:"Learning through sacrifice and new perspectives. Seeing the world from a different angle. Spiritual growth through letting go.", planet:"Jupiter+Moon", element:"Water", tarot:"The Hanged Man", crystal:"Lapis Lazuli", color:"Blue" },
  13: { title:"Karmic Debt — Transformation", keywords:"Death/rebirth, hard work, perseverance", meaning:"Karmic debt number. Must work hard without shortcuts. Transformation through discipline. Past life laziness being corrected.", planet:"Uranus", element:"Earth", tarot:"Death", crystal:"Obsidian", color:"Black" },
  14: { title:"Karmic Debt — Temperance", keywords:"Moderation, freedom through discipline", meaning:"Karmic debt of excess. Past life overindulgence. Must learn moderation and temperance. Freedom comes through self-control.", planet:"Mercury", element:"Air/Fire", tarot:"Temperance", crystal:"Amethyst", color:"Purple, Blue" },
  15: { title:"The Alchemist", keywords:"Magnetism, temptation, material power", meaning:"Magnetic and charismatic. Can attract wealth and pleasure but must use power responsibly. Alchemical transformation energy.", planet:"Venus+Mars", element:"Fire", tarot:"The Devil", crystal:"Black Tourmaline", color:"Black, Red" },
  16: { title:"Karmic Debt — The Tower", keywords:"Ego destruction, awakening, rebuilding", meaning:"Karmic debt of ego. Past life arrogance being corrected. Sudden upheavals that destroy false structures. Spiritual awakening.", planet:"Neptune", element:"Fire/Water", tarot:"The Tower", crystal:"Moldavite", color:"Red, White" },
  17: { title:"The Star", keywords:"Hope, inspiration, spiritual gifts", meaning:"Number of immortality and spiritual gifts. Cosmic protection. Artistic and intellectual brilliance. Stars align in your favor.", planet:"Saturn+Sun", element:"Air", tarot:"The Star", crystal:"Star Sapphire", color:"Violet, Gold" },
  18: { title:"The Moon", keywords:"Illusion, intuition, hidden enemies, psychic", meaning:"Deep emotional and psychic currents. Hidden things come to light. Must trust intuition over appearances. Spiritual warfare.", planet:"Mars+Saturn", element:"Water", tarot:"The Moon", crystal:"Moonstone", color:"Silver, Grey" },
  19: { title:"Karmic Debt — The Sun", keywords:"Independence, ego lessons, self-reliance", meaning:"Karmic debt of abuse of power. Must learn true independence without dominating others. Success through selfless leadership.", planet:"Sun+Mars", element:"Fire", tarot:"The Sun", crystal:"Sunstone", color:"Gold, Orange" },
  20: { title:"Judgment", keywords:"Awakening, calling, resurrection, purpose", meaning:"Spiritual awakening and answering your higher calling. Resurrection of dormant talents. Time to step into your purpose.", planet:"Moon (higher)", element:"Water/Fire", tarot:"Judgement", crystal:"Angelite", color:"White, Gold" },
  21: { title:"The World", keywords:"Completion, success, fulfillment, travel", meaning:"Crown of the Major Arcana. Complete success and fulfillment. World travel and expansion. The promised land energy.", planet:"Jupiter+Sun", element:"Earth/Fire", tarot:"The World", crystal:"Lapis Lazuli, Gold", color:"Blue, Gold" },
  22: { title:"Master Builder", keywords:"Large-scale vision, manifestation, legacy", meaning:"The most powerful master number. Can turn the grandest dreams into physical reality. Architect of civilization.", planet:"Uranus (higher octave)", element:"Earth/Light", tarot:"The Fool (0/22)", crystal:"Moldavite, Diamond", color:"Gold, Iridescent" },
  23: { title:"The Royal Star", keywords:"Communication, protection, charisma", meaning:"One of the most fortunate compounds. Called 'The Royal Star of the Lion.' Success, protection, and favor from those in power.", planet:"Mercury+Jupiter", element:"Air/Fire", tarot:"", crystal:"Tiger's Eye", color:"Gold, Orange" },
  24: { title:"Love & Money", keywords:"Harmony, financial luck, relationships", meaning:"Very fortunate for love and money. Help from others. Community support. Domestic harmony and material comfort.", planet:"Venus+Uranus", element:"Earth/Water", tarot:"", crystal:"Rose Quartz, Jade", color:"Green, Pink" },
  25: { title:"The Discerner", keywords:"Introspection, wisdom, spiritual strength", meaning:"Spiritual strength through trials. Deep wisdom gained from experience. Analytical and intuitive in equal measure.", planet:"Neptune+Mercury", element:"Water/Air", tarot:"", crystal:"Amethyst", color:"Purple" },
  26: { title:"Partnerships & Warning", keywords:"Business, partnerships, caution", meaning:"Success in partnerships but beware of wrong alliances. Must choose associates carefully. Business acumen with caution.", planet:"Saturn+Venus", element:"Earth", tarot:"", crystal:"Black Onyx", color:"Dark Blue" },
  27: { title:"The Commander", keywords:"Leadership, courage, authority, military", meaning:"Command and authority. Military and leadership energy. Courage to lead in any field. Strong willpower and determination.", planet:"Mars+Neptune", element:"Fire/Water", tarot:"", crystal:"Ruby, Garnet", color:"Red" },
  28: { title:"The Wealth Number", keywords:"Fortune, loss, gain, independence", meaning:"Great promise but with the risk of loss. Must be independent. Don't trust blindly. Fortune through self-reliance. Cristian's compound LP.", planet:"Sun+Saturn", element:"Fire/Earth", tarot:"", crystal:"Citrine, Tiger's Eye", color:"Gold, Royal Blue" },
  29: { title:"Grace Under Pressure", keywords:"Extremes, spiritual tests, resilience", meaning:"Number of extremes — great highs and lows. Spiritual tests. Must develop faith and inner strength.", planet:"Moon+Mars", element:"Water/Fire", tarot:"", crystal:"Labradorite", color:"Silver, Red" },
  30: { title:"The Loner Intellect", keywords:"Creative mind, wit, isolation risk", meaning:"Brilliant mind with creative genius. Risk of isolation. Must balance solitude with social connection.", planet:"Jupiter+Sun", element:"Fire/Air", tarot:"", crystal:"Yellow Sapphire", color:"Yellow" },
  31: { title:"The Hermit", keywords:"Solitude, self-reliance, determination", meaning:"Similar to 13 but less karmic. Self-made success through determination. May prefer working alone.", planet:"Jupiter+Sun", element:"Earth/Fire", tarot:"", crystal:"Smoky Quartz", color:"Brown, Grey" },
  32: { title:"The Communicator", keywords:"Communication, magnetism, public success", meaning:"Magnetic communicator. Success through words, media, and public speaking. Natural charm.", planet:"Jupiter+Moon", element:"Air/Water", tarot:"", crystal:"Blue Lace Agate", color:"Light Blue" },
  33: { title:"Master Teacher", keywords:"Compassion, healing, selfless service", meaning:"The highest master number in common use. The Master Teacher. Christ consciousness. Healing through love and service.", planet:"Venus (higher octave)", element:"Light/Water", tarot:"", crystal:"Rose Quartz, Diamond", color:"Pink, White" },
};

export const GG33_TRUTH = {
  1: { color: "Red / Gold", lucky: "Initiation, leadership, courage", gems: "Ruby, Citrine", notes: "1 is a starter number; Red is active fire, Gold adds success." },
  2: { color: "Orange", lucky: "Partnership, peace, flow", gems: "Moonstone, Pearl", notes: "2 calms and connects." },
  3: { color: "Purple", lucky: "Expression, creativity, joy", gems: "Amethyst, Yellow Sapphire", notes: "3 opens communication and artistry." },
  4: { color: "Green", lucky: "Structure, stability, work", gems: "Emerald, Sapphire", notes: "4 builds and organizes." },
  5: { color: "Cyan", lucky: "Movement, change, learning", gems: "Aquamarine, Turquoise", notes: "5 is flexible and fast." },
  6: { color: "Blue / Indigo", lucky: "Love, harmony, healing", gems: "Lapis Lazuli, Blue Lace Agate", notes: "6 is nurturing and relational." },
  7: { color: "Violet", lucky: "Mysticism, insight, truth", gems: "Amethyst, Labradorite", notes: "7 is spiritual and inward." },
  8: { color: "Black / Gold", lucky: "Power, authority, wealth", gems: "Black Onyx, Blue Sapphire", notes: "8 is Saturn discipline and material mastery." },
  9: { color: "Gold / Deep Red", lucky: "Completion, harvest, release", gems: "Garnet, Bloodstone", notes: "9 is ending cycles; Gold is the main lucky tone, Deep Red is secondary." },
  10: { color: "Red / Gold", lucky: "New cycle, destiny, leadership", gems: "Ruby, Citrine", notes: "10 combines 1 and 0." },
  11: { color: "Silver / White", lucky: "Intuition, channeling, illumination", gems: "Selenite, Clear Quartz", notes: "11 is a master signal." },
  22: { color: "Yellow / Gold", lucky: "Builder power, manifestation", gems: "Moldavite, Diamond", notes: "22 is legacy creation." },
  33: { color: "Orange", lucky: "Teaching, healing, service", gems: "Rose Quartz, Diamond", notes: "33 is master compassion." },
};

// ── Matrix Signals & Repeating Numbers ──────────────────────────────────────
export const MATRIX_SIGNALS: Record<string, { meaning: string; action: string }> = {
  "111": { meaning:"Manifestation portal. Your thoughts are creating reality NOW.", action:"Focus only on what you WANT. Set clear intentions." },
  "222": { meaning:"Trust and patience. Everything is aligning behind the scenes.", action:"Keep faith. Partnerships forming. Don't force anything." },
  "333": { meaning:"Ascended Masters are near. Creative expression is needed.", action:"Create something. Communicate your truth. Share your gifts." },
  "444": { meaning:"Angels surrounding you. Foundation is being built.", action:"Keep working. Your discipline is paying off. Stay structured." },
  "555": { meaning:"Major change incoming. Buckle up — life is shifting.", action:"Embrace the change. Release old patterns. Adventure awaits." },
  "666": { meaning:"Recalibrate. Too focused on material — balance with spiritual.", action:"Reconnect with love, family, and service. Adjust priorities." },
  "777": { meaning:"Divine alignment. You're on the exact right path.", action:"Go deeper. Study, meditate, trust your intuition completely." },
  "888": { meaning:"Abundance flowing. Karmic rewards arriving.", action:"Receive gracefully. Share wealth. Financial decisions favored." },
  "999": { meaning:"Completion. A major cycle is ending.", action:"Let go. Release what's finished. Prepare for the new." },
  "000": { meaning:"Infinite potential. The void before creation.", action:"Meditate. Connect with source. Anything is possible." },
  "1111": { meaning:"Gateway of manifestation. Extremely powerful creation portal.", action:"IMMEDIATELY set your biggest intention. This is the master signal." },
  "1212": { meaning:"Keep positive. Spiritual growth accelerating.", action:"Stay optimistic. Your faith is being tested and rewarded." },
  "1234": { meaning:"Stairway pattern. You're ascending step by step.", action:"Keep climbing. Each step matters. Progress is real." },
  "911": { meaning:"Lightworker activation. You're being called to serve.", action:"Step into your purpose. The world needs your light." },
  "1010": { meaning:"Personal development. Stay positive and proactive.", action:"Take initiative. New opportunities are forming." },
};

// ── Gematria ─────────────────────────────────────────────────────────────────
export function gematria(input: string) {
  const clean = input.toUpperCase().replace(/[^A-Z]/g, "");
  const ordinal = [...clean].map(c => c.charCodeAt(0) - 64);
  const reverseOrdinal = [...clean].map(c => 27 - (c.charCodeAt(0) - 64));

  const englishOrdinal = ordinal.reduce((a, b) => a + b, 0);
  const fullReduction  = reduce(englishOrdinal);
  const reverseOrd     = reverseOrdinal.reduce((a, b) => a + b, 0);
  const revFullReduc   = reduce(reverseOrd);
  const sumerian       = englishOrdinal * 6;

  return { englishOrdinal, fullReduction, reverseOrdinal: reverseOrd, reverseFullReduction: revFullReduc, sumerian };
}

// ── Hebrew Gematria Ciphers ─────────────────────────────────────────────────
const HEBREW_STANDARD: Record<string, number> = {
  A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:10,K:20,L:30,M:40,N:50,
  O:60,P:70,Q:80,R:90,S:100,T:200,U:300,V:400,W:500,X:600,Y:700,Z:800,
};

const CHALDEAN_MAP: Record<string, number> = {
  A:1,B:2,C:3,D:4,E:5,F:8,G:3,H:5,I:1,J:1,K:2,L:3,M:4,N:5,
  O:7,P:8,Q:1,R:2,S:3,T:4,U:6,V:6,W:6,X:5,Y:1,Z:7,
};

const ATBASH_MAP: Record<string, string> = {};
for (let i = 0; i < 26; i++) {
  const from = String.fromCharCode(65 + i);
  const to = String.fromCharCode(65 + 25 - i);
  ATBASH_MAP[from] = to;
}

export function hebrewGematria(input: string) {
  const clean = input.toUpperCase().replace(/[^A-Z]/g, "");
  const letters = [...clean];

  const misparGadol = letters.reduce((a, c) => a + (HEBREW_STANDARD[c] ?? 0), 0);
  const misparKatan = letters.reduce((a, c) => {
    const v = HEBREW_STANDARD[c] ?? 0;
    return a + reduce(v);
  }, 0);
  const misparHekhrakhi = reduce(misparGadol);
  const chaldean = letters.reduce((a, c) => a + (CHALDEAN_MAP[c] ?? 0), 0);
  const chaldeanReduced = reduce(chaldean);

  const atbashText = letters.map(c => ATBASH_MAP[c] ?? c).join("");
  const atbashOrdinal = [...atbashText].reduce((a, c) => a + (c.charCodeAt(0) - 64), 0);
  const atbashReduced = reduce(atbashOrdinal);

  return {
    misparGadol,
    misparKatan,
    misparHekhrakhi,
    chaldean,
    chaldeanReduced,
    atbashText,
    atbashOrdinal,
    atbashReduced,
  };
}

// ── Name Change Analysis ────────────────────────────────────────────────────
export function analyzeNameChange(newFirst: string, newMiddle: string, newLast: string, birthMonth: number, birthDay: number, birthYear: number) {
  const newCore = calcCoreNumbers(newFirst, newMiddle, newLast, birthMonth, birthDay, birthYear);
  const lp = newCore.lifePath;
  const exprCompat = Math.abs(lp - newCore.expression) <= 2 || lp === newCore.expression;
  const soulCompat = Math.abs(lp - newCore.soulUrge) <= 2 || lp === newCore.soulUrge;
  const score = (exprCompat ? 35 : 10) + (soulCompat ? 35 : 10) + (newCore.karmicDebts.length === 0 ? 20 : 5) + (newCore.karmicLessons.length <= 2 ? 10 : 3);
  return {
    core: newCore,
    compatibility: Math.min(100, score),
    recommendation: score >= 80 ? "Excellent name alignment" : score >= 60 ? "Good alignment with some tension" : "Consider adjustments — significant friction with Life Path",
  };
}
