// ─── BaZi (Four Pillars of Destiny) for Cristian Zavala ──────────────────────
// DOB: September 8, 2009, 11:18 AM, Chicago IL

export interface BaZiPillar {
  stem: string;       // Heavenly Stem (天干)
  branch: string;     // Earthly Branch (地支)
  element: string;    // Element of Stem
  animal: string;     // Animal of Branch
  stemPolarity: "Yang" | "Yin";
  branchElement: string;
  hiddenStems: string[];
}

export interface BaZiChart {
  year: BaZiPillar;
  month: BaZiPillar;
  hour: BaZiPillar;
  dayMaster: string;
  dayMasterElement: string;
  dayMasterPolarity: "Yang" | "Yin";
  chineseAnimal: string;
  chineseElement: string;
  strongElements: string[];
  weakElements: string[];
  favorableElements: string[];
  unfavorableElements: string[];
  dayMasterStrength: "Strong" | "Moderate" | "Weak";
  luckPillars: LuckPillar[];
  interpretation: string;
  athleticTiming: string;
  sportOverlay: string;
}

export interface LuckPillar {
  age: string;
  yearRange: string;
  stem: string;
  branch: string;
  element: string;
  theme: string;
  sports: string;
}

// Heavenly Stems
const STEMS: Record<string, { element: string; polarity: "Yang" | "Yin"; planet: string }> = {
  Jia:  { element: "Wood",  polarity: "Yang", planet: "Jupiter" },
  Yi:   { element: "Wood",  polarity: "Yin",  planet: "Jupiter" },
  Bing: { element: "Fire",  polarity: "Yang", planet: "Sun/Mars" },
  Ding: { element: "Fire",  polarity: "Yin",  planet: "Mars" },
  Wu:   { element: "Earth", polarity: "Yang", planet: "Saturn" },
  Ji:   { element: "Earth", polarity: "Yin",  planet: "Saturn" },
  Geng: { element: "Metal", polarity: "Yang", planet: "Venus" },
  Xin:  { element: "Metal", polarity: "Yin",  planet: "Venus" },
  Ren:  { element: "Water", polarity: "Yang", planet: "Mercury" },
  Gui:  { element: "Water", polarity: "Yin",  planet: "Mercury" },
};

// Earthly Branches
const BRANCHES: Record<string, { element: string; animal: string; hidden: string[] }> = {
  Zi:   { element: "Water", animal: "Rat",     hidden: ["Gui"] },
  Chou: { element: "Earth", animal: "Ox",      hidden: ["Ji","Gui","Xin"] },
  Yin:  { element: "Wood",  animal: "Tiger",   hidden: ["Jia","Bing","Wu"] },
  Mao:  { element: "Wood",  animal: "Cat",  hidden: ["Yi"] },
  Chen: { element: "Earth", animal: "Dragon",  hidden: ["Wu","Yi","Gui"] },
  Si:   { element: "Fire",  animal: "Snake",   hidden: ["Bing","Geng","Wu"] },
  Wu:   { element: "Fire",  animal: "Horse",   hidden: ["Ding","Ji"] },
  Wei:  { element: "Earth", animal: "Goat",    hidden: ["Ji","Ding","Yi"] },
  Shen: { element: "Metal", animal: "Monkey",  hidden: ["Geng","Ren","Wu"] },
  You:  { element: "Metal", animal: "Rooster", hidden: ["Xin"] },
  Xu:   { element: "Earth", animal: "Dog",     hidden: ["Wu","Xin","Ding"] },
  Hai:  { element: "Water", animal: "Pig",     hidden: ["Ren","Jia"] },
};

function makePillar(stemName: string, branchName: string): BaZiPillar {
  const s = STEMS[stemName];
  const b = BRANCHES[branchName];
  return {
    stem: stemName,
    branch: branchName,
    element: s.element,
    animal: b.animal,
    stemPolarity: s.polarity,
    branchElement: b.element,
    hiddenStems: b.hidden,
  };
}

// Cristian Zavala — Sep 8, 2009, 11:18 AM Chicago
// Year Pillar: 2009 = Ji Chou (Earth Ox)
// Month Pillar: Sep 2009 = Xin You (Metal Rooster — month 8 Rooster month, stem Xin from Ji year cycle)
// Hour Pillar: 11:18 AM = Wu hour (11am–1pm), using the Gui day stem → Geng Wu (Metal Horse)

