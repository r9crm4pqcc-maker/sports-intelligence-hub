import { transitsAt, WESTERN_SIGNS } from "./transits";
export const MAIN_LUCKY_NUMBER = 99;
export const GEMSTONE_RANKING = [
  { rank: 1, stone: "Red Coral", planet: "Mars", benefit: "Drive, stamina, courage, finishing and aerials", base: "Primary" },
  { rank: 2, stone: "Ruby", planet: "Sun", benefit: "Confidence, leadership and visibility", base: "Strong secondary" },
  { rank: 3, stone: "Pearl", planet: "Moon", benefit: "Calm under pressure, recovery and sleep", base: "Support" },
  { rank: 4, stone: "Blue Sapphire", planet: "Saturn", benefit: "Discipline and long-term endurance", base: "Conditional" },
] as const;
export function gemstoneTiming(date: Date, coralStart = "", clean = false) {
  const iso = date.toISOString().slice(0, 10);
  const rows = transitsAt(date);
  const house = (planet: string) => {
    const sign = rows.find(r => r.planet === planet)?.sidereal.split(" ").at(-1);
    const index = WESTERN_SIGNS.findIndex(s => s === sign);
    return index < 0 ? null : ((index - 6 + 12) % 12) + 1; // User's documented Libra rising, whole-sign houses.
  };
  const saturn = rows.find(r => r.planet === "Saturn");
  const saturnHouse = house("Saturn"), venusHouse = house("Venus");
  const season = iso >= "2027-08-01" && iso <= "2027-11-30";
  const early = iso < "2027-06-21";
  const coralDays = coralStart ? Math.floor((date.getTime() - Date.parse(`${coralStart}T00:00:00Z`)) / 86400000) : 0;
  const rubyReady = clean && coralDays >= 28;
  const sapphireBlocked = iso <= "2027-10-24" || season || saturn?.retrograde || [6, 8, 12].includes(saturnHouse ?? 0);
  return { rows, saturnHouse, venusHouse, rubyReady, sapphireBlocked,
    coral: season ? "Keep as the main daily stone, only after a clean pocket test." : early ? "Pocket-test first; start only if the test is clean." : "Recommended activation window: late June–July 2027. Pocket-test before daily training.",
    ruby: rubyReady ? "Clean Coral test recorded for at least 4 weeks; Ruby can be considered next." : "Wait for Red Coral to remain clean for 3–4 weeks before adding Ruby.",
    pearl: "Available anytime in your guidance; recovery nights or calm under pressure.",
    sapphire: sapphireBlocked ? "Do not start. Re-evaluate after 10/24/2027 and outside the August–November season, with a new transit check." : "Re-evaluation window only — this is not automatic clearance to start.",
    diamond: iso < "2027-06-21" || venusHouse === 12 ? "Skip: current-period restriction or Venus in the 12th house." : "Situational only; skip if Venus is weak. Weakness is not inferred from house alone.",
  };
}