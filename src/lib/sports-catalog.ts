import { useSyncExternalStore } from "react";
import { getTeamMeta, SPORTS_TEAM_GROUPS, TEAM_ALIASES, type DateTuple, type TeamMeta } from "./sports-data.ts";
import { TEAM_COLORS } from "./sports-colors.ts";
import { EXTRA_SPORTS_RECORDS } from "./sports-catalog-seeds";
import masterHistory from "./master-history.json";

export type SportsCatalogKind = "team" | "person" | "city" | "stadium";
export type SportsPersonRole = "player" | "pitcher" | "quarterback" | "goalie" | "coach" | "manager" | "owner" | "staff";
export type SportsDateBasis = "program-start" | "country-state";
const SPORTS_TEAM_COLOR_REVISION = 2;
const LEARNED_FOUNDING_DATE_OVERRIDES: Record<string, { date: string; sourceUrl: string }> = {
  // The Packers were organized in 1919; 1921 is their NFL admission year.
  "green bay packers": {
    date: "1919-08-11",
    sourceUrl: "https://www.packers.com/history/",
  },
};

export interface SportsCatalogRecord {
  id: string;
  kind: SportsCatalogKind;
  name: string;
  aliases: string[];
  /** ISO date. Team dates follow dateBasis; people use date of birth. */
  date: string | null;
  /** Distinguishes sport-program start dates and country-state dates from other team dates. */
  dateBasis?: SportsDateBasis;
  sport: string;
  competition: string;
  colors: string[];
  cityId: string | null;
  stadiumId: string | null;
  teamIds: string[];
  roles: SportsPersonRole[];
  jersey: string;
  source: "built-in" | "user";
  sourceUrl?: string;
  edited?: boolean;
  sourceConflictDates?: string[];
  /** Marks built-in NFL/NBA colors applied from the current user-provided map. */
  colorRevision?: number;
}

export interface LearnedTeamMeta {
  founded?: DateTuple;
  city?: string;
  cityFounded?: DateTuple;
  cityId: string | null;
  stadium?: string;
  stadiumOpened?: DateTuple;
  stadiumId: string | null;
  colors: string[];
}

export type CatalogSaveResult =
  | { ok: true; record: SportsCatalogRecord }
  | { ok: false; errors: string[] };

const STORAGE_KEY = "shem-sports-catalog-v1";
const listeners = new Set<() => void>();
let catalogCache: SportsCatalogRecord[] | null = null;

