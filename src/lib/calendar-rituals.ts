import { dailySecretsFor, type SecretItem } from "./timing-secrets";
/** Restrictions apply to the activity they name, not to unrelated rituals. */
export function calendarRitualsFor(y: number, m: number, d: number): { allowed: SecretItem[]; blocked: SecretItem[] } {
  const read = dailySecretsFor(y, m, d);
  const groomingBlocked = read.avoidToday.some(r => r.title === "Danger day for grooming & hats");
  const rituals = [...read.doToday, ...read.alwaysOn.filter(r => r.title === "The Shower Ritual")];
  const blocked = groomingBlocked ? rituals.filter(r => /haircut|grooming/i.test(r.title)) : [];
  const allowed = rituals.filter(r => !blocked.includes(r));
  return { allowed, blocked };
}
