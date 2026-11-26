import type { VoteInput } from "./vote-decode";
export type WinnerCorrection = { id: string; league: string; winner: "home" | "away"; input: VoteInput; correctedAt: string; settled: boolean };
export type SportsFeedback = { corrections: WinnerCorrection[]; leagues: Record<string, Record<string, number>>; report: string; pending?: string[] };
export const EMPTY_FEEDBACK: SportsFeedback = { corrections: [], leagues: {}, report: "" };
export function replaceCorrection(rows: WinnerCorrection[], row: WinnerCorrection): WinnerCorrection[] { return [...rows.filter(r => r.id !== row.id), row]; }
export function acceptImprovedFit(before: boolean[], after: boolean[]): boolean { return before.length === after.length && after.filter(Boolean).length > before.filter(Boolean).length && before.every((hit, i) => !hit || after[i]); }