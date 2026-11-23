// Story Reading feeds the Learned Code pick without replacing it.
// Each sport gets its own push strength, fitted on saved past games: a sport
// where the story reading made picks worse gets 0, so Learned Code alone decides.
// Confidence scales the push: High 3, Medium-High 2, Medium 1.
import type { StorySide } from "./sports-story-reading";

// Fitted Nov. 23 2026 on saved games (history + Nov. 7–20 replay). Every other
// sport is 0 for now: there the story reading lowered saved-game hits.
export const STORY_PICK_WEIGHT: Record<string, number> = {
  "College Basketball": 0.12,
  "College Football": 0.01,
  "UEFA Nations League": 0.6,
};

export const storyPushOn = (league: string) => (STORY_PICK_WEIGHT[league] ?? 0) > 0;

const LEAN = { High: 3, "Medium-High": 2, Medium: 1 } as const;

export interface LearnedTotals { home: number; away: number; pick: StorySide }
export interface StoryLean { selected: StorySide; confidence: keyof typeof LEAN }

/** Learned Code margin plus the sport's Story Reading push. */
export function blendStoryPick(league: string, lc: LearnedTotals, story: StoryLean | null): { pick: StorySide; storyMoved: boolean } {
  const w = STORY_PICK_WEIGHT[league] ?? 0;
  if (!story || w <= 0) return { pick: lc.pick, storyMoved: false };
  const total = Math.abs(lc.home + lc.away) || 1;
  const size = Math.max(0.0001, Math.abs(lc.home - lc.away) / total);
  const margin = (lc.pick === "home" ? 1 : -1) * size;
  const push = (story.selected === "home" ? 1 : -1) * LEAN[story.confidence] * w;
  const pick: StorySide = margin + push > 0 ? "home" : "away";
  return { pick, storyMoved: pick !== lc.pick };
}
