import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Flame, Loader2, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchESPNGames, type ESPNGame } from "@/lib/espn";
import { loadAlignedPropsForGames, type ScoredPlayerProp } from "@/lib/player-props";
import { SportsPageHeader } from "@/components/sports-page-header";

export type PropSportOption = {
  id: string;
  label: string;
  leagues: string[];
  count: number;
};

type Props = {
  selectedDate: string;
  sports: PropSportOption[];
  initialSport?: string | null;
  onBack: () => void;
  onSportChange: (sportId: string) => void;
};

export function PlayerPropsBoard({ selectedDate, sports, initialSport, onBack, onSportChange }: Props) {
  const [sportId, setSportId] = useState<string>(() => {
    if (initialSport && sports.some((s) => s.id === initialSport)) return initialSport;
    return sports.find((s) => s.count > 0)?.id ?? sports[0]?.id ?? "NFL";
  });
  const activeSport = useMemo(() => sports.find((s) => s.id === sportId) ?? sports[0], [sports, sportId]);
  const [games, setGames] = useState<ESPNGame[]>([]);
  const [players, setPlayers] = useState<ScoredPlayerProp[]>([]);
  const [stats, setStats] = useState({ totalScanned: 0, withDob: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeSport) return;
    let cancelled = false;
    setLoading(true);
    setSelectedGameId("all");
    (async () => {
      const leagueGames = await Promise.all(
        activeSport.leagues.map(async (lg) => ({
          league: lg,
          games: await fetchESPNGames(lg, selectedDate).catch(() => []),
        })),
      );
      if (cancelled) return;
      const allGames = leagueGames.flatMap((entry) => entry.games);
      setGames(allGames);
      const results = await Promise.all(
        leagueGames
          .filter((entry) => entry.games.length > 0)
          .map((entry) => loadAlignedPropsForGames(entry.league, entry.games, selectedDate)),
      );
      if (cancelled) return;
      const merged = results.flatMap((r) => r.players).sort((a, b) => b.score - a.score);
      setPlayers(merged);
      setStats({
        totalScanned: results.reduce((sum, r) => sum + r.totalScanned, 0),
        withDob: results.reduce((sum, r) => sum + r.withDob, 0),
      });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [activeSport, selectedDate]);

  const visiblePlayers = useMemo(() => {
    const filtered = selectedGameId === "all" ? players : players.filter((p) => p.gameId === selectedGameId);
    return filtered.slice(0, 40);
  }, [players, selectedGameId]);

  const handleSelectSport = (id: string) => {
    setSportId(id);
    onSportChange(id);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5" data-testid="player-props-board">
      <SportsPageHeader
        eyebrow="Player Props"
        title={`${activeSport?.label ?? "Sport"} · Full Roster Energy`}
        description="Every rostered player scored with the same Life Path, Personal Day, Zodiac, and Jersey system used for QBs and game-day energy."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" type="button" onClick={onBack} className="inline-flex min-h-9 items-center gap-2 rounded-lg border-border bg-muted px-3 text-xs font-semibold text-muted-foreground hover:border-primary/60 hover:text-foreground" data-testid="button-props-back">
          <ArrowLeft size={13} aria-hidden="true" /> All sports
        </Button>
        <span className="text-xs text-muted-foreground">
          {loading ? "Scanning full rosters…" : `${stats.withDob} players decoded · ${games.length} ${games.length === 1 ? "game" : "games"}`}
        </span>
      </div>

      <section className="flex flex-wrap gap-2" aria-label="Choose sport for player props" data-testid="props-sport-selector">
        {sports.map((sport) => {
          const active = sport.id === sportId;
          return (
            <Button
              key={sport.id}
              type="button"
              variant={active ? "default" : "outline"}
              onClick={() => handleSelectSport(sport.id)}
              className={`h-9 rounded-lg px-3.5 text-xs font-semibold ${active ? "bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
              data-testid={`button-props-sport-${sport.id}`}
            >
              {sport.label} <span className="ml-1.5 opacity-75">({sport.count})</span>
            </Button>
          );
        })}
      </section>

      {games.length > 1 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by matchup">
          <Button type="button" variant={selectedGameId === "all" ? "default" : "outline"} onClick={() => setSelectedGameId("all")} className="h-7 rounded-md px-2.5 text-[11px]">
            All Games ({games.length})
          </Button>
          {games.map((g) => (
            <Button key={g.id} type="button" variant={selectedGameId === g.id ? "default" : "outline"} onClick={() => setSelectedGameId(g.id)} className="h-7 rounded-md px-2.5 text-[11px]">
              {g.awayAbbr} @ {g.homeAbbr}
            </Button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-border bg-card py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" /> Reading full {activeSport?.label} rosters…
        </div>
      ) : games.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No {activeSport?.label} games scheduled on {selectedDate}. Pick another sport or change the game date.
        </div>
      ) : visiblePlayers.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Rosters for this slate did not include player birth dates yet.
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2" aria-label="Most aligned players" data-testid="list-aligned-players">
          {visiblePlayers.map((player, index) => {
            const expanded = expandedId === `${player.gameId}-${player.id}`;
            return (
              <article key={`${player.gameId}-${player.id}`} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50" data-testid={`card-prop-player-${index}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary tabular-nums">#{index + 1}</span>
                      <h3 className="truncate font-display text-base font-bold text-foreground">{player.name}</h3>
                      {player.jersey && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">#{player.jersey}</span>}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {player.teamAbbr} · {player.position || "Player"} · {player.isHome ? `vs ${player.opponentAbbr}` : `@ ${player.opponentAbbr}`}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1 font-display text-xl font-black text-primary tabular-nums">
                      <Flame size={15} aria-hidden="true" /> {player.alignmentPct}%
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{player.chartToneLabel}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {player.propCalls.map((call) => (
                    <span key={call} className="inline-flex items-center gap-1 rounded-md border border-primary/35 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      <Sparkles size={11} aria-hidden="true" /> {call}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-2.5 text-[11px] text-muted-foreground">
                  <span>LP {player.lifePathLabel} · PD {player.personalDayLabel} · {player.zodiacSign}</span>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : `${player.gameId}-${player.id}`)}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    {expanded ? "Hide decode" : "Energy breakdown"}
                    {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                </div>

                {expanded && (
                  <ul className="mt-2.5 space-y-1 border-t border-border/60 pt-2.5 text-xs">
                    {player.signals.map((sig, i) => (
                      <li key={i} className="flex items-start justify-between gap-2">
                        <span className={sig.tone === "negative" ? "text-destructive" : "text-foreground/90"}>{sig.label}</span>
                        <span className={`shrink-0 font-mono text-[11px] font-semibold ${sig.tone === "negative" ? "text-destructive" : "text-primary"}`}>
                          {sig.delta > 0 ? `+${sig.delta.toFixed(1)}` : sig.delta.toFixed(1)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}