export function normalizeSportsName(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function createSportsCatalogId(kind: SportsCatalogKind, name: string): string {
  const slug = normalizeSportsName(name).replace(/\s+/g, "-");
  return `${kind}:${slug || "new-record"}`;
}

function isoDate([year, month, day]: DateTuple): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function dateTuple(value: string | null | undefined): DateTuple | undefined {
  if (!value) return undefined;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  const [, y, m, d] = match;
  const year = Number(y), month = Number(m), day = Number(d);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day
    ? [year, month, day]
    : undefined;
}

function emptyRecord(kind: SportsCatalogKind, name: string, source: SportsCatalogRecord["source"]): SportsCatalogRecord {
  return {
    id: createSportsCatalogId(kind, name),
    kind,
    name,
    aliases: [],
    date: null,
    sport: "",
    competition: "",
    colors: [],
    cityId: null,
    stadiumId: null,
    teamIds: [],
    roles: [],
    jersey: "",
    source,
  };
}

export function newSportsCatalogRecord(kind: SportsCatalogKind, name = ""): SportsCatalogRecord {
  return emptyRecord(kind, name, "user");
}

const SPORT_BY_COMPETITION: Record<string, string> = {
  MLB: "Baseball",
  NBA: "Basketball",
  NFL: "American Football",
  NHL: "Ice Hockey",
};

function buildBaseCatalog(): SportsCatalogRecord[] {
  const cityDates = new Map<string, { name: string; values: Set<string> }>();
  const stadiumDates = new Map<string, { name: string; values: Set<string> }>();
  const teamRows: Array<{ name: string; competition: string; meta: TeamMeta }> = [];

  for (const [competition, teams] of Object.entries(SPORTS_TEAM_GROUPS)) {
    for (const [name, meta] of Object.entries(teams)) {
      teamRows.push({ name, competition, meta });
      const cityKey = normalizeSportsName(meta.city);
      const city = cityDates.get(cityKey) ?? { name: meta.city, values: new Set<string>() };
      city.values.add(isoDate(meta.cityFounded));
      cityDates.set(cityKey, city);

      const stadiumKey = normalizeSportsName(meta.stadium);
      const stadium = stadiumDates.get(stadiumKey) ?? { name: meta.stadium, values: new Set<string>() };
      stadium.values.add(isoDate(meta.stadiumOpened));
      stadiumDates.set(stadiumKey, stadium);
    }
  }

  const locationRecord = (
    kind: "city" | "stadium",
    name: string,
    values: Set<string>,
  ): SportsCatalogRecord => {
    const uniqueDates = [...values].sort();
    return {
      ...emptyRecord(kind, name, "built-in"),
      date: uniqueDates.length === 1 ? uniqueDates[0] : null,
      sourceConflictDates: uniqueDates.length > 1 ? uniqueDates : [],
    };
  };

  const cities = [...cityDates.values()].map((row) => locationRecord("city", row.name, row.values));
  const cityIds = new Map(cities.map((record) => [normalizeSportsName(record.name), record.id]));
  const stadiums = [...stadiumDates.values()].map((row) => locationRecord("stadium", row.name, row.values));
  const stadiumIds = new Map(stadiums.map((record) => [normalizeSportsName(record.name), record.id]));
  const teamRecords = teamRows.map(({ name, competition, meta }) => {
    const record = emptyRecord("team", name, "built-in");
    const foundedOverride = LEARNED_FOUNDING_DATE_OVERRIDES[normalizeSportsName(name)];
    record.date = foundedOverride?.date ?? isoDate(meta.founded);
    record.sourceUrl = foundedOverride?.sourceUrl;
    record.sport = SPORT_BY_COMPETITION[competition] ?? competition;
    record.competition = competition;
    record.colors = [...(TEAM_COLORS[name] ?? TEAM_COLORS[Object.entries(TEAM_ALIASES).find(([, canonical]) => canonical === name)?.[0] ?? ""] ?? [])];
    if (competition === "NFL" || competition === "NBA") record.colorRevision = SPORTS_TEAM_COLOR_REVISION;
    record.cityId = cityIds.get(normalizeSportsName(meta.city)) ?? null;
    record.stadiumId = stadiumIds.get(normalizeSportsName(meta.stadium)) ?? null;
    record.aliases = Object.entries(TEAM_ALIASES)
      .filter(([, canonical]) => canonical === name)
      .map(([alias]) => alias);
    return record;
  });
  const stadiumCityIds = new Map<string, string>();
  for (const { meta } of teamRows) {
    const stadiumId = stadiumIds.get(normalizeSportsName(meta.stadium));
    const cityId = cityIds.get(normalizeSportsName(meta.city));
    if (stadiumId && cityId && !stadiumCityIds.has(stadiumId)) stadiumCityIds.set(stadiumId, cityId);
  }
  for (const stadium of stadiums) stadium.cityId = stadiumCityIds.get(stadium.id) ?? null;
  const base = [...teamRecords, ...cities, ...stadiums];
  const seen = new Set(base.map(row => `${row.kind}:${normalizeSportsName(row.name)}`));
  const add = (row: SportsCatalogRecord) => {
    const canonical = TEAM_ALIASES[row.name] || row.name;
    const key = `${row.kind}:${normalizeSportsName(canonical)}`;
    const existing = seen.has(key)
      ? base.find((record) => `${record.kind}:${normalizeSportsName(TEAM_ALIASES[record.name] || record.name)}` === key)
      : undefined;
    if (existing) {
      if (!existing.date && row.date) existing.date = row.date;
      if (!existing.sourceUrl && row.sourceUrl) existing.sourceUrl = row.sourceUrl;
      if (!existing.sport && row.sport) existing.sport = row.sport;
      if (!existing.competition && row.competition) existing.competition = row.competition;
      if (!existing.colors.length && row.colors.length) existing.colors = [...row.colors];
      if (!existing.cityId && row.cityId) existing.cityId = row.cityId;
      if (!existing.stadiumId && row.stadiumId) existing.stadiumId = row.stadiumId;
      existing.aliases = [...new Set([...existing.aliases, ...row.aliases])];
      return;
    }
    base.push(row);
    seen.add(key);
  };
  for (const seed of EXTRA_SPORTS_RECORDS) {
    add({ ...emptyRecord(seed.kind, seed.name, "built-in"), date: seed.date, dateBasis: "dateBasis" in seed ? seed.dateBasis : undefined, aliases: [...seed.aliases], competition: seed.competition, sport: seed.sport, colors: [...seed.colors], sourceUrl: "sourceUrl" in seed ? seed.sourceUrl : undefined, roles: seed.kind === "person" ? ["player"] : [] });
  }
  for (const day of masterHistory.days) for (const game of day.games) {
    const stadiumId = createSportsCatalogId("stadium", game.venue);
    add({ ...emptyRecord("stadium", game.venue, "built-in") });
    for (const name of [game.home, game.away]) {
      add({ ...emptyRecord("team", name, "built-in"), competition: game.league, sport: /Football/.test(game.league) ? "American Football" : /Basketball|NBA/.test(game.league) ? "Basketball" : "Ice Hockey", stadiumId: name === game.home ? stadiumId : null });
    }
  }
  return base;
}

const BASE_CATALOG = buildBaseCatalog();
const BASE_BY_ID = new Map(BASE_CATALOG.map((record) => [record.id, record]));
const BASE_IDS = new Set(BASE_BY_ID.keys());

function parseStoredCatalog(): SportsCatalogRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const value = JSON.parse(raw) as { version?: number; records?: SportsCatalogRecord[] };
    if (value.version !== 1 || !Array.isArray(value.records)) return [];
    return value.records.filter((record) =>
      record && typeof record.id === "string" &&
      ["team", "person", "city", "stadium"].includes(record.kind) &&
      typeof record.name === "string",
    );
  } catch {
    return [];
  }
}

