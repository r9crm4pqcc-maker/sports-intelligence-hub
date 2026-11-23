export type RotoWireNhlGoalieStatus = "confirmed" | "expected";
export interface RotoWireNhlGoalie { name: string; status: RotoWireNhlGoalieStatus }
export interface RotoWireNhlGameLineup {
  awayAbbr: string;
  homeAbbr: string;
  gameTimeEt: string | null;
  awayGoalie: RotoWireNhlGoalie | null;
  homeGoalie: RotoWireNhlGoalie | null;
}
export interface RotoWireNhlLineups {
  dateMode: "today" | "tomorrow";
  dateLabel: string;
  retrievedAt: string;
  sourceUrl: string;
  games: RotoWireNhlGameLineup[];
}
