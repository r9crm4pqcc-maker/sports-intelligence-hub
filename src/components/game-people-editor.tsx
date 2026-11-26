import { UsDateInput } from "./us-date-input";
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { calcDateEnergy } from "@/lib/numerology";
import {
  parseDobString,
  type EditableRole,
  type GamePeopleOverride,
  type OverridePerson,
} from "@/lib/sports-people-overrides";

const ROLE_LABEL: Record<EditableRole, string> = {
  quarterback: "QB / Starter",
  coach: "Head Coach",
  owner: "Owner",
  player: "Star Player",
};

function AutoDecodeBadge({ dob }: { dob: string }) {
  const tuple = parseDobString(dob);
  if (!tuple) return null;
  const [y, m, d] = tuple;
  const energy = calcDateEnergy(m, d, y);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/35 px-2 py-0.5 text-[10px] font-bold text-primary">
      LP {energy.compound}/{energy.reduced}
    </span>
  );
}

function TeamSideEditor({
  teamName,
  people,
  onChange,
}: {
  teamName: string;
  people: OverridePerson[];
  onChange: (next: OverridePerson[]) => void;
}) {
  const update = (id: string, patch: Partial<OverridePerson>) => {
    onChange(people.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const addPlayer = () => {
    onChange([
      ...people,
      { id: `player-${Date.now()}`, role: "player", name: "", dob: "", jersey: "" },
    ]);
  };
  const remove = (id: string) => {
    onChange(people.filter((p) => p.id !== id));
  };

  return (
    <div className="rounded-xl bg-muted/40 border border-border p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{teamName}</p>
        <Button
          type="button"
          onClick={addPlayer}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary"
        >
          <Plus size={11} /> Add Player
        </Button>
      </div>
      <div className="space-y-2">
        {people.map((person) => (
          <div key={person.id} className="rounded-lg bg-card/80 border border-border/80 p-2 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {ROLE_LABEL[person.role]}
              </span>
              <div className="flex items-center gap-1.5">
                <AutoDecodeBadge dob={person.dob} />
                {person.role === "player" && (
                  <Button
                    type="button"
                    onClick={() => remove(person.id)}
                    aria-label="Remove player"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={12} />
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-1.5">
              <input
                type="text"
                value={person.name}
                onChange={(e) => update(person.id, { name: e.target.value })}
                placeholder={`${ROLE_LABEL[person.role]} name`}
                aria-label={`${teamName} ${ROLE_LABEL[person.role]} name`}
                className="col-span-2 min-w-0 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
              />
              <UsDateInput
                value={person.dob}
                onChange={(dob) => update(person.id, { dob })}
                className="min-w-0 w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground [color-scheme:dark] focus:border-primary focus:outline-none"
              />
              <input
                type="text"
                inputMode="numeric"
                value={person.jersey ?? ""}
                onChange={(e) => update(person.id, { jersey: e.target.value.replace(/[^0-9]/g, "") })}
                placeholder="#"
                title="Jersey number"
                className="min-w-0 w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-center font-mono text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GamePeopleEditor({
  awayTeam,
  homeTeam,
  value,
  hasCustomOverride,
  onChange,
  onReset,
}: {
  awayTeam: string;
  homeTeam: string;
  value: GamePeopleOverride;
  hasCustomOverride: boolean;
  onChange: (next: GamePeopleOverride) => void;
  onReset: () => void;
}) {
  return (
    <div className="mt-3 rounded-xl border border-primary/35 bg-background/80 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Edit QB, Coaches, Owners &amp; Players</p>
          <p className="text-[10px] text-muted-foreground">Birthdays · MM/DD/YYYY</p>
        </div>
        {hasCustomOverride && (
          <Button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:border-destructive/50 hover:text-destructive"
          >
            <RotateCcw size={11} /> Reset
          </Button>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <TeamSideEditor
          teamName={awayTeam}
          people={value.away}
          onChange={(away) => onChange({ ...value, away })}
        />
        <TeamSideEditor
          teamName={homeTeam}
          people={value.home}
          onChange={(home) => onChange({ ...value, home })}
        />
      </div>
    </div>
  );
}