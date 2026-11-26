import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowUpRight, CalendarDays, Check, LoaderCircle, RefreshCw, Trophy, CircleDot, Goal, Dribbble, Volleyball, GraduationCap, ChevronRight } from "lucide-react";

export type SportPickerEntry = {
  id: string;
  label: string;
  description: string;
  count: number;
  loading: boolean;
  partial: boolean;
  failed: boolean;
  subCounts?: { label: string; count: number }[];
};

export type SportPickerProps = {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  entries: SportPickerEntry[];
  onSelect: (id: string) => void;
};

const SPORT_ICONS = { MLB: CircleDot, Soccer: Goal, NBA: Dribbble, NFL: Volleyball, NHL: Goal, "College Sports": GraduationCap };
const SPORT_ACCENTS: Record<string, string> = {
  MLB: "var(--sport-mlb)",
  Soccer: "var(--sport-soccer)",
  NBA: "var(--sport-nba)",
  NFL: "var(--sport-nfl)",
  NHL: "var(--sport-nhl)",
  "College Sports": "var(--sport-college)",
  "More Sports": "var(--sport-more)",
};

const PRIMARY_ORDER = ["MLB", "Soccer", "NBA", "NFL", "NHL", "College Sports"];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function dateLabel(value: string) {
  if (!value) return "Choose a game date";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function statusFor(entry: SportPickerEntry) {
  if (entry.failed) return { label: "Feed unavailable", tone: "error" as const };
  if (entry.loading) return { label: "Loading schedule", tone: "loading" as const };
  if (entry.partial) return { label: "Partial schedule", tone: "partial" as const };
  return { label: "Schedule ready", tone: "ready" as const };
}

export function SportPicker({
  selectedDate,
  onDateChange,
  onRefresh,
  refreshing,
  entries,
  onSelect,
}: SportPickerProps) {
  const orderedEntries = useMemo(() => {
    const used = new Set<string>();
    const ordered: SportPickerEntry[] = [];

    for (const label of PRIMARY_ORDER) {
      const match = entries.find((entry) => !used.has(entry.id) && normalize(entry.label) === normalize(label));
      if (match) {
        ordered.push(match);
        used.add(match.id);
      }
    }

    for (const entry of entries) {
      if (!used.has(entry.id)) ordered.push(entry);
    }
    return ordered;
  }, [entries]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5" data-testid="sport-picker">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            <Trophy size={12} aria-hidden="true" /> Sports AI
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-foreground sm:text-4xl">Pick a sport</h1>

        </div>
        <div className="flex items-end gap-2">
          <label htmlFor="sport-picker-date" className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Game date</span>
            <span className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 hover:border-primary/40 transition-colors">
              <CalendarDays size={15} className="shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground" data-testid="text-selected-game-date">{dateLabel(selectedDate)}</span>
                <input
                  id="sport-picker-date"
                  type="date"
                  value={selectedDate}
                  onChange={(event) => onDateChange(event.currentTarget.value)}
                  className="block w-full cursor-pointer border-0 bg-transparent p-0 text-[11px] text-muted-foreground outline-none [color-scheme:dark]"
                  data-testid="input-selected-game-date"
                  aria-label="Select game date"
                />
              </span>
            </span>
          </label>
          <Button
            variant="outline"
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh schedules"
            className="grid h-[54px] w-11 place-items-center rounded-lg border border-primary/45 text-primary transition-colors hover:border-primary disabled:cursor-wait disabled:opacity-60"
            data-testid="button-refresh-schedules"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} aria-hidden="true" />
          </Button>
        </div>
      </header>

      <div className="flex items-center justify-between border-b border-border pb-3"><h2 className="text-xs font-bold uppercase text-muted-foreground">Leagues</h2><span className="text-xs text-muted-foreground">{orderedEntries.length} sports</span></div>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Sports schedules" data-testid="list-sport-schedules">
        {orderedEntries.map(entry => {
          const status = statusFor(entry);
          const Icon = SPORT_ICONS[entry.id as keyof typeof SPORT_ICONS] ?? Trophy;
          const accent = SPORT_ACCENTS[entry.id] ?? "var(--primary)";
          return <Button key={entry.id} variant="outline" onClick={() => onSelect(entry.id)} className="group h-auto min-h-28 w-full justify-start gap-4 whitespace-normal rounded-xl border-border/90 bg-card px-4 py-5 text-left transition-all hover:border-primary/60 hover:bg-card/90 hover:shadow-[var(--shadow-gold)] hover:text-foreground" data-testid={`button-select-sport-${entry.id}`} aria-label={`Open ${entry.label} schedule, ${entry.count} games`}>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border transition-transform group-hover:scale-105" style={{ color: `hsl(${accent})`, borderColor: `hsl(${accent} / 0.35)`, background: `radial-gradient(circle at 30% 30%, hsl(${accent} / 0.22), hsl(${accent} / 0.06))`, boxShadow: `0 0 22px -6px hsl(${accent} / 0.5)` }}><Icon className="!size-8" strokeWidth={1.6} /></span>
            <span className="min-w-0 flex-1"><span className="block font-display text-xl font-bold tracking-tight" data-testid={`text-sport-label-${entry.id}`}>{entry.label}</span><span className={`mt-1 block text-xs ${status.tone === "error" ? "text-destructive" : "text-muted-foreground"}`} role="status" data-testid={`status-sport-${entry.id}`}>{entry.loading ? "Loading schedule…" : entry.failed ? "Feed unavailable" : entry.partial ? "Partial schedule" : "Schedule ready"}</span>{entry.subCounts?.map(sub => <span key={sub.label} className="block text-[10px] text-muted-foreground">{sub.label} · {sub.count}</span>)}</span>
            <span className="shrink-0 text-right"><span className="block text-2xl font-display font-black text-primary tabular-nums" data-testid={`text-game-count-${entry.id}`}>{entry.loading && !entry.count ? "—" : entry.count}</span><span className="block text-[10px] text-muted-foreground">{entry.count === 1 ? "Game Today" : "Games Today"}</span><span className="mt-1.5 flex items-center justify-end gap-1" aria-hidden="true"><span className="h-1 w-3 rounded-full" style={{ background: `hsl(${accent})` }} /><span className="h-1 w-2.5 rounded-full" style={{ background: `hsl(${accent} / 0.8)` }} /><span className="h-1 w-1 rounded-full" style={{ background: `hsl(${accent} / 0.6)` }} /><span className="h-1 w-1 rounded-full" style={{ background: `hsl(${accent} / 0.4)` }} /></span></span><ChevronRight className="text-muted-foreground group-hover:text-primary" />
          </Button>;
        })}
      </section>
    </div>
  );
}

export default SportPicker;
