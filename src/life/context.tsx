import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_PROFILE, type BirthProfile } from "@/lib/life-studio";

const PROFILE_KEY = "life-profile-v1";
const FAMILY_KEY = "life-family-v1";
const LOOKUP_KEY = "life-lookups-v1";

export interface FamilyPerson {
  id: string;
  name: string;
  relation: string;
  year: number;
  month: number;
  day: number;
}

export interface SavedLookup {
  id: string;
  kind: string;
  name: string;
  year: number;
  month: number;
  day: number;
}

function rid() {
  return Math.random().toString(36).slice(2, 10);
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

interface LifeState {
  profile: BirthProfile;
  setProfile: (p: BirthProfile) => void;
  family: FamilyPerson[];
  setFamily: (p: FamilyPerson[]) => void;
  lookups: SavedLookup[];
  setLookups: (p: SavedLookup[]) => void;
  ready: boolean;
}

const Ctx = createContext<LifeState | null>(null);

export function LifeProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<BirthProfile>(DEFAULT_PROFILE);
  const [family, setFamilyState] = useState<FamilyPerson[]>([]);
  const [lookups, setLookupsState] = useState<SavedLookup[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfileState(read(PROFILE_KEY, DEFAULT_PROFILE));
    setFamilyState(read(FAMILY_KEY, []));
    setLookupsState(read(LOOKUP_KEY, []));
    setReady(true);
  }, []);

  const setProfile = (p: BirthProfile) => {
    setProfileState(p);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  };
  const setFamily = (p: FamilyPerson[]) => {
    setFamilyState(p);
    localStorage.setItem(FAMILY_KEY, JSON.stringify(p));
  };
  const setLookups = (p: SavedLookup[]) => {
    setLookupsState(p);
    localStorage.setItem(LOOKUP_KEY, JSON.stringify(p));
  };

  return <Ctx.Provider value={{ profile, setProfile, family, setFamily, lookups, setLookups, ready }}>{children}</Ctx.Provider>;
}

export function useLife() {
  const v = useContext(Ctx);
  if (!v) throw new Error("LifeProvider missing");
  return v;
}

export { rid };