function readCatalog(): SportsCatalogRecord[] {
  if (catalogCache) return catalogCache;
  const merged = new Map(BASE_CATALOG.map((record) => [record.id, record]));
  for (const saved of parseStoredCatalog()) {
    const builtin = BASE_BY_ID.get(saved.id);
    const collegeTeam = saved.kind === "team" && saved.competition.startsWith("College");
    const refreshProColors = builtin?.kind === "team" &&
      (builtin.competition === "NFL" || builtin.competition === "NBA") &&
      (saved.colorRevision ?? 0) < SPORTS_TEAM_COLOR_REVISION;
    const learnedFoundingDate = builtin?.kind === "team" && saved.source !== "user"
      ? LEARNED_FOUNDING_DATE_OVERRIDES[normalizeSportsName(builtin.name)]
      : undefined;
    const dateBasis = saved.dateBasis ?? builtin?.dateBasis;
    const staleCountryDate = builtin?.dateBasis === "country-state" && saved.dateBasis !== "country-state";
    merged.set(saved.id, {
      ...(builtin ?? emptyRecord(saved.kind, saved.name, "user")),
      ...saved,
      // Older catalog entries stored a university's foundation date as if it
      // were the athletic program's start. Ignore those until a verified
      // program-start date is explicitly tagged.
      date: collegeTeam && dateBasis !== "program-start"
        ? null
        : staleCountryDate
          ? builtin?.date ?? null
          : learnedFoundingDate?.date ?? saved.date ?? builtin?.date ?? null,
      dateBasis,
      sourceUrl: collegeTeam && dateBasis !== "program-start"
        ? undefined
        : learnedFoundingDate?.sourceUrl ?? saved.sourceUrl ?? builtin?.sourceUrl,
      aliases: Array.isArray(saved.aliases) ? saved.aliases : [],
      colors: refreshProColors
        ? [...(builtin?.colors ?? [])]
        : Array.isArray(saved.colors) ? saved.colors : [],
      colorRevision: refreshProColors
        ? SPORTS_TEAM_COLOR_REVISION
        : saved.colorRevision ?? builtin?.colorRevision,
      teamIds: Array.isArray(saved.teamIds) ? saved.teamIds : [],
      roles: Array.isArray(saved.roles) ? saved.roles : [],
    });
  }
  catalogCache = [...merged.values()].sort((a, b) =>
    a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name),
  );
  return catalogCache;
}

function notifyCatalogChanged() {
  catalogCache = null;
  const current = readCatalog();
  for (const listener of listeners) listener();
  return current;
}

function subscribeCatalog(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) notifyCatalogChanged();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

export function getSportsCatalogSnapshot(): SportsCatalogRecord[] {
  return readCatalog();
}

/** Canonical catalog used by the shipped historical replay, before browser edits. */
export function getBuiltInSportsCatalogSnapshot(): SportsCatalogRecord[] {
  return BASE_CATALOG;
}

const verifiedHistoricalCatalogCache = new WeakMap<SportsCatalogRecord[], SportsCatalogRecord[]>();

