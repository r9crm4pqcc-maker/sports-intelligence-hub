// ─── Feng Shui for Cristian Zavala ──────────────────────────────────────────
// DOB: September 8, 2009, Male
// Kua Number calculation: Year 2009 → 2+0+0+9=11→1+1=2
// Male born after 2000: 9−2=7… wait, the CORRECT post-2000 male formula:
//   Last two digits: 09 → 0+9=9 → 9−9=0 → if 0 becomes 9 → Kua 9

export interface FengShuiProfile {
  kuaNumber: number;
  kuaName: string;
  kuaGroup: "East" | "West";
  element: string;
  lifePathElement: string;
  bestDirections: DirectionInfo[];
  worstDirections: DirectionInfo[];
  roomAdvice: RoomAdvice[];
  colorTherapy: ColorAdvice[];
  numberAddress: AddressInfo;
  interpretation: string;
}

export interface DirectionInfo {
  direction: string;
  code: string;
  benefit: string;
  strength: "Best" | "Good" | "Moderate" | "Avoid" | "Worst";
  activate: string;
}

export interface RoomAdvice {
  room: string;
  bestLocation: string;
  avoidLocation: string;
  tip: string;
}

export interface ColorAdvice {
  purpose: string;
  colors: string[];
  avoid: string[];
  why: string;
}

export interface AddressInfo {
  example: string;
  reduction: number;
  meaning: string;
  formula: string;
}

const PROFILE: FengShuiProfile = {
  kuaNumber: 9,
  kuaName: "Li (Fire)",
  kuaGroup: "East",
  element: "Fire",
  lifePathElement: "Fire (Life Path 1 / Sun)",

  bestDirections: [
    {
      direction: "East (E)", code: "Sheng Qi",
      benefit: "SUCCESS & WEALTH — Primary prosperity direction. Face East when working, studying, or making important decisions.",
      strength: "Best",
      activate: "Place a water feature or wealth bowl in the East sector. Keep well-lit and energized.",
    },
    {
      direction: "Southeast (SE)", code: "Tian Yi",
      benefit: "HEALTH — Your healing direction. Sleep with head pointing Southeast for recovery and physical strength.",
      strength: "Good",
      activate: "Keep this sector clean. Add a healthy plant or water element for healing energy.",
    },
    {
      direction: "North (N)", code: "Yan Nian",
      benefit: "LONGEVITY & RELATIONSHIPS — Social success, teamwork, and partnership harmony. Face North for team activities.",
      strength: "Good",
      activate: "Place relationship photos or water features in the North sector.",
    },
    {
      direction: "South (S)", code: "Fu Wei",
      benefit: "PERSONAL GROWTH — Stability, self-improvement, and mental focus. Face South when studying or training.",
      strength: "Moderate",
      activate: "Study desk or meditation space facing South activates personal power.",
    },
  ],

  worstDirections: [
    {
      direction: "West (W)", code: "Jue Ming",
      benefit: "TOTAL LOSS — Worst direction for Kua 9. Avoid sleeping, working, or studying facing West at all costs.",
      strength: "Worst",
      activate: "Block with heavy furniture. Never sit with back to West-facing wall during important activities.",
    },
    {
      direction: "Northeast (NE)", code: "Huo Hai",
      benefit: "ACCIDENTS & MISHAPS — Avoid for sports, physical activities, and critical work.",
      strength: "Avoid",
      activate: "Keep clear of clutter but do not activate. Not ideal for training rooms.",
    },
    {
      direction: "Southwest (SW)", code: "Wu Gui",
      benefit: "FIVE GHOSTS — Financial disputes, backstabbing, and misunderstandings. Avoid for important meetings.",
      strength: "Avoid",
      activate: "Place still water or salt cure to neutralize this sector's energy.",
    },
    {
      direction: "Northwest (NW)", code: "Liu Sha",
      benefit: "SIX KILLINGS — Health issues, obstacles, and betrayal. Never sleep with head pointing Northwest.",
      strength: "Avoid",
      activate: "Use metal wind chimes or crystals to deflect. Never place bedroom in true NW.",
    },
  ],

  roomAdvice: [
    { room: "Bedroom", bestLocation: "East or Southeast sector of home", avoidLocation: "West or Southwest sector", tip: "Head of bed pointing Southeast for health recovery. Avoid mirrors reflecting bed." },
    { room: "Study / Training Room", bestLocation: "South corner, facing East", avoidLocation: "West or Northeast corner", tip: "Face East while studying for maximum mental power (Sheng Qi direction)." },
    { room: "Kitchen", bestLocation: "East or North area", avoidLocation: "West", tip: "Fire element (stove) in your favorable direction amplifies Kua 9 Fire energy naturally." },
    { room: "Main Entrance", bestLocation: "East or Southeast facing", avoidLocation: "West or Southwest facing", tip: "If entrance faces your inauspicious direction, place a Bagua mirror outside to redirect energy." },
    { room: "Soccer Training / Practice Area", bestLocation: "Face East or South during drills", avoidLocation: "Facing West during key practice", tip: "Performance peak when facing East. Warm up facing SE (Tian Yi health direction)." },
  ],

  colorTherapy: [
    { purpose: "Performance & Success", colors: ["Red", "Orange", "Purple", "Green", "Brown"], avoid: ["White", "Silver", "Gray"], why: "Fire and Wood colors support Kua 9. Wood feeds Fire in the Five Elements cycle — these enhance your personal power." },
    { purpose: "Health & Recovery", colors: ["Green", "Brown", "Teal", "Beige"], avoid: ["White", "Silver"], why: "Wood colors (Green/Brown) fuel Fire energy. Support physical recovery and vitality for Kua 9." },
    { purpose: "Bedroom (Sleep)", colors: ["Soft Green", "Cream", "Beige", "Light Brown", "Warm Pink"], avoid: ["Bright White", "Gray", "Strong Blue"], why: "Gentle Wood and Earth tones for Kua 9 bedroom create nourishing, restorative energy." },
    { purpose: "Training Gear", colors: ["Red", "Gold", "Orange", "Black"], avoid: [], why: "GG33 Number 1 (Life Path) = Red/Gold. Number 8 (Birthday/Personality) = Black/Gold. Fire Kua 9 amplifies Red/Orange." },
    { purpose: "Lucky Kit Colors", colors: ["Red", "Gold", "Black", "Orange", "Purple"], avoid: ["White", "Silver"], why: "LP1 = Red/Gold + Birthday 8 = Black/Gold + Kua 9 Fire = Red/Orange/Purple creates ultimate activation." },
  ],

  numberAddress: {
    example: "1234 N Main Street",
    reduction: 1,
    meaning: "Reduce all digits in address number to single digit. Match against your Kua (9) or Life Path (1) for harmony score.",
    formula: "Sum all digits of house number → reduce to single digit → compare to Kua 9 and LP 1",
  },

  interpretation: "As a Kua 9 (Li trigram, Fire element), your power flows from illumination, visibility, and brilliance toward the East. Your Life Path 1 is also ruled by the Sun — Fire + Fire creates a powerhouse of initiative, leadership, and spotlight energy. Your strongest activation: study, train, and make important decisions facing East. Sleep with head pointing Southeast. Keep your West sector quiet and never activate it. For soccer: always warm up and practice facing your favorable directions (E, SE, S) to draw maximum Fire energy into your physical performance. Fire people need Wood to fuel them — surround yourself with green, growth, and natural materials.",
};

