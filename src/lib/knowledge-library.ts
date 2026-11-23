// Typed access to the Knowledge Library built from the user's uploaded
// "Two Ways of Seeing — Tropical vs Sidereal" document (articles + guides).
import data from "./knowledge-library.json";

export interface LibrarySection { heading: string; evidence: string; paragraphs: string[] }
export interface LibraryArticle {
  id: string; title: string; subtitle: string; question: string; shortAnswer: string;
  figure: string[]; sections: LibrarySection[]; group: string;
}
export type GuideBlock =
  | { t: "h" | "h3" | "k" | "p" | "li"; x: string }
  | { t: "row" | "chips"; c: string[] }
  | { t: "calc" };
export interface LibraryGuide { id: string; title: string; blocks: GuideBlock[] }

export const PERSPECTIVE_LABEL = "Life Code perspective";
export const ARTICLES = data.articles as LibraryArticle[];
export const GUIDES = (data.guides as LibraryGuide[]).map((g) => ({
  ...g,
  // Drop chat notes that were addressed to the builder, not the reader.
  blocks: g.blocks.filter((b) => !("x" in b) || !/save rn ill tell u/i.test(b.x)),
}));
export const GROUPS = [...new Set(ARTICLES.map((a) => a.group))];

export type LibraryEntry = { kind: "article"; item: LibraryArticle } | { kind: "guide"; item: LibraryGuide };
export function getLibraryEntry(id: string): LibraryEntry | null {
  const a = ARTICLES.find((x) => x.id === id);
  if (a) return { kind: "article", item: a };
  const g = GUIDES.find((x) => x.id === id);
  return g ? { kind: "guide", item: g } : null;
}
export function entryTitle(id: string): string {
  const e = getLibraryEntry(id);
  return e ? e.item.title : id;
}

const text = (a: LibraryArticle) => [a.title, a.subtitle, a.question, a.shortAnswer, ...a.sections.flatMap((s) => s.paragraphs)].join(" ").toLowerCase();
const guideText = (g: LibraryGuide) => [g.title, ...g.blocks.map((b) => ("x" in b ? b.x : "c" in b ? b.c.join(" ") : ""))].join(" ").toLowerCase();
export function searchLibrary(query: string, group: string | null) {
  const q = query.trim().toLowerCase();
  const articles = ARTICLES.filter((a) => (!group || a.group === group) && (!q || text(a).includes(q)));
  const guides = group ? [] : GUIDES.filter((g) => !q || guideText(g).includes(q));
  return { articles, guides };
}

/** Which library entries each app page links to. */
export const RELATED: Record<string, string[]> = {
  western: ["tropical-vs-sidereal-astrology", "why-the-zodiac-slowly-moves", "why-there-are-twelve-zodiac-signs", "babylon-and-the-birth-of-astrology", "why-a-circle-has-360-degrees"],
  vedic: ["tropical-vs-sidereal-astrology", "what-is-a-nakshatra", "why-the-zodiac-slowly-moves", "does-the-moon-really-affect-us"],
  chart: ["what-is-numerology", "what-is-a-master-number", "what-is-your-lucky-number", "how-chinese-astrology-works", "where-numerology-came-from"],
  calendar: ["what-is-a-personal-year", "how-humans-invented-the-calendar", "why-we-have-seven-days-in-a-week", "how-compatibility-works"],
  timing: ["your-body-runs-on-more-than-one-clock", "why-time-feels-faster-or-slower", "what-is-a-personal-year", "what-is-a-master-number"],
  letterology: ["pythagorean-vs-chaldean-numerology", "where-numerology-came-from", "why-humans-assign-meaning-to-numbers"],
  people: ["how-compatibility-works", "what-are-friendly-signs", "what-are-enemy-signs", "how-chinese-astrology-works"],
  sports: ["sports-ai-notes-rules", "what-is-confirmation-bias", "why-8-is-considered-lucky", "what-are-enemy-signs", "how-compatibility-works"],
};