/**
 * Historical Learned replays may use later-entered fixed facts only when the
 * catalog record has a dated HTTPS source and no unresolved date conflict.
 * This admits verified births/founding dates without pulling in unsourced
 * browser edits as if they were known facts.
 */
export function getVerifiedSportsCatalogSnapshot(
  records: SportsCatalogRecord[] = getSportsCatalogSnapshot(),
): SportsCatalogRecord[] {
  if (records === BASE_CATALOG) return BASE_CATALOG;
  const cached = verifiedHistoricalCatalogCache.get(records);
  if (cached) return cached;
  const merged = new Map(BASE_CATALOG.map((record) => [record.id, record]));
  for (const record of records) {
    if (!record.date || record.sourceConflictDates?.length) continue;
    try {
      if (new URL(record.sourceUrl || "").protocol !== "https:") continue;
    } catch {
      continue;
    }
    merged.set(record.id, record);
  }
  const snapshot = [...merged.values()];
  verifiedHistoricalCatalogCache.set(records, snapshot);
  return snapshot;
}

/** Metadata ingestion fills gaps once and never replaces a manually saved record. */
export function ingestSportsFeed(rows: Array<{name: string; competition: string; colors?: string[]; people?: Array<{name: string; date?: string; role: SportsPersonRole; jersey?: string; sourceUrl?: string}>; stadium?: string; city?: string}>) {
  if (typeof window === "undefined") return;
  const stored = parseStoredCatalog();
  const current = readCatalog();
  let changed = false;
  for (const row of rows) {
    const team = resolveRecord(current, "team", row.name) ?? { ...emptyRecord("team", row.name, "user"), competition: row.competition, sport: /NBA|Basketball|WNBA/.test(row.competition) ? "Basketball" : /NFL|Football/.test(row.competition) ? "American Football" : row.competition === "NHL" ? "Ice Hockey" : row.competition === "MLB" ? "Baseball" : "Soccer" };
    const manual = stored.find(r => r.id === team.id);
    if (!manual || (manual.source === "built-in" && !manual.edited)) {
      const updated = { ...team, colors: row.colors?.length ? row.colors : team.colors };
      for (const kind of ["stadium", "city"] as const) {
        const name = row[kind];
        if (!name) continue;
        const location = resolveRecord(current, kind, name) ?? emptyRecord(kind, name, "user");
        if (!current.some(r => r.id === location.id) && !stored.some(r => r.id === location.id)) {
          stored.push(location); current.push(location); changed = true;
        }
        if (kind === "stadium") updated.stadiumId = location.id; else updated.cityId = location.id;
      }
      if (JSON.stringify(team) !== JSON.stringify(updated) || !current.some(r => r.id === team.id)) {
        const idx = stored.findIndex(r => r.id === team.id);
        if (idx >= 0) stored[idx] = updated; else stored.push(updated);
        changed = true;
      }
    }
    for (const p of row.people || []) {
      const previous = resolveRecord(current, "person", p.name);
      const manualPerson = previous && stored.find(r => r.id === previous.id);
      if (manualPerson) continue;
      const person = { ...(previous ?? emptyRecord("person", p.name, "user")), date: previous?.date || p.date || null, sourceUrl: previous?.sourceUrl || p.sourceUrl, jersey: previous?.jersey || p.jersey || "", competition: row.competition, teamIds: [...new Set([...(previous?.teamIds || []), team.id])], roles: [...new Set([...(previous?.roles || []), p.role])] };
      stored.push(person); current.push(person); changed = true;
    }
  }
  if (changed) { persistRecords(stored); notifyCatalogChanged(); }
}

export function useSportsCatalog(): SportsCatalogRecord[] {
  return useSyncExternalStore(subscribeCatalog, getSportsCatalogSnapshot, () => BASE_CATALOG);
}

export function isBuiltInCatalogRecord(id: string): boolean {
  return BASE_IDS.has(id);
}

function resolveRecord(records: SportsCatalogRecord[], kind: SportsCatalogKind, nameOrAlias: string): SportsCatalogRecord | undefined {
  const query = normalizeSportsName(nameOrAlias);
  if (!query) return undefined;
  return records.find((record) => record.kind === kind &&
    (normalizeSportsName(record.name) === query || record.aliases.some((alias) => normalizeSportsName(alias) === query)));
}