export const FENG_SHUI = PROFILE;

export function calcAddressNumber(addressNum: string): { compound: number; reduced: number; harmony: string } {
  const digits = addressNum.replace(/\D/g, "");
  const compound = [...digits].reduce((a, d) => a + +d, 0);
  let reduced = compound;
  while (reduced > 9) {
    reduced = [...String(reduced)].reduce((a, d) => a + +d, 0);
  }
  const harmony =
    reduced === 9 ? "PERFECT — Matches your Kua 9 and Personal Year 2026" :
    reduced === 1 ? "EXCELLENT — Matches your Life Path 1 and Sun energy" :
    reduced === 8 ? "Good — 8 is your Birthday and Personality number" :
    reduced === 4 ? "Good — 4 is your Maturity number" :
    reduced === 3 ? "Moderate — 3 is your Expression number" :
    reduced === 6 ? "Neutral — Not your core numbers but 6 = harmony/family" :
    "Check — Reduce and cross-reference with your core numbers";
  return { compound, reduced, harmony };
}

export const FLYING_STARS_2026: { star: number; sector: string; element: string; effect: string; remedy: string }[] = [
  { star: 5, sector: "Center", element: "Earth", effect: "DANGER — 5 Yellow star in center affects whole home. Most inauspicious in 2026.", remedy: "Hang 6 metal coins or wind chime in center. Salt cure bowls." },
  { star: 8, sector: "Northeast", element: "Earth", effect: "WEALTH — Annual 8 Wealth star in NE. Activate for prosperity.", remedy: "Place bright light, crystals, or wealth bowl in NE sector. Face NE daily." },
  { star: 9, sector: "South", element: "Fire", effect: "FUTURE WEALTH — 9 is the upcoming prosperity star. Matches your Kua 9!", remedy: "Place red/orange objects or candle in South to activate. Double power for Kua 9." },
  { star: 1, sector: "North", element: "Water", effect: "Career & success energy. Activate for work progress. North is your Yan Nian (relationships).", remedy: "Water feature or blue objects in North boost career and relationships in 2026." },
  { star: 6, sector: "Northwest", element: "Metal", effect: "Authority and power BUT NW is your Liu Sha (Six Killings). Be cautious.", remedy: "Metal objects in NW enhance authority but may clash with Kua 9 Fire. Use sparingly." },
  { star: 2, sector: "East", element: "Earth", effect: "ILLNESS — Sickness star in YOUR best direction (Sheng Qi). Protect East in 2026!", remedy: "Hang metal wind chime or place Wu Lou gourd in East sector. Critical for Kua 9." },
  { star: 3, sector: "Southeast", element: "Wood", effect: "CONFLICT — Argumentative energy in your Tian Yi (health) sector. Keep SE calm.", remedy: "Place red envelope or fire element to exhaust conflict. Keep quiet." },
  { star: 4, sector: "West", element: "Wood", effect: "Academic & creativity energy, but West is your Jue Ming (worst). Do NOT activate.", remedy: "Leave West alone. Despite the positive star, your Kua overrides — never activate Jue Ming." },
  { star: 7, sector: "Southwest", element: "Metal", effect: "ROBBERY/LOSS — SW is already your Wu Gui (Five Ghosts). Double negative in 2026.", remedy: "Blue rhino or elephant figurine in SW. Salt cure. Avoid storing valuables here." },
];
