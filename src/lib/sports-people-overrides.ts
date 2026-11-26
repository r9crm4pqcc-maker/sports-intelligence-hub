import type { VoteInput, VotePerson } from "./vote-decode";

export type EditableRole = "quarterback" | "coach" | "owner" | "player";

export type OverridePerson = {
  id: string;
  role: EditableRole;
  name: string;
  dob: string; // YYYY-MM-DD
  jersey?: string;
};

export type GamePeopleOverride = {
  away: OverridePerson[];
  home: OverridePerson[];
};

const STORAGE_KEY = "lc_sports_people_overrides_v1";

function readAll(): Record<string, GamePeopleOverride> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getGamePeopleOverride(gameKey: string): GamePeopleOverride | null {
  return readAll()[gameKey] ?? null;
}

export function saveGamePeopleOverride(gameKey: string, data: GamePeopleOverride | null): void {
  if (typeof window === "undefined") return;
  try {
    const all = readAll();
    if (!data) delete all[gameKey];
    else all[gameKey] = data;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    throw new Error("Changes could not be saved. Browser storage is full or unavailable.");
  }
}

export function parseDobString(dob: string): [number, number, number] | undefined {
  const m = dob.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return undefined;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (y < 1800 || date.getUTCFullYear() !== y || date.getUTCMonth() + 1 !== mo || date.getUTCDate() !== d) return undefined;
  return [y, mo, d];
}

export function seedOverridesFromInput(people: VotePerson[] = []): OverridePerson[] {
  const roles: EditableRole[] = ["quarterback", "coach", "owner"];
  const result: OverridePerson[] = roles.map((role) => {
    const match = people.find((p) =>
      role === "quarterback"
        ? p.role === "quarterback" || p.role === "pitcher" || p.role === "goalie"
        : p.role === role,
    );
    return {
      id: role,
      role,
      name: match?.name ?? "",
      dob: match?.dob ?? "",
      jersey: match?.jersey ?? "",
    };
  });
  people
    .filter((p) => p.role === "player")
    .forEach((p, i) => {
      result.push({
        id: `player-${i}`,
        role: "player",
        name: p.name ?? "",
        dob: p.dob ?? "",
        jersey: p.jersey ?? "",
      });
    });
  return result;
}

function toVotePeople(list: OverridePerson[], existing: VotePerson[] = []): VotePerson[] {
  const out: VotePerson[] = [];
  for (const item of list) {
    const name = item.name.trim();
    const dob = parseDobString(item.dob) ? item.dob.trim() : undefined;
    if (!name && !dob) continue;
    const jersey = item.jersey?.trim() || undefined;
    out.push({
      name: name || item.role.toUpperCase(),
      role: item.role,
      dob,
      jersey,
    });
  }
  return out.length ? out : existing;
}

export function applyPeopleOverrides(input: VoteInput, override: GamePeopleOverride | null): VoteInput {
  if (!override) return input;
  return {
    ...input,
    away: { ...input.away, people: toVotePeople(override.away, input.away.people) },
    home: { ...input.home, people: toVotePeople(override.home, input.home.people) },
  };
}