export function validateSportsCatalogRecord(
  candidate: SportsCatalogRecord,
  records: SportsCatalogRecord[] = getSportsCatalogSnapshot(),
): string[] {
  const errors: string[] = [];
  if (!candidate.name.trim()) errors.push("Enter a name.");
  if (candidate.date && !dateTuple(candidate.date)) errors.push("Enter a valid calendar date.");
  if (candidate.kind === "team" && (!candidate.sport.trim() || !candidate.competition.trim())) {
    errors.push("Teams need both a sport and a competition.");
  }
  if (candidate.kind === "person" && candidate.roles.length === 0) errors.push("Choose at least one person role.");
  if (candidate.kind === "stadium" && candidate.cityId && !records.some((record) => record.id === candidate.cityId && record.kind === "city")) {
    errors.push("Choose a city that exists in the catalog.");
  }
  if (candidate.kind === "team") {
    if (candidate.cityId && !records.some((record) => record.id === candidate.cityId && record.kind === "city")) errors.push("Choose a city that exists in the catalog.");
    if (candidate.stadiumId && !records.some((record) => record.id === candidate.stadiumId && record.kind === "stadium")) errors.push("Choose a stadium that exists in the catalog.");
  }
  if (candidate.kind === "person" && candidate.teamIds.some((id) => !records.some((record) => record.id === id && record.kind === "team"))) {
    errors.push("Remove team links that are no longer in the catalog.");
  }
  if (candidate.colors.some((color) => !/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(color.trim()) && !/^[a-z][a-z -]{0,23}$/i.test(color.trim()))) {
    errors.push("Colors must be names or 3/6-digit hex values.");
  }
  const candidateNames = [candidate.name, ...candidate.aliases].map(normalizeSportsName).filter(Boolean);
  for (const other of records) {
    if (other.id === candidate.id || other.kind !== candidate.kind) continue;
    const otherNames = [other.name, ...other.aliases].map(normalizeSportsName).filter(Boolean);
    if (candidateNames.some((name) => otherNames.includes(name))) {
      errors.push(`“${other.name}” or one of its aliases already uses that name.`);
      break;
    }
  }
  return errors;
}

function persistRecords(records: SportsCatalogRecord[]): void {
  if (typeof window === "undefined") throw new Error("The sports catalog can only be saved in a browser.");
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, records }));
}

export function saveSportsCatalogRecord(candidate: SportsCatalogRecord): CatalogSaveResult {
  const records = getSportsCatalogSnapshot();
  const previous = records.find((record) => record.id === candidate.id);
  const aliases = [...candidate.aliases];
  if (previous && normalizeSportsName(previous.name) !== normalizeSportsName(candidate.name) &&
      !aliases.some((alias) => normalizeSportsName(alias) === normalizeSportsName(previous.name))) {
    aliases.push(previous.name);
  }
  const withPreviousNameAlias = { ...candidate, aliases };
  const errors = validateSportsCatalogRecord(withPreviousNameAlias, records);
  if (errors.length) return { ok: false, errors };

  const normalized: SportsCatalogRecord = {
    ...withPreviousNameAlias,
    name: withPreviousNameAlias.name.trim(),
    aliases: [...new Set(withPreviousNameAlias.aliases.map((alias) => alias.trim()).filter(Boolean))],
    colors: [...new Set(candidate.colors.map((color) => color.trim()).filter(Boolean))],
    teamIds: [...new Set(candidate.teamIds)],
    roles: [...new Set(candidate.roles)],
    dateBasis: candidate.kind === "team" && candidate.competition.startsWith("College") && candidate.date
      ? "program-start"
      : candidate.dateBasis,
    source: BASE_IDS.has(candidate.id) ? "built-in" : "user",
    edited: BASE_IDS.has(candidate.id) ? true : undefined,
    colorRevision: BASE_IDS.has(candidate.id) &&
      candidate.kind === "team" &&
      (candidate.competition === "NFL" || candidate.competition === "NBA")
      ? SPORTS_TEAM_COLOR_REVISION
      : candidate.colorRevision,
    sourceConflictDates: candidate.date ? [] : candidate.sourceConflictDates ?? [],
  };
  const saved = parseStoredCatalog().filter((record) => record.id !== normalized.id);
  saved.push(normalized);
  try {
    persistRecords(saved);
    notifyCatalogChanged();
    return { ok: true, record: normalized };
  } catch (error) {
    return { ok: false, errors: [error instanceof Error ? error.message : "Could not save this catalog record."] };
  }
}

