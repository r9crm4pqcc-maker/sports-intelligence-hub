import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { lovable } from "@/integrations/lovable";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { supabase } from "@/integrations/supabase/client";
import { useLife } from "./context";
import { ProfileForm } from "./chart";
import { Page, Card, CardTitle } from "./kit";
export default function SettingsPage() {
  const { profile, setProfile, ready } = useLife();
  const [enemy, setEnemy] = useState(false), [alerts, setAlerts] = useState(false), [light, setLight] = useState(false);
  const [account, setAccount] = useState(false), [notice, setNotice] = useState("");
  useEffect(() => {
    setEnemy(localStorage.getItem("life-enemy-mode") === "on"); setAlerts(localStorage.getItem("life-alerts") === "on");
    setLight(localStorage.getItem("life-theme") === "light");
    void supabase.auth.getSession().then(({ data }) => setAccount(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setAccount(!!session));
    return () => data.subscription.unsubscribe();
  }, []);
  return <Page kicker="Preferences" title="Settings">
    <section><CardTitle>Edit birth data</CardTitle><ProfileForm key={ready ? "loaded" : "boot"} profile={profile} onSave={setProfile} /></section>
    <section className="space-y-5 border-t border-border pt-5">
      <div className="flex justify-between gap-4"><span>Daily notifications</span><Switch aria-label="Daily notifications" checked={alerts} onCheckedChange={async on => { if (on) { if (typeof Notification === "undefined") { setNotice("Notifications are unavailable in this browser."); return; } if (await Notification.requestPermission() !== "granted") { setNotice("Allow notifications in your browser first."); return; } } setAlerts(on); localStorage.setItem("life-alerts", on ? "on" : "off"); }} /></div>
      <div className="flex justify-between gap-4"><span>Light theme · orange accent</span><Switch aria-label="Light theme" checked={light} onCheckedChange={on => { setLight(on); localStorage.setItem("life-theme", on ? "light" : "dark"); document.documentElement.dataset["theme"] = on ? "light" : "dark"; }} /></div>
      <div className="flex justify-between gap-4"><span>2027 Enemy Year Mode</span><Switch aria-label="2027 Enemy Year Mode" checked={enemy} onCheckedChange={on => { setEnemy(on); localStorage.setItem("life-enemy-mode", on ? "on" : "off"); window.dispatchEvent(new Event("life-settings-changed")); }} /></div>
    </section>
    <section className="border-t border-border pt-5 space-y-3"><CardTitle>Sports research account</CardTitle>{account ? <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button> : <Button variant="outline" onClick={async () => { const result = await lovable.auth.signInWithOAuth("lovable", { redirect_uri: window.location.origin }); if (result.error) setNotice(result.error.message); }}><LovableMark />Continue with Lovable</Button>}{notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}</section>
  </Page>;
}
