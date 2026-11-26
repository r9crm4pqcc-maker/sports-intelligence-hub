import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { supabase } from "@/integrations/supabase/client";
import { useLife } from "./context";
import { ProfileForm } from "./chart";
import { Page, CardTitle } from "./kit";
export default function SettingsPage() {
  const { profile, setProfile, ready } = useLife();
  const [account, setAccount] = useState(false), [notice, setNotice] = useState("");
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setAccount(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setAccount(!!session));
    return () => data.subscription.unsubscribe();
  }, []);
  return <Page kicker="Preferences" title="Settings">
    <section><CardTitle>Edit birth data</CardTitle><ProfileForm key={ready ? "loaded" : "boot"} profile={profile} onSave={setProfile} /></section>
    <section className="border-t border-border pt-5 space-y-3"><CardTitle>Sports research account</CardTitle>{account ? <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button> : <Button variant="outline" onClick={async () => { const result = await lovable.auth.signInWithOAuth("lovable", { redirect_uri: window.location.origin }); if (result.error) setNotice(result.error.message); }}><LovableMark />Continue with Lovable</Button>}{notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}</section>
  </Page>;
}
