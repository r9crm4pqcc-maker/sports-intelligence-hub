import { Suspense, useEffect, useState } from "react";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UsDateInput } from "./us-date-input";
import { displayDate } from "@/lib/display-date";
import { Trash2, Plus } from "lucide-react";
const gearQuery = (userId: string) => queryOptions({ queryKey: ["soccer-gear", userId], queryFn: async () => { const { data, error } = await supabase.from("soccer_gear").select("id,name,activation_date,active").eq("user_id", userId).order("activation_date"); if (error) throw error; return data; } });
function GearRows({ userId }: { userId: string }) {
  const client = useQueryClient();
  const { data } = useSuspenseQuery(gearQuery(userId));
  const [name, setName] = useState(""), [date, setDate] = useState(""), [notice, setNotice] = useState("");
  const refresh = () => client.invalidateQueries({ queryKey: ["soccer-gear", userId] });
  return <div className="space-y-4"><form className="flex flex-wrap gap-2" onSubmit={async e => { e.preventDefault(); if (!name.trim() || !date) return; const { error } = await supabase.from("soccer_gear").insert({ user_id: userId, name: name.trim(), activation_date: date }); if (error) { setNotice("Gear could not be saved."); return; } setName(""); setNotice("Gear saved."); await refresh(); }}><input aria-label="Gear name" placeholder="Cleats or gear" value={name} onChange={e => setName(e.target.value)} className="border border-border rounded-md bg-background px-3 py-2 text-sm" /><UsDateInput label="Activation date, MM/DD/YYYY" value={date} onChange={setDate} className="border border-border rounded-md bg-background px-3 py-2 text-sm" /><Button disabled={!name.trim() || !date} type="submit"><Plus />Add gear</Button></form>
  {data.map(row => <div key={row.id} className="flex items-center gap-3 border-t border-border pt-3"><span className="flex-1 min-w-0"><span className="block break-words">{row.name}</span><span className="text-xs text-muted-foreground">{displayDate(row.activation_date)}</span></span><Switch aria-label={`Activate ${row.name}`} checked={row.active} onCheckedChange={async active => { const { error } = await supabase.from("soccer_gear").update({ active }).eq("id", row.id).eq("user_id", userId); if (error) setNotice("Activation could not be saved."); else await refresh(); }} /><Button variant="ghost" size="icon" aria-label={`Delete ${row.name}`} onClick={async () => { const { error } = await supabase.from("soccer_gear").delete().eq("id", row.id).eq("user_id", userId); if (error) setNotice("Gear could not be removed."); else await refresh(); }}><Trash2 /></Button></div>)}{notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}{!data.length && <p className="text-sm text-muted-foreground">No gear tracked yet.</p>}</div>;
}
export function SoccerGearTracker() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => { void supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null)); const { data } = supabase.auth.onAuthStateChange((_event, session) => setUserId(session?.user.id ?? null)); return () => data.subscription.unsubscribe(); }, []);
  return userId ? <Suspense fallback={<p>Loading saved gear…</p>}><GearRows userId={userId} /></Suspense> : <p className="text-sm text-muted-foreground">Sign in in Settings to save your gear tracker.</p>;
}
