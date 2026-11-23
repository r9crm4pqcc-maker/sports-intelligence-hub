import { useMemo } from "react";
import { AlertCircle, ArrowUpRight, CalendarDays, Check, LoaderCircle, RefreshCw, Trophy } from "lucide-react";

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
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">Open a game slate to see the Learned Code pick and Story Reading.</p>
        </div>
        <div className="flex items-end gap-2">
          <label htmlFor="sport-picker-date" className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Game date</span>
            <span className="flex items-center gap-2.5 rounded-xl border border-primary/45 bg-background px-3 py-2">
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
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh schedules"
            className="grid h-[54px] w-11 place-items-center rounded-xl border border-primary/45 text-primary transition-colors hover:border-primary disabled:cursor-wait disabled:opacity-60"
            data-testid="button-refresh-schedules"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} aria-hidden="true" />
          </button>
        </div>
      </header>

      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground" data-testid="text-sport-count">
        {orderedEntries.length} {orderedEntries.length === 1 ? "sport" : "sports"} · counts for this date
      </p>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Sports schedules" data-testid="list-sport-schedules">
        {orderedEntries.map((entry) => {
          const status = statusFor(entry);
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelect(entry.id)}
              className="glass-card group flex min-h-[150px] flex-col p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid={`button-select-sport-${entry.id}`}
              aria-label={`Open ${entry.label} schedule, ${entry.count} games`}
            >
              <span className="flex w-full items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate font-display text-lg font-semibold text-foreground" data-testid={`text-sport-label-${entry.id}`}>{entry.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground" data-testid={`text-sport-description-${entry.id}`}>{entry.description}</span>
                </span>
                <ArrowUpRight size={16} className="shrink-0 text-primary/60 transition-colors group-hover:text-primary" aria-hidden="true" />
              </span>
              <span className="mt-auto flex items-end justify-between gap-3 pt-4">
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black leading-none text-primary" data-testid={`text-game-count-${entry.id}`}>{entry.count}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{entry.count === 1 ? "game" : "games"}</span>
                  </span>
                  {entry.subCounts && entry.subCounts.length > 0 && (
                    <span className="flex flex-wrap gap-x-3 gap-y-1" data-testid={`list-sport-subcounts-${entry.id}`}>
                      {entry.subCounts.map((subCount) => (
                        <span key={subCount.label} className="text-[10px] text-muted-foreground" data-testid={`text-sport-subcount-${entry.id}-${normalize(subCount.label)}`}>
                          <span className="text-foreground">{subCount.count}</span> {subCount.label}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${
                    status.tone === "error" ? "border-destructive/40 text-destructive"
                      : status.tone === "ready" ? "border-primary/40 text-primary"
                        : "border-border text-muted-foreground"
                  }`}
                  data-testid={`status-sport-${entry.id}`}
                  role="status"
                >
                  {status.tone === "error" || status.tone === "partial" ? <AlertCircle size={10} aria-hidden="true" />
                    : status.tone === "loading" ? <LoaderCircle size={10} className="animate-spin" aria-hidden="true" />
                      : <Check size={10} aria-hidden="true" />}
                  {status.label}
                </span>
              </span>
            </button>
          );
        })}
      </section>
    </div>
  );
}

export default SportPicker;
