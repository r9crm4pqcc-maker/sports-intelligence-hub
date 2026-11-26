import { reduceNum } from "./vote-decode";

export interface SecretItem {
  title: string;
  detail: string;
}

export interface UpcomingSecretDate {
  iso: string;
  label: string;
  action: string;
}

export interface DailySecretsRead {
  iso: string;
  universalDay: number;
  doToday: SecretItem[];
  avoidToday: SecretItem[];
  upcoming: UpcomingSecretDate[];
  alwaysOn: SecretItem[];
}

function isoOf(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function fmtDate(y: number, m: number, d: number): string {
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function universalDayOf(y: number, m: number, d: number): number {
  const digits = `${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`
    .split("")
    .reduce((sum, ch) => sum + Number(ch), 0);
  return reduceNum(digits);
}

function nextMatchingDate(
  startY: number,
  startM: number,
  startD: number,
  match: (y: number, m: number, d: number, ud: number) => boolean,
): { iso: string; label: string } | null {
  const base = Date.UTC(startY, startM - 1, startD);
  for (let offset = 1; offset <= 45; offset++) {
    const dt = new Date(base + offset * 86400000);
    const y = dt.getUTCFullYear();
    const m = dt.getUTCMonth() + 1;
    const d = dt.getUTCDate();
    if (match(y, m, d, universalDayOf(y, m, d))) {
      return { iso: isoOf(y, m, d), label: fmtDate(y, m, d) };
    }
  }
  return null;
}

export const ALWAYS_ON_SECRETS: SecretItem[] = [
  { title: "The 888 Portal (24)", detail: "Split the day into 8h sleep, 8h work, 8h home. Sleeping over 8h drains emotional energy." },
  { title: "Banking & .28 endings", detail: "End bills, tips, or transfers in .28 (e.g. $22.28). Leave your wallet and work tools open at night." },
  { title: "The $5 bill rule", detail: "Bad luck: give away or tip a $5 bill to flip it. Good luck: don't accept a $5 bill as change." },
  { title: "The Shower Ritual", detail: "Pitch-black shower, water hitting your feet (head away), say 28 out loud 28 times for wealth." },
  { title: "Desk & space", detail: "Never sit with a door behind your back at your desk. Fix water leaks immediately." },
  { title: "4:45–5:00 PM warning", detail: "If a sudden bad gut feeling hits between 4:45 and 5:00 PM, leave the area immediately." },
  { title: "Dating & deal spacing", detail: "3 days apart = more talking · 5 days = romance · 7 days = distance · 8 days = closing deals · 11 days = love." },
];

export function dailySecretsFor(y: number, m: number, d: number): DailySecretsRead {
  const ud = universalDayOf(y, m, d);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun, 6=Sat
  const doToday: SecretItem[] = [];
  const avoidToday: SecretItem[] = [];

  if (d === 28) {
    doToday.push(
      { title: "Wealth Haircut Maxing", detail: "Best day of the month to cut hair, shave, or trim nails to reset wealth energy." },
      { title: "Buy spring water & wealth items", detail: "Buy bulk spring water, shoes/watches/wallets (or open a box bought last 28th), or a pet/clean fish tank." },
      { title: "Domains & calendars", detail: "Strong day to buy website domains or hang a new calendar with 28 on day one (3-hour grace period until 3 AM ET)." },
    );
    avoidToday.push({ title: "Never pay insurance on the 28th", detail: "Avoid paying life insurance companies today." });
  }
  if (d === 22 || ud === 22) {
    doToday.push({ title: "Master Builder deposit day", detail: "Deposit money into your wallet or bank account, buy domains, or launch a build." });
  }
  if (d === 8 || d === 17 || d === 26 || ud === 8) {
    doToday.push({ title: "8-day wealth grooming & domains", detail: "Shaving or trimming nails imprints wealth; strong day for buying domains and closing deals." });
  }
  if (d === 3 || d === 12 || d === 21 || d === 30 || ud === 3) {
    doToday.push({ title: "Best day to market & sell", detail: "People are in the best mood and loosest with cash. Good for anti-aging haircuts (watch laziness/spending)." });
  }
  if (d === 9 || d === 18 || d === 27 || ud === 9) {
    doToday.push({ title: "Letting-go ritual", detail: "Write down what you want to release and burn it safely or dissolve it in water. Finish open projects." });
    avoidToday.push({ title: "Slow sales & no tattoos/surgery", detail: "People are skeptical today; avoid starting major commitments, tattoos, or surgery." });
  }
  if (d === 11 || d === 20 || d === 29 || ud === 11) {
    doToday.push({ title: "Emotional ads day", detail: "Run emotional ads or stories that connect deeply with your audience." });
    avoidToday.push({ title: "11-day fake thoughts", detail: "Watch for sudden negative thoughts in your own voice — recognize them as temporary and don't act on them." });
  }
  if (d === 7 || d === 16 || d === 25 || ud === 7) {
    avoidToday.push({ title: "Danger day for grooming & hats", detail: "Never cut hair, shave, trim nails, get tattoos/surgery, or buy a hat today. Poor for general marketing (except courses/books)." });
  }
  if (d === 4 || d === 13 || d === 31 || ud === 4) {
    avoidToday.push({ title: "Worst day to over-market", detail: "People are skeptical and want to be left alone — don't spam links today." });
  }
  if (dow === 6) {
    avoidToday.push({ title: "Saturday (Saturn's Day)", detail: "Strictly for discipline and rest — never for partying or heavy drinking." });
  }
  if (dow === 0) {
    doToday.push({ title: "Sunday — Hiding Within Time", detail: "A 'waiting room' day where you can relax and do nothing without taking an energetic penalty." });
  }

  const upcomingDefs: Array<{ action: string; match: (y: number, m: number, d: number, ud: number) => boolean }> = [
    { action: "28th Wealth Day — haircut, spring water, open shoes/watch, domains", match: (_y, _m, day) => day === 28 },
    { action: "22nd Builder Day — deposit money into bank/wallet", match: (_y, _m, day) => day === 22 },
    { action: "3-Day Marketing Window — best day to market & sell", match: (_y, _m, day, u) => day === 3 || day === 12 || day === 21 || day === 30 || u === 3 },
    { action: "9-Day Letting-Go Ritual — release & finish open work", match: (_y, _m, day, u) => day === 9 || day === 18 || day === 27 || u === 9 },
    { action: "7-Day Danger Day — avoid haircuts, shaving, nails & tattoos", match: (_y, _m, day, u) => day === 7 || day === 16 || day === 25 || u === 7 },
  ];

  const upcoming: UpcomingSecretDate[] = [];
  for (const def of upcomingDefs) {
    const hit = nextMatchingDate(y, m, d, def.match);
    if (hit) upcoming.push({ iso: hit.iso, label: hit.label, action: def.action });
  }

  return { iso: isoOf(y, m, d), universalDay: ud, doToday, avoidToday, upcoming, alwaysOn: ALWAYS_ON_SECRETS };
}