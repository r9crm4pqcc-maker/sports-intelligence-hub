import { reduce } from "@/lib/numerology";

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

export function letterValue(ch: string) {
  const up = ch.toUpperCase();
  const code = up.charCodeAt(0);
  if (code < 65 || code > 90) return null;
  const ordinal = code - 64;
  return { letter: ch, ordinal, reduced: reduce(ordinal), vowel: VOWELS.has(up) };
}

export function readWord(raw: string, caseSensitive: boolean) {
  const text = caseSensitive ? raw : raw.toLowerCase();
  const letters = [...text].map(letterValue).filter((x): x is NonNullable<typeof x> => !!x);
  const reducedSum = letters.reduce((s, l) => s + l.reduced, 0);
  const fullSum = letters.reduce((s, l) => s + l.ordinal, 0);
  const vowels = letters.filter((l) => l.vowel);
  const vowelFull = vowels.reduce((s, l) => s + l.ordinal, 0);
  return {
    letters,
    reducedSum,
    fullSum,
    reducedRoot: letters.length ? reduce(reducedSum) : 0,
    fullRoot: letters.length ? reduce(fullSum) : 0,
    vowelFull,
    vowelRoot: vowels.length ? reduce(vowelFull) : 0,
    first: letters[0] ?? null,
    firstVowel: vowels[0] ?? null,
  };
}