export function resetSportsCatalogRecord(id: string): boolean {
  if (!BASE_IDS.has(id)) return false;
  const saved = parseStoredCatalog().filter((record) => record.id !== id);
  try {
    persistRecords(saved);
    notifyCatalogChanged();
    return true;
  } catch {
    return false;
  }
}

export function deleteSportsCatalogRecord(id: string): { ok: true } | { ok: false; error: string } {
  if (BASE_IDS.has(id)) return { ok: false, error: "Built-in entries cannot be deleted; reset an edit to restore the original." };
  const records = getSportsCatalogSnapshot();
  const referenced = records.some((record) =>
    (record.kind === "team" && (record.cityId === id || record.stadiumId === id)) ||
    (record.kind === "stadium" && record.cityId === id) ||
    (record.kind === "person" && record.teamIds.includes(id)),
  );
  if (referenced) return { ok: false, error: "This entry is linked to other records. Remove those links before deleting it." };
  const saved = parseStoredCatalog().filter((record) => record.id !== id);
  try {
    persistRecords(saved);
    notifyCatalogChanged();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not delete this catalog record." };
  }
}

function tupleOrUndefined(value: string | null): DateTuple | undefined {
  return dateTuple(value);
}

export function getLearnedTeamMeta(
  name: string,
  records: SportsCatalogRecord[] = getSportsCatalogSnapshot(),
  competition?: string,
): LearnedTeamMeta | undefined {
  const base = getTeamMeta(name);
  const learnedFoundingDate = LEARNED_FOUNDING_DATE_OVERRIDES[normalizeSportsName(name)];
  const team = resolveRecord(records, "team", name) ??
    (base ? resolveRecord(records, "team", TEAM_ALIASES[name] || name) : undefined);
  if (!team) {
    if (!base) return undefined;
    return {
      ...base,
      founded: learnedFoundingDate ? tupleOrUndefined(learnedFoundingDate.date) ?? base.founded : base.founded,
      colors: [...(TEAM_COLORS[TEAM_ALIASES[name] || name] ?? TEAM_COLORS[name] ?? [])],
      cityId: null,
      stadiumId: null,
    };
  }
  const collegeTeam = team.competition.startsWith("College");
  const matchingCollegeProgram = !collegeTeam ||
    (team.competition === competition && team.dateBasis === "program-start");
  const city = team.cityId ? records.find((record) => record.id === team.cityId && record.kind === "city") : undefined;
  const stadium = team.stadiumId ? records.find((record) => record.id === team.stadiumId && record.kind === "stadium") : undefined;
  return {
    founded: matchingCollegeProgram ? tupleOrUndefined(team.date) : undefined,
    city: city?.name,
    cityFounded: tupleOrUndefined(city?.date ?? null),
    cityId: team.cityId,
    stadium: stadium?.name,
    stadiumOpened: tupleOrUndefined(stadium?.date ?? null),
    stadiumId: team.stadiumId,
    colors: [...team.colors],
  };
}

export function findSportsCatalogRecord(
  kind: SportsCatalogKind,
  nameOrAlias: string,
  records: SportsCatalogRecord[] = getSportsCatalogSnapshot(),
): SportsCatalogRecord | undefined {
  return resolveRecord(records, kind, nameOrAlias);
}

export function getLearnedLocationMeta(
  kind: "city" | "stadium",
  nameOrAlias: string,
  records: SportsCatalogRecord[] = getSportsCatalogSnapshot(),
): { id: string; name: string; date?: DateTuple; cityId: string | null } | undefined {
  const record = resolveRecord(records, kind, nameOrAlias);
  if (!record) return undefined;
  return {
    id: record.id,
    name: record.name,
    date: tupleOrUndefined(record.date),
    cityId: record.cityId,
  };
}

export function getLearnedPeopleForTeam(
  teamName: string,
  records: SportsCatalogRecord[] = getSportsCatalogSnapshot(),
): SportsCatalogRecord[] {
  const team = resolveRecord(records, "team", teamName);
  if (!team) return [];
  return records.filter((record) => record.kind === "person" && record.teamIds.includes(team.id));
}

export function teamIdForCatalogName(name: string, records: SportsCatalogRecord[] = getSportsCatalogSnapshot()): string | undefined {
  return resolveRecord(records, "team", name)?.id;
}

export function getCatalogDateConflict(record: SportsCatalogRecord): string | null {
  if (!record.sourceConflictDates?.length) return null;
  return `Built-in sources disagree on this date: ${record.sourceConflictDates.join(", ")}. Set a verified date to resolve it.`;
}
