export type TeamSide = "home" | "away";

const ADJACENT_MASTER_BY_JERSEY: Record<number, number> = {
  12: 11,
  23: 22,
  34: 33,
};

export function isChampionshipEvent(eventName?: string): boolean {
  if (!eventName) return false;
  return /\b(super bowl|world series|stanley cup(?: final)?|nba finals?|wnba finals?|championship(?: game)?|title game|cup final|champions league final|finals?)\b/i.test(eventName);
}

/** Dynamic last-two-digit year code, retaining master-number roots. */
export function annualSportsCode(year: number): { code: number; energy: number; label: string } {
  const code = ((year % 100) + 100) % 100;
  let energy = code;
  while (energy > 9 && ![11, 22, 33].includes(energy)) {
    energy = [...String(energy)].reduce((sum, digit) => sum + Number(digit), 0);
  }
  if (energy === 2 && code !== 2) energy = 11;
  return { code, energy, label: code === energy ? String(code) : `${code}/${energy}` };
}

export function shouldFadeNineLifePathStar(
  lifePath: number,
  universalDay: number,
  role: string,
): boolean {
  const highUsageRole = /^(player|quarterback|pitcher|goalie|fighter|goalkeeper)$/i.test(role);
  return lifePath === 9 && universalDay === 9 && highUsageRole;
}

export function adjacentMasterForJersey(jersey: number): number | null {
  return ADJACENT_MASTER_BY_JERSEY[jersey] ?? null;
}

export function sevenEnergyInjuryCaution(input: {
  universalDay: number;
  calendarDay: number;
  homeOuts?: number;
  awayOuts?: number;
}): { side: TeamSide; weight: number } | null {
  const hasSevenEnergy = input.universalDay === 7 || input.calendarDay === 7;
  if (!hasSevenEnergy || input.homeOuts == null || input.awayOuts == null) return null;
  if (!Number.isFinite(input.homeOuts) || !Number.isFinite(input.awayOuts) || input.homeOuts === input.awayOuts) return null;
  return {
    side: input.homeOuts > input.awayOuts ? "away" : "home",
    weight: 0.15,
  };
}
