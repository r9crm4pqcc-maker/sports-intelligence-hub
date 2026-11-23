/** User-supplied primary mappings. Broader correspondences are intentionally not randomised. */
export const COLOR_PRIMARY: Record<string, number | readonly number[]> = {
  red: 9, crimson: 1, black: 11, white: 11, blue: 4, navy: 4, green: 4,
  yellow: 11, purple: 7, violet: 7, orange: 33, gold: 11, grey: [28, 1], gray: [28, 1],
  pink: 5, brown: 9, maroon: 4, indigo: 4, emerald: 4, magenta: 7, cyan: 7,
  // Cream follows the existing white/ivory 11 mapping; no separate code is assigned.
  azure: 8, bronze: 8, ivory: 11, cream: 11, beige: 1, bisque: 1, lime: 3, auburn: 5,
  olive: 9, lavender: 9, denim: 9, "forest green": 11, "light blue": 22,
  "baby blue": 22, "electric blue": 7, "aqua marine": 8, aqua: 8, teal: 8,
  silver: 4, pewter: 1, burgundy: 1, scarlet: 9,
};
export function learnedColorNumbers(name: string): number[] {
  const n = name.trim().toLowerCase();
  const value = COLOR_PRIMARY[n];
  if (value == null) return [];
  return typeof value === "number" ? [value] : [...value];
}
export function learnedColorNumber(name: string): number | null {
  return learnedColorNumbers(name)[0] ?? null;
}
export function learnedColorLabel(name: string): string {
  return learnedColorNumbers(name).join("/") || "?";
}

const COLOR_MASTERS = new Set([11, 22, 33]);
const digitSum = (value: number) => String(Math.abs(Math.trunc(value))).split("").reduce((sum, digit) => sum + Number(digit), 0);

export interface TeamLogoColorCode {
  compound: number;
  reduced: number;
  partial33: boolean;
  unmappedColors: string[];
}

function reduceColorCode(value: number): number {
  let result = value;
  while (result > 9 && !COLOR_MASTERS.has(result)) result = digitSum(result);
  return result === 2 && value !== 2 ? 11 : result;
}

/** Sum each distinct mapped logo color once; slash-mapped colors use their compound value. */
export function sumTeamLogoColors(colors: readonly string[] = []): TeamLogoColorCode | null {
  const uniqueColors = [...new Set(colors.map((color) => color.trim()).filter(Boolean))];
  const values = uniqueColors.map((color) => ({ color, code: learnedColorNumber(color) }));
  const mapped = values.filter((value): value is { color: string; code: number } => value.code !== null);
  if (mapped.length === 0) return null;
  const compound = mapped.reduce((sum, value) => sum + value.code, 0);
  return {
    compound,
    reduced: reduceColorCode(compound),
    partial33: compound === 13,
    unmappedColors: values.filter((value) => value.code === null).map((value) => value.color),
  };
}

export function teamLogoColorCodeLabel(colors: readonly string[] = []): string {
  const code = sumTeamLogoColors(colors);
  if (!code) return "not available";
  const value = code.compound === code.reduced ? `${code.compound}` : `${code.compound}/${code.reduced}`;
  const partial33 = code.partial33 ? " · partial 33 frequency" : "";
  const incomplete = code.unmappedColors.length ? ` · incomplete (${code.unmappedColors.join(", ")} unmapped)` : "";
  return `${value}${partial33}${incomplete}`;
}

const SWATCHES: Record<string, string> = {
  Red: "#d42432", Crimson: "#800018", Black: "#101010", White: "#ffffff",
  Blue: "#0055bb", Navy: "#001b45", Green: "#008044", Yellow: "#ffe200",
  Purple: "#702f91", Orange: "#ef701a", Gold: "#d4a530", Grey: "#888888", Cream: "#f5f5dc",
  Pink: "#ef7ba9", Brown: "#673a24", Maroon: "#500020", "Light Blue": "#80c9e9",
  Teal: "#008c92",
};
/** Deterministic nearest named color from official logo/brand-color metadata. */
export function logoColorName(hex: string): string | null {
  const raw = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(raw)) return null;
  const rgb = (x: string) => [0, 2, 4].map(i => parseInt(x.replace("#", "").slice(i, i + 2), 16));
  const target = rgb(raw);
  return Object.entries(SWATCHES).map(([name, h]) => ({name, distance: rgb(h).reduce((s, c, i) => s + (c - target[i]) ** 2, 0)})).sort((a,b) => a.distance-b.distance)[0].name;
}
