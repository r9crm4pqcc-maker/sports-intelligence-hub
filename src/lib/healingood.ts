// Healingood 366-day birthday chart (Crawford & Sullivan, "The Power of Birthdays, Stars & Numbers").
// Packed: one entry per day of a leap year; 5 lists separated by "|", each date = 2 base-36 chars (day index 0–365).
import PACK from "./healingood-data.json";

export type HealingoodKey = "lovers" | "beneficial" | "fatal" | "challenging" | "soulmate";
const ORDER: HealingoodKey[] = ["lovers", "beneficial", "fatal", "challenging", "soulmate"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CUM = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

const indexOf = (m: number, d: number) => CUM[m - 1] + d - 1;
function toDate(i: number): [number, number] {
  let m = 11; while (CUM[m] > i) m--;
  return [m + 1, i - CUM[m] + 1];
}

export type HealingoodDates = Record<HealingoodKey, [number, number][]>;
export function healingood(m: number, d: number): HealingoodDates {
  const raw = (PACK as string[])[indexOf(m, d)] ?? "";
  const parts = raw.split("|");
  const out = {} as HealingoodDates;
  ORDER.forEach((k, j) => {
    const s = parts[j] ?? ""; const list: [number, number][] = [];
    for (let i = 0; i + 1 < s.length; i += 2) list.push(toDate(parseInt(s.slice(i, i + 2), 36)));
    out[k] = list;
  });
  return out;
}
export const fmtMD = ([m, d]: [number, number]) => `${MONTHS[m - 1]} ${d}`;
