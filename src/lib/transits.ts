// Planet positions at a moment (geocentric, true ecliptic of date), shown in
// both zodiacs: tropical (Western, tied to the March equinox) and sidereal
// (Vedic, tied to the stars). Sidereal = tropical − ayanamsa (Lahiri).
import { Body, Ecliptic, GeoVector, EclipticGeoMoon, MakeTime } from "astronomy-engine";

export const WESTERN_SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] as const;

/** Lahiri ayanamsa (degrees): 23.853° at J2000, growing ~50.29″ a year (about 1° every 72 years). */
export function lahiriAyanamsa(date: Date): number {
  const years = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * 86400000);
  return 23.853 + (50.2888 / 3600) * years;
}

export interface Transit { planet: string; longitude: number; tropical: string; sidereal: string; retrograde: boolean }

const BODIES: [string, Body][] = [
  ["Sun", Body.Sun], ["Moon", Body.Moon], ["Mercury", Body.Mercury], ["Venus", Body.Venus],
  ["Mars", Body.Mars], ["Jupiter", Body.Jupiter], ["Saturn", Body.Saturn],
];

const norm = (d: number) => ((d % 360) + 360) % 360;
export function signLabel(longitude: number): string {
  const l = norm(longitude);
  const sign = WESTERN_SIGNS[Math.floor(l / 30)];
  return `${Math.floor(l % 30)}° ${sign}`;
}

function longitudeOf(body: Body, date: Date): number {
  const t = MakeTime(date);
  if (body === Body.Moon) return EclipticGeoMoon(t).lon;
  return Ecliptic(GeoVector(body, t, true)).elon;
}

export function transitsAt(date: Date): Transit[] {
  if (Number.isNaN(date.getTime())) return [];
  const ayan = lahiriAyanamsa(date);
  const before = new Date(date.getTime() - 86400000);
  return BODIES.map(([planet, body]) => {
    const lon = norm(longitudeOf(body, date));
    let delta = lon - norm(longitudeOf(body, before));
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return { planet, longitude: lon, tropical: signLabel(lon), sidereal: signLabel(lon - ayan), retrograde: planet !== "Sun" && planet !== "Moon" && delta < 0 };
  });
}

export function transitLines(iso?: string): string[] {
  const date = new Date(iso ?? "");
  const rows = transitsAt(date);
  if (!rows.length) return ["Transits: kickoff time not available."];
  return [
    `Transits at kickoff (Western tropical / Vedic sidereal, Lahiri ${lahiriAyanamsa(date).toFixed(1)}°): ${rows.map((r) => `${r.planet} ${r.tropical} / ${r.sidereal}${r.retrograde ? " ℞" : ""}`).join(" · ")}`,
  ];
}
