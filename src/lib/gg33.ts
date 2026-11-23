// GG33 number compatibility matrix + GG33 colorology (user-supplied, ground truth).
export type Rel = "friendly" | "neutral" | "enemy";
interface Row { friendly: Record<number, number | null>; enemy: number[] }
const f = (pairs: (number | [number, number])[]) =>
  Object.fromEntries(pairs.map(p => (Array.isArray(p) ? p : [p, null]))) as Record<number, number | null>;

export const COMPAT: Record<number, Row> = {
  11: { friendly: f([[7, 99], [1, 93], [3, 80]]), enemy: [9] },
  28: { friendly: f([[1, 93], [8, 86], [7, 80], [28, 80], [2, 80], [3, 80]]), enemy: [9] },
  1: { friendly: f([[11, 93], [7, 90], [28, 80], [8, 80], [2, 80], [1, 80]]), enemy: [9] },
  2: { friendly: f([[8, 85], [28, 80], [1, 80], [3, 80]]), enemy: [9] },
  9: { friendly: f([[4, 80], [5, 80], [6, 80]]), enemy: [9, 7, 22, 11, 28, 33, 1, 2] },
  8: { friendly: f([1, 28, 2, 6, 5, 22, 4, 3, 33, 8]), enemy: [7] },
  7: { friendly: f([[11, 99], [28, 93], [1, 90], [5, 80], [4, 80], [22, 80]]), enemy: [9, 6, 8] },
  6: { friendly: f([[4, 96], [9, 80], [8, 80], [22, 80], [3, 80]]), enemy: [7, 5] },
  5: { friendly: f([[3, 91], [33, 85], [5, 85], [7, 80], [9, 80], [8, 80]]), enemy: [22, 4, 6] },
  22: { friendly: f([[8, 85], [6, 80], [7, 80]]), enemy: [5, 9] },
  4: { friendly: f([[6, 96], [9, 80], [8, 80], [7, 80], [4, 80], [2, 80]]), enemy: [5, 3] },
  3: { friendly: f([[5, 91], [8, 88], [6, 80], [28, 80], [11, 80], [33, 80], [3, 80], [2, 80]]), enemy: [4] },
  33: { friendly: f([[8, 90], [5, 85], [3, 80]]), enemy: [9] },
};

/** Relation of `b` from `a`'s row in the GG33 chart. */
export function compat(a: number, b: number): { rel: Rel; pct: number | null } {
  const row = COMPAT[a];
  if (!row) return { rel: "neutral", pct: null };
  if (row.enemy.includes(b)) return { rel: "enemy", pct: null };
  if (b in row.friendly) return { rel: "friendly", pct: row.friendly[b] };
  return { rel: "neutral", pct: null };
}

/** GG33 colorology: number → colors. */
export const GG33_COLORS: Record<number, string[]> = {
  1: ["white", "grey", "gray", "beige", "crimson", "bisque"],
  3: ["yellow", "red", "neon", "lime"],
  4: ["green", "blue", "maroon", "indigo", "emerald"],
  5: ["red", "yellow", "lime", "auburn"],
  6: ["orange", "yellow"],
  7: ["yellow", "gold", "purple", "violet", "black", "white", "magenta", "cyan", "electric blue"],
  8: ["aquamarine", "aqua marine", "azure", "bronze"],
  9: ["red", "brown", "carmine", "olive", "lavender", "denim"],
  11: ["yellow", "gold", "purple", "black", "white", "ivory", "forest green", "magenta"],
  22: ["baby blue", "light blue", "green", "emerald"],
  33: ["orange", "white", "black", "yellow"],
};

/** All GG33 numbers a color carries (multi-word names matched first, e.g. "light blue" → 22). */
export function colorNumbers(name: string): number[] {
  const n = name.trim().toLowerCase();
  const out: number[] = [];
  for (const [num, list] of Object.entries(GG33_COLORS)) {
    if (list.some(c => c.includes(" ") ? n.includes(c) : n === c)) out.push(Number(num));
  }
  if (out.length) return out;
  const last = n.split(/\s+/).pop() ?? "";
  for (const [num, list] of Object.entries(GG33_COLORS)) if (list.includes(last)) out.push(Number(num));
  return out;
}

/** Score a color against the day: +1 if any of its numbers is the day or friendly, −1 if any is an enemy (e.g. red carries 9 → bad on a 1 day; red on a 9 day too). */
export function colorFit(name: string, day: number): number {
  const nums = colorNumbers(name);
  if (!nums.length) return 0;
  const bad = nums.some(c => compat(day, c).rel === "enemy" || compat(c, day).rel === "enemy");
  if (bad) return -1;
  return nums.some(c => c === day || compat(day, c).rel === "friendly") ? 1 : 0;
}
