// ShemUniverse Colorology — every color number is derived from PYTHAGOREAN
// numerology of the color's name (no hardcoded values).
// Master numbers 11 / 22 / 33 and the 28 wealth compound are preserved,
// and 20 is a hidden 11 (never reduces to 2).

import { pythagoreanValue } from "./numerology";

export interface ColorEntry {
  name: string;
  number: number;      // pythagorean energy (master-aware)
  compound: number;    // raw pythagorean sum
  hex: string;
  category: "black" | "grey" | "white" | "rainbow" | "metal" | "gem" | "neon";
  friendly: boolean; // in the 11/1/3/7/28/8 stack
  enemy: boolean;    // pure Red=9 flag
}

const F = new Set([11, 1, 3, 7, 28, 8]);
const KEEP_COMPOUND = new Set([11, 22, 33, 28]);

/** Pythagorean color energy: keep 11/22/33/28, 20 = hidden 11, else reduce. */
export function colorNumber(name: string): { number: number; compound: number } {
  const { compound, reduced } = pythagoreanValue(name);
  return { number: KEEP_COMPOUND.has(compound) ? compound : reduced, compound };
}

function mk(name: string, hex: string, category: ColorEntry["category"]): [string, ColorEntry] {
  const { number, compound } = colorNumber(name);
  return [
    name.toLowerCase(),
    { name, number, compound, hex, category, friendly: F.has(number), enemy: number === 9 },
  ];
}

export const COLOR_MAP: Record<string, ColorEntry> = Object.fromEntries([
  // Blacks
  mk("Black","#000000","black"), mk("Light Black","#454545","black"),
  mk("Matte Black","#28282B","black"), mk("Licorice","#1B1212","black"),
  mk("Jet Black","#343434","black"), mk("Asphalt","#0C0404","black"),
  mk("Eerie Black","#1B1B1B","black"),
  // Greys
  mk("Grey","#808080","grey"), mk("Gray","#808080","grey"),
  mk("Light Grey","#D3D3D3","grey"), mk("Abbey","#494F55","grey"),
  mk("Ash Grey","#666362","grey"), mk("Granite","#676767","grey"),
  mk("Steel","#777B7E","grey"), mk("Moon Grey","#909090","grey"),
  mk("Fossil","#7D7981","grey"), mk("Charcoal","#36454F","grey"),
  // Whites / lights
  mk("White","#FFFFFF","white"), mk("Ice Blue","#BDDEEC","white"),
  mk("Sky Blue","#87CEEB","white"), mk("Ivory","#FFFFF0","white"),
  mk("Eggshell","#F0EAD6","white"), mk("Baby Powder","#FEFEFA","white"),
  mk("Off White","#FAF9F6","white"), mk("Mint Cream","#F5FFFA","white"),
  mk("Azure","#F0FFFF","white"), mk("Cream","#FFFDD0","white"),
  // Rainbow spectrum
  mk("Rainbow","#FFFFFF","rainbow"),
  mk("Red","#FF0000","rainbow"), mk("Orange","#FFA500","rainbow"),
  mk("Yellow","#FFFF00","rainbow"), mk("Green","#008000","rainbow"),
  mk("Blue","#0000FF","rainbow"), mk("Navy","#000080","rainbow"),
  mk("Royal Blue","#4169E1","rainbow"), mk("Light Blue","#ADD8E6","rainbow"),
  mk("Turquoise","#40E0D0","rainbow"), mk("Teal","#008080","rainbow"),
  mk("Indigo","#4B0082","rainbow"), mk("Crimson","#DC143C","rainbow"),
  mk("Purple","#A020F0","rainbow"), mk("Violet","#8F00FF","rainbow"),
  mk("Pink","#FFC0CB","rainbow"),
  // Metals
  mk("Gold","#FFD700","metal"), mk("Silver","#C0C0C0","metal"),
  mk("Copper","#B87333","metal"), mk("Bronze","#CD7F32","metal"),
  mk("Iron","#A19D94","metal"), mk("Brass","#B5A642","metal"),
  mk("Aluminum","#A9A9A9","metal"), mk("Titanium","#878681","metal"),
  mk("Platinum","#E5E4E2","metal"), mk("Iridescent","#C9E4F6","metal"),
  // Gems
  mk("Emerald","#50C878","gem"), mk("Amethyst","#9966CC","gem"),
  mk("Diamond","#B9F2FF","gem"), mk("Ruby","#9B111E","gem"),
  mk("Sapphire","#0F52BA","gem"), mk("Garnet","#733635","gem"),
  mk("Opal","#A8C3BC","gem"), mk("Lapis Lazuli","#26619C","gem"),
  // Neons
  mk("Neon Red","#FF3131","neon"), mk("Neon Orange","#FF5F1F","neon"),
  mk("Neon Yellow","#FFFF33","neon"), mk("Neon Green","#39FF14","neon"),
  mk("Neon Blue","#1B03A3","neon"), mk("Neon Purple","#B026FF","neon"),
  mk("Neon Pink","#FF10F0","neon"), mk("UV","#5F00FF","neon"),
]);

export function colorLookup(name: string): ColorEntry | null {
  if (!name) return null;
  const key = name.trim().toLowerCase();
  if (COLOR_MAP[key]) return COLOR_MAP[key];
  // Unknown color name → still decode it with Pythagorean numerology.
  const letters = key.replace(/[^a-z]/g, "");
  if (!letters) return null;
  const { number, compound } = colorNumber(name);
  return {
    name: name.trim(),
    number,
    compound,
    hex: "#888888",
    category: "rainbow",
    friendly: F.has(number),
    enemy: number === 9,
  };
}

export function dominantColor(colors?: string[]): ColorEntry | null {
  if (!colors?.length) return null;
  for (const c of colors) { const hit = colorLookup(c); if (hit) return hit; }
  return null;
}

/** Best colors for any target number — ranked by Pythagorean resonance. */
export function bestColorsFor(target: number, limit = 6): ColorEntry[] {
  const all = Object.values(COLOR_MAP);
  const score = (c: ColorEntry) => {
    let s = 0;
    if (c.number === target) s += 100;
    if (c.compound === target) s += 60;
    if (c.friendly) s += 25;
    if (c.enemy && target !== 9) s -= 40;
    if (KEEP_COMPOUND.has(c.number)) s += 10;
    return s;
  };
  return [...all]
    .filter((c, i, a) => a.findIndex(x => x.name === c.name) === i)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

/** Context-aware letterology guidance. Red (18/9) conflicts with a universal 9; Black (11) is favored on 11. */
export function colorsForDay(target: number, limit = 6): { best: ColorEntry[]; avoid: ColorEntry[] } {
  const all = Object.values(COLOR_MAP).filter((c, i, a) => a.findIndex(x => x.name === c.name) === i);
  const avoid = all.filter(c => (target === 9 && c.name === "Red") || (c.enemy && c.number !== target));
  const best = bestColorsFor(target, limit).filter(c => !avoid.some(a => a.name === c.name));
  if (target === 11) {
    const black = colorLookup("Black");
    if (black) return { best: [black, ...best.filter(c => c.name !== "Black")].slice(0, limit), avoid };
  }
  return { best, avoid };
}

// Which side gets the colorology edge.
export function colorTier(a: ColorEntry | null, b: ColorEntry | null): "A" | "B" | "even" | "unknown" {
  if (!a || !b) return "unknown";
  if (a.enemy && !b.enemy) return "B";
  if (b.enemy && !a.enemy) return "A";
  if (a.friendly && !b.friendly) return "A";
  if (b.friendly && !a.friendly) return "B";
  return "even";
}
