import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { supabase } from "@/integrations/supabase/client";
import { useLife } from "./context";
import { ProfileForm } from "./chart";
import { Page, CardTitle } from "./kit";
export default function SettingsPage() {
  const { profile, setProfile, ready } = useLife();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string | null>(null), [notice, setNotice] = useState("");
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? (data.session ? "Signed in" : null)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user.email ?? (session ? "Signed in" : null)));
    return () => data.subscription.unsubscribe();
  }, []);
  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
  };
  return <Page kicker="Preferences" title="Settings">
    <section><CardTitle>Edit birth data</CardTitle><ProfileForm key={ready ? "loaded" : "boot"} profile={profile} onSave={setProfile} /></section>
    <section className="border-t border-border pt-5 space-y-3"><CardTitle>Sports research account</CardTitle>{email ? <div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><span className="h-2 w-2 rounded-full bg-primary" />{email}</span><Button variant="outline" size="sm" onClick={() => void handleSignOut()}>Sign out</Button></div> : <Button variant="outline" onClick={async () => { const result = await lovable.auth.signInWithOAuth("lovable", { redirect_uri: window.location.origin }); if (result.error) setNotice(result.error.message); }}><LovableMark />Continue with Lovable</Button>}{notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}</section>
  </Page>;
}
