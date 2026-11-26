import { colorNumber } from "./colorology";
/** Your own power colors; the day only chooses which one leads. */
export const MY_POWER_COLORS = ["Black", "White", "Orange", "Green"] as const;
const FRIENDLY = new Set([11, 1, 3, 7, 28, 8]);
export function bestPowerColorFor(dayNumber: number): { best: string; rest: string[] } {
  const scored = MY_POWER_COLORS.map((name, i) => { const n = colorNumber(name).number; return { name, score: (n === dayNumber ? 2 : 0) + (FRIENDLY.has(n) ? 1 : 0) - i * 0.01 }; });
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0]!.name;
  return { best, rest: MY_POWER_COLORS.filter(c => c !== best) };
}
