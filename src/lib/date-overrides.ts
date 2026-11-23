// Saved date / jersey edits for any team, player, coach, city or stadium. Kept in this browser for all future decodes.
import { useSyncExternalStore } from "react";
import { findSportsCatalogRecord, newSportsCatalogRecord, saveSportsCatalogRecord, type SportsCatalogKind } from "./sports-catalog";

export interface EntityOverride { date?: string; jersey?: string; updated: string }
const KEY = "sports_entity_overrides_v1";
const subs = new Set<() => void>();
let cache: Record<string, EntityOverride> | null = null;

export const entityKey = (kind: string, name: string) => `${kind}:${name.trim().toLowerCase()}`;

function read(): Record<string, EntityOverride> {
  if (cache) return cache;
  if (typeof window === "undefined") return {};
  try { cache = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { cache = {}; }
  return cache!;
}
function write(next: Record<string, EntityOverride>) {
  cache = next; localStorage.setItem(KEY, JSON.stringify(next)); subs.forEach(f => f());
}
export function setOverride(key: string, patch: Partial<EntityOverride>) {
  const split = key.indexOf(":");
  const rawKind = key.slice(0, split);
  const kind = (rawKind === "player" ? "person" : rawKind) as SportsCatalogKind;
  const name = key.slice(split + 1);
  if (["team", "person", "city", "stadium"].includes(kind) && (patch.date !== undefined || patch.jersey !== undefined)) {
    const record = findSportsCatalogRecord(kind, name) ?? newSportsCatalogRecord(kind, name);
    const result = saveSportsCatalogRecord({ ...record, date: patch.date || record.date, jersey: patch.jersey ?? record.jersey });
    if (!result.ok) throw new Error(result.errors.join("; "));
  }
  // Dates have one authoritative store: Sports Catalog / Founding Dates.
  const cur = read();
  const { date: _date, ...rest } = { ...cur[key], ...patch };
  write({ ...cur, [key]: { ...rest, updated: new Date().toISOString() } });
}
export function clearOverride(key: string) { const { [key]: _, ...rest } = read(); write(rest); }
const EMPTY = {};
export function useOverrides(): Record<string, EntityOverride> {
  return useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, read, () => EMPTY);
}
