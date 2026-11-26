import { displayDate } from "@/lib/display-date";
import { UsDateInput } from "@/components/us-date-input";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  createSportsCatalogId,
  deleteSportsCatalogRecord,
  getCatalogDateConflict,
  isBuiltInCatalogRecord,
  newSportsCatalogRecord,
  resetSportsCatalogRecord,
  saveSportsCatalogRecord,
  useSportsCatalog,
  type SportsCatalogKind,
  type SportsCatalogRecord,
  type SportsPersonRole,
} from "@/lib/sports-catalog";
import { SPORTS_COMPETITIONS } from "@/lib/sports-catalog-seeds";
import { SportsPageHeader } from "@/components/sports-page-header";

const KINDS: SportsCatalogKind[] = ["team", "person", "city", "stadium"];
const ROLES: SportsPersonRole[] = ["player", "pitcher", "quarterback", "goalie", "coach", "manager", "owner", "staff"];
const KIND_LABELS: Record<SportsCatalogKind, string> = {
  team: "Teams",
  person: "People",
  city: "Cities",
  stadium: "Stadiums",
};

const buttonBase =
  "inline-flex min-h-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40";
const fieldBase =
  "mt-1.5 w-full rounded-lg border border-border bg-muted/60 px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";
const subtleButton = `${buttonBase} border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary`;
const accentButton = `${buttonBase} border-primary bg-primary text-primary-foreground hover:bg-primary/90`;

function splitList(value: string): string[] {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function LabelField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block min-w-0 text-xs font-medium text-stone-400">
      <span>{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] font-normal leading-relaxed text-stone-600">{hint}</span>}
    </label>
  );
}

function RecordMark({ kind }: { kind: SportsCatalogKind }) {
  const marks: Record<SportsCatalogKind, string> = { team: "TM", person: "PE", city: "CT", stadium: "ST" };
  return (
    <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/35 bg-primary/10 font-mono text-[10px] font-bold tracking-wide text-primary">
      {marks[kind]}
    </span>
  );
}

type CatalogPageProps = { eyebrow?: string; title?: string; subtitle?: string; founding?: boolean };

