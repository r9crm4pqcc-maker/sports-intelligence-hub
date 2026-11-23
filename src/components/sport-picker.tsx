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
    <main
      className="min-h-[100dvh] px-4 py-8 text-white sm:px-7 sm:py-12"
      style={{
        background:
          "radial-gradient(ellipse at 88% 0%, rgba(255,106,0,0.12), transparent 32%), #101113",
        fontFamily: '"DM Sans", sans-serif',
      }}
      data-testid="sport-picker"
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 border-b border-white/10 pb-7 sm:mb-10 sm:pb-9">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
              <Trophy size={15} className="text-[#ff7b32]" aria-hidden="true" />
              <span>Sports Prediction</span>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-3.5 text-xs font-semibold text-white/75 transition hover:border-[#ff7b32]/50 hover:bg-[#ff7b32]/10 hover:text-white disabled:cursor-wait disabled:opacity-60"
              data-testid="button-refresh-schedules"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} aria-hidden="true" />
              {refreshing ? "Refreshing" : "Refresh"}
            </button>
          </div>

          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff8a4a]">
                 Select a sport
              </p>
              <h1
                className="text-4xl font-bold leading-[1.02] tracking-[-0.055em] text-[#f5f0e8] sm:text-5xl"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                Find your
                <br className="sm:hidden" /> game.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
                Pick a sport to open its game slate and numerology analysis.
              </p>
            </div>

            <div className="w-full md:w-[290px]">
              <label
                htmlFor="sport-picker-date"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.17em] text-white/45"
              >
                Game date
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-white/12 bg-[#191a1d] px-3.5 py-3">
                <CalendarDays size={17} className="shrink-0 text-[#ff8a4a]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white/90" data-testid="text-selected-game-date">
                    {dateLabel(selectedDate)}
                  </p>
                  <input
                    id="sport-picker-date"
                    type="date"
                    value={selectedDate}
                    onChange={(event) => onDateChange(event.currentTarget.value)}
                    className="mt-1 block w-full cursor-pointer border-0 bg-transparent p-0 text-[11px] text-white/45 outline-none [color-scheme:dark]"
                    data-testid="input-selected-game-date"
                    aria-label="Select game date"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2
              className="text-lg font-bold tracking-[-0.03em] text-white/90"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              Available schedules
            </h2>
            <p className="mt-1 text-xs text-white/40" data-testid="text-sport-count">
              {orderedEntries.length} {orderedEntries.length === 1 ? "sport" : "sports"} · counts reflect this slate
            </p>
          </div>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30 sm:block">
             Choose a sport to continue
          </span>
        </div>

        <section
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Sports schedules"
          data-testid="list-sport-schedules"
        >
          {orderedEntries.map((entry, index) => {
            const status = statusFor(entry);
            const accent = index === 0;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelect(entry.id)}
                className="group relative flex min-h-[190px] flex-col overflow-hidden rounded-2xl border p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#ff7b32]/55 hover:bg-[#202124] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8a4a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101113]"
                style={{
                  borderColor: accent ? "rgba(255,123,50,0.34)" : "rgba(255,255,255,0.10)",
                  background: accent
                    ? "linear-gradient(145deg, rgba(255,123,50,0.095), rgba(27,28,31,0.94) 58%)"
                    : "rgba(27,28,31,0.84)",
                  animationDelay: `${Math.min(index, 8) * 45}ms`,
                }}
                data-testid={`button-select-sport-${entry.id}`}
                aria-label={`Open ${entry.label} schedule, ${entry.count} games`}
              >
                <span
                  className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border border-white/[0.035] transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                />
                <span className="mb-5 flex w-full items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span
                      className="block truncate text-xl font-bold tracking-[-0.045em] text-[#f4f0e9]"
                      style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                      data-testid={`text-sport-label-${entry.id}`}
                    >
                      {entry.label}
                    </span>
                    <span className="mt-1.5 block text-xs leading-5 text-white/45" data-testid={`text-sport-description-${entry.id}`}>
                      {entry.description}
                    </span>
                  </span>
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-white/45 transition group-hover:border-[#ff8a4a]/45 group-hover:text-[#ff9a62]">
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </span>
                </span>

                <span className="mt-auto flex items-end justify-between gap-3 border-t border-white/[0.08] pt-4">
                  <span className="flex min-w-0 flex-col gap-2">
                    <span className="flex items-baseline gap-2">
                      <span
                        className="font-mono text-[28px] font-semibold leading-none tracking-[-0.06em] text-white"
                        data-testid={`text-game-count-${entry.id}`}
                      >
                        {entry.count}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/38">
                        {entry.count === 1 ? "game" : "games"}
                      </span>
                    </span>
                    {entry.subCounts && entry.subCounts.length > 0 && (
                      <span className="flex flex-wrap gap-x-3 gap-y-1" data-testid={`list-sport-subcounts-${entry.id}`}>
                        {entry.subCounts.map((subCount) => (
                          <span
                            key={subCount.label}
                            className="text-[10px] text-white/45"
                            data-testid={`text-sport-subcount-${entry.id}-${normalize(subCount.label)}`}
                          >
                            <span className="text-white/70">{subCount.count}</span> {subCount.label}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${
                      status.tone === "error"
                        ? "bg-red-400/10 text-red-300"
                        : status.tone === "loading"
                          ? "bg-white/[0.07] text-white/55"
                          : status.tone === "partial"
                            ? "bg-amber-300/10 text-amber-200"
                            : "bg-emerald-300/[0.09] text-emerald-200/80"
                    }`}
                    data-testid={`status-sport-${entry.id}`}
                    role="status"
                  >
                    {status.tone === "error" ? (
                      <AlertCircle size={11} aria-hidden="true" />
                    ) : status.tone === "loading" ? (
                      <LoaderCircle size={11} className="animate-spin" aria-hidden="true" />
                    ) : status.tone === "ready" ? (
                      <Check size={11} aria-hidden="true" />
                    ) : (
                      <AlertCircle size={11} aria-hidden="true" />
                    )}
                    {status.label}
                  </span>
                </span>
              </button>
            );
          })}
        </section>
      </div>
    </main>
  );
}

export default SportPicker;
