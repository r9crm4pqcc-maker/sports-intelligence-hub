import type { RotoWireNhlLineups } from "../rotowire-types";

const ROTOWIRE_NHL_LINEUPS_URL = "https://www.rotowire.com/hockey/nhl-lineups.php";

function decodeHtmlText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_match, decimal: string) =>
      String.fromCodePoint(Number.parseInt(decimal, 10)),
    )
    .replace(/\s+/g, " ")
    .trim();
}

function extractGoalie(card: string, side: "visit" | "home") {
  const lists = card.matchAll(
    /<ul\b[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/ul>/gi,
  );
  for (const list of lists) {
    const classes = list[1].split(/\s+/);
    if (!classes.includes("lineup__list") || !classes.includes(`is-${side}`)) continue;

    const highlight = list[2].match(
      /<li\b[^>]*class="[^"]*lineup__player-highlight[^"]*"[^>]*>([\s\S]*?)<\/li>/i,
    )?.[1];
    if (!highlight) return null;

    const rawName = highlight.match(
      /<div\b[^>]*class="[^"]*lineup__player-highlight-name[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    )?.[1];
    const name = rawName ? decodeHtmlText(rawName) : "";
    if (!name) return null;

    const status = /is-confirmed/i.test(highlight)
      ? "confirmed"
      : /is-expected/i.test(highlight)
        ? "expected"
        : null;
    return status ? { name, status } : null;
  }
  return null;
}

function parseGameTime(card: string): string | null {
  const rawTime = card.match(
    /<div\b[^>]*class="[^"]*lineup__time[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  )?.[1];
  return rawTime ? decodeHtmlText(rawTime) || null : null;
}

export function parseRotoWireNhlLineups(
  html: string,
  dateMode: "today" | "tomorrow",
  retrievedAt: string,
): RotoWireNhlLineups {
  const dateLabelRaw = html.match(
    /Starting NHL lineups for\s*([^<]+)/i,
  )?.[1];
  const dateLabel = dateLabelRaw ? decodeHtmlText(dateLabelRaw) : "";
  if (!dateLabel) throw new Error("RotoWire page did not include its lineup date.");

  const starts = [...html.matchAll(
    /<div\b[^>]*class="[^"]*\blineup\b[^"]*\bis-nhl\b[^"]*"[^>]*>/gi,
  )].map((match) => match.index);
  const games = starts.flatMap((start, index) => {
    if (start == null) return [];
    const end = starts[index + 1] ?? html.length;
    const card = html.slice(start, end);
    const abbreviations = [...card.matchAll(
      /<div\b[^>]*class="[^"]*lineup__abbr[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    )].map((match) => decodeHtmlText(match[1]).toUpperCase());
    if (abbreviations.length < 2 || !abbreviations[0] || !abbreviations[1]) return [];

    return [{
      awayAbbr: abbreviations[0],
      homeAbbr: abbreviations[1],
      gameTimeEt: parseGameTime(card),
      awayGoalie: extractGoalie(card, "visit"),
      homeGoalie: extractGoalie(card, "home"),
    }];
  });

  const sourceUrl = new URL(ROTOWIRE_NHL_LINEUPS_URL);
  if (dateMode === "tomorrow") sourceUrl.searchParams.set("date", dateMode);
  return ({
    dateMode,
    dateLabel,
    retrievedAt,
    sourceUrl: sourceUrl.toString(),
    games: games as RotoWireNhlLineups["games"],
  });
}