const CHART: BaZiChart = {
  year:  makePillar("Ji", "Chou"),
  month: makePillar("Xin", "You"),
  hour:  makePillar("Geng", "Wu"),

  dayMaster: "Gui",
  dayMasterElement: "Water",
  dayMasterPolarity: "Yin",

  chineseAnimal: "Ox",
  chineseElement: "Yin Earth (Ji)",

  // Gui (Yin Water) Day Master analysis:
  // Chart has: Ji (Earth), Xin (Metal), Gui (Water), Geng (Metal)
  // Year, month, and hour branches: Chou (Earth), You (Metal), Wu (Fire)
  // Metal generates Water → Water is supported
  // Wood from Mao drains Water → neutral
  // Fire from Wu controls Metal somewhat
  // Earth from Chou controls Water (unfavorable)
  // Overall: Gui Water is moderately strong with Metal support

  dayMasterStrength: "Moderate",
  strongElements: ["Metal", "Water"],
  weakElements: ["Fire", "Wood"],
  favorableElements: ["Metal", "Water", "Wood"],   // Metal produces Water (support), Wood outputs Water's energy
  unfavorableElements: ["Earth", "Fire"],           // Earth controls Water, Fire drains Metal

  luckPillars: [
    { age: "1–10",  yearRange: "2010–2019", stem: "Ren", branch: "Shen", element: "Water/Metal", theme: "Early development — Water & Metal pillars support Gui DM. Athletic foundation built.", sports: "Build base skills and physical conditioning" },
    { age: "11–20", yearRange: "2020–2029", stem: "Xin", branch: "Wei",  element: "Metal/Earth", theme: "Current pillar — Xin Metal feeds Water. Some Earth (Wei) tension but Metal dominates. Athletic prime beginning.", sports: "Transition to elite performance. 2026–2027 breakout window." },
    { age: "21–30", yearRange: "2030–2039", stem: "Geng", branch: "Wu",  element: "Metal/Fire",  theme: "Mixed pillar — Geng Metal support + Wu Fire tension. Peak athletic years. High competition.", sports: "Professional level. Financial breakthroughs. Sign major contracts." },
    { age: "31–40", yearRange: "2040–2049", stem: "Ji",  branch: "Si",   element: "Earth/Fire",  theme: "Challenging pillar — Earth & Fire unfavorable for Gui Water. Transformation phase.", sports: "Coaching, leadership, brand building over active play." },
    { age: "41–50", yearRange: "2050–2059", stem: "Wu",  branch: "Chen", element: "Earth",       theme: "Stabilization — Earth structures career and legacy. Management roles.", sports: "Authority and ownership roles in sports organizations." },
  ],

  interpretation: "Gui Yin Water Day Master — You are the 'rain' archetype: nourishing, adaptable, deeply intuitive, and capable of permeating any obstacle like water through rock. Metal (your Year and Hour pillars) generates and supports you. Your chart has strong Water+Metal combination which in Chinese astrology represents intelligence, precision, strategic thinking, and emotional depth. The Ox (year animal) gives you extraordinary endurance and discipline. The Rooster month gives precision and critical eye. Your chart is built for methodical excellence — not flash, but unstoppable consistency.",

  athleticTiming: "Your current Luck Pillar (Xin Wei, ages 11–20, 2020–2029) is Metal+Earth. Metal feeds your Gui Water Day Master — this is a supportive period for skill development and rising recognition. The window of 2026–2028 is activated by your Personal Year 9→1 transition (9-year cycle) AND your Luck Pillar favorability — this is your breakout period. Commit to maximum performance training during this window.",

  sportOverlay: "Soccer/Winger position: Water element in sports manifests as fluid movement, adaptability, reading the game (intuition), and finding space. Ox year gives iron stamina. Rooster month gives precision passing and positioning.",
};

export const BAZI = CHART;

// Chinese Zodiac compatibility for sports predictions
export const ZODIAC_COMPAT: Record<string, { score: number; note: string }> = {
  Rat:    { score: 85, note: "Excellent — Rat and Ox form a natural union. High synergy." },
  Ox:     { score: 70, note: "Good — Ox self-combination. Natural but can be slow." },
  Tiger:  { score: 60, note: "Moderate — Tiger-Ox conflict. Competition energy." },
  Cat:    { score: 90, note: "Excellent — Cat energy supports natural flow." },
  Dragon: { score: 75, note: "Good — Dragon and Ox share Earth element." },
  Snake:  { score: 80, note: "Very good — Snake and Ox form a Metal semi-combination." },
  Horse:  { score: 50, note: "Challenging — Horse and Ox are in clash. Heightened pressure." },
  Goat:   { score: 45, note: "Difficult — Goat and Ox are in direct clash. Karmic friction." },
  Monkey: { score: 85, note: "Very good — Monkey and Ox support each other." },
  Rooster:{ score: 95, note: "Peak — Rooster is your Month branch. Maximum resonance." },
  Dog:    { score: 60, note: "Moderate — Dog and Ox are in a penalty relationship." },
  Pig:    { score: 75, note: "Good — Pig supports Water element chain." },
};

// Five Element seasons for athletic timing
export const ELEMENT_SEASONS: Record<string, { season: string; months: string; sports: string; training: string }> = {
  Wood:  { season: "Spring", months: "Feb–Apr", sports: "Peak agility and creative play. Best for skills training.", training: "Flexibility, technical drills, creative movement" },
  Fire:  { season: "Summer", months: "May–Jul", sports: "High energy. Push hard but watch overexertion. Fire = unfavorable for Gui Water.", training: "Conditioning, sprints, but rest before key matches in peak summer" },
  Earth: { season: "Late summer", months: "Jul–Sep", sports: "Stable base energy. Good for endurance.", training: "Endurance, strength building, recovery" },
  Metal: { season: "Autumn", months: "Aug–Oct", sports: "PEAK — Metal feeds Gui Water DM. Best match performance.", training: "Peak output. Enter key tournaments. Maximum tactical sharpness." },
  Water: { season: "Winter", months: "Nov–Jan", sports: "Strong self-element. Good for flow states and visualization.", training: "Recovery, mental training, strategy study" },
};
