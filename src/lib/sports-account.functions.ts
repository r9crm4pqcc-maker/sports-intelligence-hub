import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const person = z.object({ id: z.string().max(100), role: z.enum(["quarterback", "coach", "owner", "player"]), name: z.string().max(150), dob: z.string().max(10), jersey: z.string().max(10).optional(), verified: z.boolean().optional() });
const people = z.object({ away: z.array(person).max(100), home: z.array(person).max(100) }).nullable();
const keySchema = z.object({ kind: z.enum(["people", "approvals"]), key: z.string().min(1).max(20000) });
export const readSportsDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(data => keySchema.parse(data)).handler(async ({ data, context }) => {
  if (data.kind === "people") {
    const result = await context.supabase.from("sports_people_edits").select("people").eq("user_id", context.userId).eq("game_key", data.key).maybeSingle();
    if (result.error) throw new Error("Saved people could not be read.");
    const parsed = result.data ? people.parse(result.data.people) : null;
    return parsed && !parsed.away.length && !parsed.home.length ? null : parsed;
  }
  const result = await context.supabase.from("sports_research_approvals").select("approved").eq("user_id", context.userId).eq("research_key", data.key).maybeSingle();
  if (result.error) throw new Error("Saved verification could not be read.");
  return result.data ? z.array(z.string().max(5000)).parse(result.data.approved) : null;
});
export const writeSportsDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(data => keySchema.extend({ value: z.unknown(), userId: z.string().uuid() }).parse(data)).handler(async ({ data, context }) => {
  if (context.userId !== data.userId) throw new Error("Account changed; reload before saving.");
  const updated_at = new Date().toISOString();
  const result = data.kind === "people"
    ? await context.supabase.from("sports_people_edits").upsert({ user_id: context.userId, game_key: data.key, people: people.parse(data.value) ?? { away: [], home: [] }, updated_at })
    : await context.supabase.from("sports_research_approvals").upsert({ user_id: context.userId, research_key: data.key, approved: z.array(z.string().max(5000)).max(100).parse(data.value), updated_at });
  if (result.error) throw new Error("Account save failed. Changes remain on this device; retry to sync.");
  return { saved: true };
});