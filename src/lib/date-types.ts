import type { ListKind } from "./life-studio";
const DATE_TYPES: Record<ListKind, { label: string; meaning: string }> = {
  soulmate: { label: "Soulmate", meaning: "Good for starting things and new beginnings." },
  beneficial: { label: "Beneficial", meaning: "Broadly beneficial; not limited to one activity." },
  love: { label: "Love & friendship", meaning: "Supportive connection energy, not limited to romance." },
  wealth: { label: "Wealth", meaning: "Wealth energy is present in this date." },
  fatal: { label: "Fatal attraction", meaning: "A caution date in your chart." },
  challenging: { label: "Challenging", meaning: "A challenging date in your chart." },
  "twenty-eight": { label: "28", meaning: "28 energy is present in this date." },
  master: { label: "Master", meaning: "Master-number energy is present in this date." },
};
export function dateTypes(tones: ListKind[]) {
  return [...new Set(tones)].map(type => ({ type, ...DATE_TYPES[type] }));
}