export default function SportsCatalogPage({ eyebrow = "Sports AI · Reference workspace", title = "Sports Database", subtitle = "One organized reference for teams, people, cities, and stadiums used in game analysis.", founding = false }: CatalogPageProps = {}) {
  const [dateFilter, setDateFilter] = useState<"all" | "dated" | "missing">("all");
  const records = useSportsCatalog();
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<SportsCatalogKind | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "built-in" | "user">("all");
  const [sportFilter, setSportFilter] = useState("all");
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const [conflictsOnly, setConflictsOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SportsCatalogRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return records.filter((record) => {
      if (kindFilter !== "all" && record.kind !== kindFilter) return false;
      if (sourceFilter !== "all" && record.source !== sourceFilter) return false;
      if (sportFilter !== "all" && record.sport !== sportFilter) return false;
      if (competitionFilter !== "all" && record.competition !== competitionFilter) return false;
      if (conflictsOnly && !getCatalogDateConflict(record)) return false;
      if (dateFilter === "dated" && !record.date) return false;
      if (dateFilter === "missing" && record.date) return false;
      if (!needle) return true;
      return [record.name, record.sport, record.competition, ...record.aliases]
        .some((value) => value.toLocaleLowerCase().includes(needle));
    });
  }, [records, query, kindFilter, sourceFilter, sportFilter, competitionFilter, conflictsOnly, dateFilter]);

  const selected = draft ?? records.find((record) => record.id === selectedId) ?? null;
  const counts = useMemo(
    () => Object.fromEntries(KINDS.map((kind) => [kind, records.filter((record) => record.kind === kind).length])) as Record<SportsCatalogKind, number>,
    [records],
  );
  const cities = records.filter((record) => record.kind === "city");
  const stadiums = records.filter((record) => record.kind === "stadium");
  const teams = records.filter((record) => record.kind === "team");
  const sports = [...new Set(records.map((record) => record.sport.trim()).filter(Boolean))].sort();
  const competitions = [...new Set([...SPORTS_COMPETITIONS, ...records
    .filter((record) => sportFilter === "all" || record.sport === sportFilter)
    .map((record) => record.competition.trim()).filter(Boolean)])].sort();

  function beginCreate(kind: SportsCatalogKind) {
    const record = newSportsCatalogRecord(kind);
    setDraft(record);
    setSelectedId(null);
    setIsCreating(true);
    setErrors([]);
    setNotice("");
    setConfirmDelete(false);
  }

  function beginEdit(record: SportsCatalogRecord) {
    setSelectedId(record.id);
    setDraft({ ...record, aliases: [...record.aliases], colors: [...record.colors], roles: [...record.roles], teamIds: [...record.teamIds] });
    setIsCreating(false);
    setErrors([]);
    setNotice("");
    setConfirmDelete(false);
  }

  function cancelEdit() {
    setDraft(null);
    setIsCreating(false);
    setErrors([]);
    setNotice("");
    setConfirmDelete(false);
  }

  function updateDraft(patch: Partial<SportsCatalogRecord>) {
    setDraft((current) => current ? { ...current, ...patch } : current);
  }

  useEffect(() => {
    if (!draft) return;
    const timer = setTimeout(() => {
      const candidate = { ...draft, id: isCreating ? createSportsCatalogId(draft.kind, draft.name) : draft.id, name: draft.name.trim() };
      const result = saveSportsCatalogRecord(candidate);
      if (!result.ok) { setErrors(result.errors); setNotice(""); return; }
      setSelectedId(result.record.id);
      setIsCreating(false);
      // Keep the editor open while typing; give a new record its stable ID.
      if (draft.id !== result.record.id) setDraft({ ...draft, id: result.record.id });
      setErrors([]); setNotice("All changes saved.");
    }, 450);
    return () => clearTimeout(timer);
  }, [draft, isCreating]);

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const candidate = {
      ...draft,
      id: isCreating ? createSportsCatalogId(draft.kind, draft.name) : draft.id,
      name: draft.name.trim(),
      date: draft.date?.trim() || null,
    };
    const result = saveSportsCatalogRecord(candidate);
    if (!result.ok) {
      setErrors(result.errors);
      setNotice("");
      return;
    }
    setSelectedId(result.record.id);
    setDraft(null);
    setIsCreating(false);
    setErrors([]);
    setNotice("Record saved to the sports catalog.");
  }

  function handleReset() {
    if (!selected || !isBuiltInCatalogRecord(selected.id)) return;
    if (resetSportsCatalogRecord(selected.id)) {
      setDraft(null);
      setErrors([]);
      setNotice("Built-in record restored to its original values.");
    } else {
      setErrors(["This built-in record could not be reset. Try again."]);
    }
  }

  function handleDelete() {
    if (!selected || selected.source !== "user") return;
    const result = deleteSportsCatalogRecord(selected.id);
    if (!result.ok) {
      setErrors([result.error]);
      setConfirmDelete(false);
      return;
    }
    setSelectedId(null);
    setDraft(null);
    setErrors([]);
    setConfirmDelete(false);
    setNotice(`“${selected.name}” was deleted.`);
  }

  function handleExport() {
    const payload = {
      format: "sports-database",
      version: 1,
      exportedAt: new Date().toISOString(),
      records: records.map(record => ({ ...record, date: displayDate(record.date) || null })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sports-database-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Sports database exported as JSON.");
  }

  return (
    <div className="min-h-full bg-background py-1 text-foreground">
      <div className="mx-auto max-w-7xl">
        <SportsPageHeader eyebrow={eyebrow} title={title} description={subtitle} actions={
          <div className="flex flex-wrap items-center gap-2" data-testid="catalog-create-actions">
            <button type="button" className={subtleButton} onClick={handleExport} data-testid="export-catalog-button">
              Export data
            </button>
            {KINDS.map((kind) => (
              <button key={kind} type="button" className={kind === "team" ? accentButton : subtleButton}
                onClick={() => beginCreate(kind)} data-testid={`create-${kind}-button`}>
                <span className="mr-1.5 text-base leading-none">+</span> Add {kind}
              </button>
            ))}
          </div>
        } />
        {founding && <p className="mb-4 mt-2 font-mono text-[11px] text-stone-500" data-testid="founding-summary">{records.filter((r) => r.date).length} dated · {records.filter((r) => !r.date).length} missing a verified date · {records.filter((r) => getCatalogDateConflict(r)).length} conflicts</p>}

        <section aria-label="Catalog summary" className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4" data-testid="catalog-summary">
          {KINDS.map((kind) => (
            <button type="button" key={kind} onClick={() => setKindFilter(kindFilter === kind ? "all" : kind)}
              aria-pressed={kindFilter === kind}
              className={`flex items-center justify-between bg-card px-4 py-3 text-left transition-colors hover:bg-muted/70 ${kindFilter === kind ? "bg-primary/10" : ""}`}
              data-testid={`summary-${kind}`}>
              <span className="text-xs text-stone-500">{KIND_LABELS[kind]}</span>
              <span className="font-mono text-lg font-semibold text-stone-200">{counts[kind]}</span>
            </button>
          ))}
        </section>

        {notice && <div role="status" className="mb-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary" data-testid="catalog-notice">{notice}</div>}

        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(280px,0.78fr)_minmax(0,1.55fr)]">
          <section aria-label="Catalog records" className="glass-card min-w-0 overflow-hidden rounded-xl">
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold text-stone-200">Reference records</h2>
                <span className="font-mono text-[10px] text-stone-600" data-testid="filtered-count">{filtered.length} / {records.length}</span>
              </div>
              <label className="mt-3 block">
                <span className="sr-only">Search records</span>
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search names, aliases, sport…" className={fieldBase + " mt-0"}
                  data-testid="catalog-search" aria-label="Search records" />
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="text-[10px] uppercase tracking-wider text-stone-600">
                  Kind
                  <select value={kindFilter} onChange={(event) => setKindFilter(event.target.value as SportsCatalogKind | "all")}
                    className={fieldBase + " py-2 text-xs normal-case tracking-normal"} data-testid="kind-filter" aria-label="Filter by record kind">
                    <option value="all">All kinds</option>
                    {KINDS.map((kind) => <option key={kind} value={kind}>{KIND_LABELS[kind]}</option>)}
                  </select>
                </label>
                <label className="text-[10px] uppercase tracking-wider text-stone-600">
                  Source
                  <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as typeof sourceFilter)}
                    className={fieldBase + " py-2 text-xs normal-case tracking-normal"} data-testid="source-filter" aria-label="Filter by source">
                    <option value="all">All sources</option>
                    <option value="built-in">Built-in</option>
                    <option value="user">User-created</option>
                  </select>
                </label>
                <label className="text-[10px] uppercase tracking-wider text-stone-600">
                  Sport
                  <select value={sportFilter} onChange={(event) => { setSportFilter(event.target.value); setCompetitionFilter("all"); }}
                    className={fieldBase + " py-2 text-xs normal-case tracking-normal"} data-testid="sport-filter" aria-label="Filter by sport">
                    <option value="all">All sports</option>
                    {sports.map((sport) => <option key={sport} value={sport}>{sport}</option>)}
                  </select>
                </label>
                <label className="text-[10px] uppercase tracking-wider text-stone-600">
                  Competition
                  <select value={competitionFilter} onChange={(event) => setCompetitionFilter(event.target.value)}
                    className={fieldBase + " py-2 text-xs normal-case tracking-normal"} data-testid="competition-filter" aria-label="Filter by competition">
                    <option value="all">All competitions</option>
                    {competitions.map((competition) => <option key={competition} value={competition}>{competition}</option>)}
                  </select>
                </label>
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-stone-400">
                <input type="checkbox" checked={conflictsOnly} onChange={(event) => setConflictsOnly(event.target.checked)}
                  className="accent-primary" data-testid="conflicts-filter" />
                Show unresolved source dates
              </label>
              <div className="mt-2 flex gap-1" role="group" aria-label="Date status">
                {(["all", "dated", "missing"] as const).map((value) => (
                  <button key={value} type="button" onClick={() => setDateFilter(value)} aria-pressed={dateFilter === value}
                    className={`${buttonBase} min-h-7 flex-1 px-2 text-[11px] ${dateFilter === value ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}
                    data-testid={`date-filter-${value}`}>{value === "all" ? "All dates" : value === "dated" ? "Has date" : "Missing date"}</button>
                ))}
              </div>
            </div>
            <div className="max-h-[68dvh] overflow-y-auto p-2">
              {KINDS.filter((kind) => kindFilter === "all" || kindFilter === kind).map((kind) => {
                const group = filtered.filter((record) => record.kind === kind);
                if (!group.length) return null;
                return (
                  <div key={kind} className="mb-3" data-testid={`record-group-${kind}`}>
                    <div className="flex items-center justify-between px-2 pb-1.5 pt-2">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-600">{KIND_LABELS[kind]}</h3>
                      <span className="font-mono text-[10px] text-stone-700">{group.length}</span>
                    </div>
                    <ul className="space-y-1">
                      {group.map((record) => {
                        const active = (draft?.id ?? selectedId) === record.id;
                        const conflict = getCatalogDateConflict(record);
                        return (
                          <li key={record.id}>
                            <button type="button" onClick={() => beginEdit(record)}
                              className={`flex w-full min-w-0 items-center gap-3 rounded-lg border px-2.5 py-2.5 text-left transition-colors ${active ? "border-primary/50 bg-primary/10" : "border-transparent hover:border-border hover:bg-muted/50"}`}
                              data-testid={`record-row-${record.id}`} aria-current={active ? "true" : undefined}>
                              <RecordMark kind={record.kind} />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium text-stone-200">{record.name}</span>
                                <span className="mt-0.5 block truncate text-[10px] text-stone-600">
                                  {<span className={record.date ? "font-mono text-primary" : "text-destructive/80"}>{displayDate(record.date) || "No date"} · </span>}
                                   {[record.sport, record.competition].filter(Boolean).join(" · ") || (record.kind === "person" ? record.roles.join(", ") : record.kind)}
                                  {record.source === "built-in" ? " · Built-in" : " · User"}
                                </span>
                              </span>
                              {conflict && <span className="shrink-0 rounded border border-amber-800/70 bg-amber-950/40 px-1.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-300" data-testid={`date-conflict-badge-${record.id}`}>Date conflict</span>}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="px-4 py-10 text-center" data-testid="catalog-empty-state">
                  <p className="font-display text-sm font-medium text-stone-300">No matching records</p>
                  <p className="mt-1 text-xs text-stone-600">Adjust your filters or add a new reference record.</p>
                  <button type="button" className={`${subtleButton} mt-4`} onClick={() => { setQuery(""); setKindFilter("all"); setSourceFilter("all"); setSportFilter("all"); setCompetitionFilter("all"); setConflictsOnly(false); setDateFilter("all"); }} data-testid="clear-filters-button">Clear filters</button>
                </div>
              )}
            </div>
          </section>

          <section aria-label={isCreating ? "Create record" : "Record editor"} className="glass-card min-w-0 rounded-xl">
            {selected ? (
              <form onSubmit={handleSave} className="p-4 sm:p-6" data-testid="catalog-record-form">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <RecordMark kind={selected.kind} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display truncate text-xl font-semibold text-stone-100" data-testid="editor-heading">
                          {isCreating ? `New ${selected.kind}` : selected.name || "Untitled record"}
                        </h2>
                        <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground" data-testid="record-source">
                          {isCreating ? "User record" : selected.source === "built-in" ? (selected.edited ? "Built-in · edited" : "Built-in") : "User record"}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-stone-600">{isCreating ? "Add canonical details for Learned Code." : `Record ID · ${selected.id}`}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selected.source === "built-in" && !isCreating && (
                      <button type="button" onClick={handleReset} disabled={!selected.edited}
                        className={subtleButton} data-testid="reset-record-button">Restore built-in</button>
                    )}
                    {selected.source === "user" && !isCreating && !confirmDelete && (
                      <button type="button" onClick={() => { setConfirmDelete(true); setErrors([]); }}
                        className={`${buttonBase} border-red-900/70 bg-red-950/20 text-red-300 hover:bg-red-950/50`} data-testid="delete-record-button">Delete</button>
                    )}
                    <button type="button" onClick={cancelEdit} className={subtleButton} data-testid="cancel-edit-button">Close</button>
                  </div>
                </div>

                {confirmDelete && (
                  <div className="mb-5 flex flex-col gap-3 rounded-lg border border-red-900/60 bg-red-950/15 p-3 sm:flex-row sm:items-center sm:justify-between" data-testid="delete-confirmation">
                    <p className="text-xs leading-relaxed text-red-200">Delete <strong>{selected.name}</strong>? Linked records must be unlinked first.</p>
                    <div className="flex shrink-0 gap-2">
                      <button type="button" onClick={() => setConfirmDelete(false)} className={subtleButton} data-testid="cancel-delete-button">Keep record</button>
                      <button type="button" onClick={handleDelete} className={`${buttonBase} border-red-700 bg-red-900 text-white hover:bg-red-800`} data-testid="confirm-delete-button">Confirm delete</button>
                    </div>
                  </div>
                )}

                {getCatalogDateConflict(selected) && (
                  <div className="mb-5 rounded-lg border border-amber-700/60 bg-amber-950/20 p-3.5" role="alert" data-testid="date-conflict-panel">
                    <div className="flex items-start gap-2">
                      <span aria-hidden="true" className="mt-0.5 font-mono text-xs font-bold text-amber-300">!</span>
                      <div>
                        <p className="text-xs font-semibold text-amber-200">Built-in sources disagree on this date</p>
                        <p className="mt-1 text-xs leading-relaxed text-amber-100/60">{selected.sourceConflictDates?.map(displayDate).join(" · ")}</p>
                        <p className="mt-1 text-[11px] text-amber-100/50">Enter a verified date below and save to resolve this conflict.</p>
                      </div>
                    </div>
                  </div>
                )}

                {errors.length > 0 && (
                  <div role="alert" className="mb-4 rounded-lg border border-red-900/70 bg-red-950/20 p-3" data-testid="save-errors">
                    <p className="text-xs font-semibold text-red-200">Could not save this record</p>
                    <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-red-200/80">
                      {errors.map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}
                    </ul>
                  </div>
                )}

                <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                  <LabelField label="Canonical name">
                    <input value={selected.name} onChange={(event) => updateDraft({ name: event.target.value })}
                      className={fieldBase} autoComplete="off" data-testid="record-name-input" />
                  </LabelField>
                  <LabelField label="Date" hint="MM/DD/YYYY">
                    <UsDateInput value={selected.date ?? ""} onChange={date => updateDraft({ date: date || null })} className={fieldBase} label="Verified date, MM/DD/YYYY" testId="record-date-input" />
                  </LabelField>
                  <LabelField label="Aliases" hint="Separate aliases with commas or new lines.">
                    <textarea rows={2} value={selected.aliases.join(", ")}
                      onChange={(event) => updateDraft({ aliases: splitList(event.target.value) })}
                      className={fieldBase + " resize-y"} data-testid="record-aliases-input" />
                  </LabelField>
                  <div className="grid gap-3">
                    <LabelField label="Sport">
                      <input value={selected.sport} onChange={(event) => updateDraft({ sport: event.target.value })}
                        className={fieldBase} placeholder="e.g. Baseball" data-testid="record-sport-input" />
                    </LabelField>
                    <LabelField label="Competition / league">
                      <input value={selected.competition} onChange={(event) => updateDraft({ competition: event.target.value })}
                        className={fieldBase} placeholder="e.g. MLB" data-testid="record-competition-input" />
                    </LabelField>
                  </div>

                  {selected.kind === "team" && (
                    <>
                      <LabelField label="Team colors" hint="Color names or hex values, separated by commas.">
                        <input value={selected.colors.join(", ")} onChange={(event) => updateDraft({ colors: splitList(event.target.value) })}
                          className={fieldBase} placeholder="Navy, #C8102E" data-testid="record-colors-input" />
                      </LabelField>
                      <LabelField label="Home city">
                        <select value={selected.cityId ?? ""} onChange={(event) => updateDraft({ cityId: event.target.value || null })}
                          className={fieldBase} data-testid="record-city-link">
                          <option value="">No city linked</option>
                          {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
                        </select>
                      </LabelField>
                      <LabelField label="Home stadium">
                        <select value={selected.stadiumId ?? ""} onChange={(event) => updateDraft({ stadiumId: event.target.value || null })}
                          className={fieldBase} data-testid="record-stadium-link">
                          <option value="">No stadium linked</option>
                          {stadiums.map((stadium) => <option key={stadium.id} value={stadium.id}>{stadium.name}</option>)}
                        </select>
                      </LabelField>
                    </>
                  )}

                  {selected.kind === "stadium" && (
                    <LabelField label="City">
                      <select value={selected.cityId ?? ""} onChange={(event) => updateDraft({ cityId: event.target.value || null })}
                        className={fieldBase} data-testid="record-city-link">
                        <option value="">No city linked</option>
                        {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
                      </select>
                    </LabelField>
                  )}

                  {selected.kind === "person" && (
                    <>
                      <fieldset className="min-w-0 rounded-lg border border-border p-3 sm:col-span-2">
                        <legend className="px-1 text-xs font-medium text-stone-400">Person roles</legend>
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                          {ROLES.map((role) => (
                            <label key={role} className="flex cursor-pointer items-center gap-2 text-xs capitalize text-stone-400">
                              <input type="checkbox" checked={selected.roles.includes(role)}
                                onChange={(event) => updateDraft({ roles: event.target.checked ? [...selected.roles, role] : selected.roles.filter((item) => item !== role) })}
                                className="accent-primary" data-testid={`person-role-${role}`} />
                              {role}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <LabelField label="Jersey">
                        <input value={selected.jersey} onChange={(event) => updateDraft({ jersey: event.target.value })}
                          className={fieldBase} placeholder="Number or identifier" data-testid="record-jersey-input" />
                      </LabelField>
                      <fieldset className="min-w-0 rounded-lg border border-border p-3">
                        <legend className="px-1 text-xs font-medium text-stone-400">Teams</legend>
                        <div className="max-h-40 space-y-2 overflow-y-auto">
                          {teams.map((team) => (
                            <label key={team.id} className="flex cursor-pointer items-center gap-2 text-xs text-stone-400">
                              <input type="checkbox" checked={selected.teamIds.includes(team.id)}
                                onChange={(event) => updateDraft({ teamIds: event.target.checked ? [...selected.teamIds, team.id] : selected.teamIds.filter((id) => id !== team.id) })}
                                className="accent-primary" data-testid={`person-team-${team.id}`} />
                              <span className="truncate">{team.name}</span>
                            </label>
                          ))}
                          {teams.length === 0 && <p className="text-xs text-stone-600">Create a team record to link it here.</p>}
                        </div>
                      </fieldset>
                    </>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <p className="text-[11px] text-stone-600" data-testid="editor-source-note">
                    {selected.source === "built-in" ? "Edits override the built-in reference. You can restore the original at any time." : "User-created records are protected while other records reference them."}
                  </p>
                  <button type="submit" className={accentButton} data-testid="save-record-button">
                    {isCreating ? "Create record" : "Save changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center" data-testid="catalog-editor-empty">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 font-mono text-sm text-primary">REF</div>
                <h2 className="font-display text-lg font-semibold text-stone-200">Choose a record to inspect</h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-600">Search the canonical catalog, resolve a source-date conflict, or create a new team, person, city, or stadium.</p>
                <button type="button" className={`${accentButton} mt-5`} onClick={() => beginCreate("team")} data-testid="empty-create-team-button">Add a team</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
