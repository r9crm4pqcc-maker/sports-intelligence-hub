import { calcPersonalYear } from "./numerology";
import { CITY_TZ, instantAtVenue } from "./sports-decode";

const sum = (n: number) => [...String(Math.abs(n))].reduce((a, d) => a + Number(d), 0);
export function sportsRoot(n: number): number {
  while (n > 9 && ![11, 22, 33].includes(n)) n = sum(n);
  return n;
}
/** Sports-only month boundary; the personal calendar is intentionally unchanged. */
export function sportsCycles(birthMonth: number, birthDay: number, year: number, month: number, day: number) {
  const py = calcPersonalYear(birthMonth, birthDay, month, day, year);
  const boundary = Math.min(birthDay, new Date(Date.UTC(year, month, 0)).getUTCDate());
  const cycleMonth = day >= boundary ? month : month === 1 ? 12 : month - 1;
  const pmFull = py.reduced + cycleMonth;
  const pm = { compound: pmFull, reduced: sportsRoot(pmFull) };
  const pdFull = pm.reduced + sum(day);
  return {
    py: { ...py, coreSum: py.compound, fullCode: birthMonth + birthDay + sum(py.cycleYear), root: sportsRoot(py.compound) },
    pm,
    pd: { compound: pdFull, reduced: sportsRoot(pdFull) },
  };
}

const VENUE_ZONES: [RegExp, string][] = [
  [/los angeles|san francisco|seattle|portland|sacramento|vegas|vancouver|intuit|crypto.com|golden 1|rogers arena|t-mobile arena|inglewood|santa clara|paradise/, "America/Los_Angeles"],
  [/phoenix|glendale|phx|footprint/, "America/Phoenix"],
  [/denver|colorado|utah|salt lake|delta center|ball arena|folsom/, "America/Denver"],
  [/chicago|houston|dallas|minnesota|memphis|new orleans|san antonio|milwaukee|nashville|kansas|oklahoma|austin|green bay|arlington|united center|toyota center|frost bank|fedexforum|smoothie king|american airlines center/, "America/Chicago"],
  [/new york|boston|miami|orlando|atlanta|detroit|toronto|montreal|ottawa|philadelphia|washington|charlotte|indiana|cleveland|pittsburgh|tampa|columbus|raleigh|new jersey|gainbridge|kaseya|kia center|td garden|scotiabank|prudential|nationwide|capital one|metlife|madison|acrisure|buffalo|orchard park|foxborough|east rutherford|landover|jacksonville/, "America/New_York"],
  [/london|birmingham|manchester|liverpool|bournemouth|arsenal|wembley/, "Europe/London"],
  [/mexico city|arena cdmx|cdmx|guadalajara|estadio akron/, "America/Mexico_City"],
  [/monterrey|estadio bbva/, "America/Monterrey"],
  [/barcelona|madrid|valencia|seville/, "Europe/Madrid"],
  [/paris|lyon|marseille/, "Europe/Paris"],
  [/munich|berlin|dortmund/, "Europe/Berlin"],
  [/milan|rome|turin/, "Europe/Rome"],
  [/tokyo/, "Asia/Tokyo"],
  [/sydney/, "Australia/Sydney"],
  [/doha/, "Asia/Qatar"],
];

/** Resolve an IANA timezone from the catalog venue, without guessing a default. */
export function venueTimeZone(city?: string, venue?: string): string | null {
  const venuePlace = (venue || "").toLowerCase();
  const venueZone = VENUE_ZONES.find(([pattern]) => pattern.test(venuePlace))?.[1];
  if (venueZone) return venueZone;
  const direct = city ? CITY_TZ[city] ?? CITY_TZ[city.replace(/,.*$/, "").trim()] : undefined;
  if (direct) return direct;
  const place = `${city || ""} ${venue || ""}`.toLowerCase();
  return VENUE_ZONES.find(([pattern]) => pattern.test(place))?.[1] ?? null;
}

/** Use venue-local wall time, never the viewer's browser timezone. */
export function venueLocalHour(iso: string, city?: string, venue?: string): number | null {
  const date = new Date(iso);
  const zone = venueTimeZone(city, venue);
  if (Number.isNaN(date.getTime()) || !zone) return null;
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", hourCycle: "h23" }).format(date));
}

/** Format the exact kickoff instant in the venue's local timezone. */
export function venueLocalTimeLabel(iso: string, timeZone: string): string | null {
  const timestamp = instantAtVenue(iso, timeZone);
  if (timestamp === null) return null;
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}
