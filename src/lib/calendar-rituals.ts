import { dailySecretsFor, universalDayOf, type SecretItem } from "./timing-secrets";
/** Wealth-purpose rituals belong on wealth days: the 28th, or a date whose life path (universal day) is 8, 22 or 28, or a day the chart marks as wealth/28. */
export function isWealthRitualDay(y: number, m: number, d: number, markedWealth = false): boolean {
  const ud = universalDayOf(y, m, d);
  return markedWealth || d === 28 || ud === 8 || ud === 22 || ud === 28;
}
/** Restrictions apply to the activity they name, not to unrelated rituals. */
export function calendarRitualsFor(y: number, m: number, d: number, markedWealth = false): { allowed: SecretItem[]; blocked: SecretItem[] } {
  const read = dailySecretsFor(y, m, d);
  const groomingBlocked = read.avoidToday.some(r => r.title === "Danger day for grooming & hats");
  const shower = isWealthRitualDay(y, m, d, markedWealth) ? read.alwaysOn.filter(r => r.title === "The Shower Ritual") : [];
  const rituals = [...read.doToday, ...shower];
  const blocked = groomingBlocked ? rituals.filter(r => /haircut|grooming/i.test(r.title)) : [];
  const allowed = rituals.filter(r => !blocked.includes(r));
  return { allowed, blocked };
}
