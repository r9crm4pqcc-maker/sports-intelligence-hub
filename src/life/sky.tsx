import { Card, Page } from "./kit";
import { RelatedReading } from "./related-reading";
import { SkyNow } from "./sky-now";

const WEST = [
  { planet: "Sun", sign: "Virgo", deg: "16°08′", house: "House 11", role: "Purpose and identity", body: "Virgo notices the small thing and wants to fix it. That eye is a strength until a small flaw starts to feel huge." },
  { planet: "Moon", sign: "Taurus", deg: "3°30′", house: "House 6", role: "Emotional needs", body: "Comfort, food, a calm room, and knowing where things stand change the mood. A shaky day hits this Moon hard." },
  { planet: "Mercury", sign: "Libra", deg: "5°57′", house: "House 11", role: "Mind", note: "Retrograde", body: "You think by setting one option next to the other. The stall is weighing it past the moment you needed to choose." },
  { planet: "Venus", sign: "Leo", deg: "15°26′", house: "House 10", role: "Relationships", body: "This wants a relationship that stays alive. Attention and a real plan beat doing the same night over and over." },
  { planet: "Mars", sign: "Cancer", deg: "8°34′", house: "House 8", role: "Drive", body: "You skip a fight that is only about you. Threaten someone close and the other side comes out. Anger can sit quiet, then break." },
  { planet: "Jupiter", sign: "Aquarius", deg: "18°57′", house: "House 4", role: "Growth", note: "Retrograde", body: "The opening is the unusual path: tools, research, a route other people are not on." },
  { planet: "Saturn", sign: "Virgo", deg: "23°36′", house: "House 11", role: "Night work", body: "After dark the list of what needs fixing gets loud. Useful, and easy to get sharp about small messes." },
  { planet: "Uranus", sign: "Pisces", deg: "24°51′", house: "House 5", role: "Awakening", note: "Retrograde", body: "The hit often arrives whole, from an image or a feeling, not from a spreadsheet." },
  { planet: "Neptune", sign: "Aquarius", deg: "24°21′", house: "House 4", role: "Imagination", note: "Retrograde", body: "The picture is a future way of living. You can see it before the room is ready." },
  { planet: "Pluto", sign: "Capricorn", deg: "0°30′", house: "House 2", role: "Power", note: "Retrograde", body: "This generation watches who holds the structure, and whether that structure should stay." },
];

const BLOCKS = [
  { title: "Colors", lines: [
    "Favorable: white, cream, pale green, silver. The Moon is exalted in Taurus, and Venus has the 10th.",
    "Partial: pink, gold. Gold is only partial. The Sun is in Virgo, not its own sign.",
    "Avoid as a main color: red. Mars is in fall in Cancer.",
    "Competition: white or silver. Not red.",
    "Daily: white or cream.",
    "Rest: cream or pale green.",
  ] },
  { title: "Numbers", lines: [
    "Favorable: 2 for the exalted Moon, 6 for Venus in the 10th.",
    "Partial: 1 for the Sun in the 11th, 8 for Saturn, 3 for retrograde Jupiter.",
    "Avoid pushing: 9 for Mars in fall, 5 for retrograde Mercury.",
    "Best jersey: 2 or 6, then 1.",
    "Money: 6, then 2. This is not the Vedic 28.",
  ] },
  { title: "Days", lines: [
    "Favorable: Monday, Friday.",
    "Partial: Sunday, Saturday, Thursday.",
    "Avoid for starts: Tuesday and Wednesday. Tuesday belongs to a fallen Mars. Wednesday belongs to a retrograde Mercury.",
    "Best for training: Monday. The exalted Moon sits in the 6th, the house of the daily body.",
  ] },
  { title: "Months", lines: [
    "Favorable: mid-April to mid-May, Taurus, where the Moon is exalted. Late July to late August, Leo, where Venus holds the 10th.",
    "Avoid: mid-June to mid-July, Cancer, which wakes the fallen Mars. Mid-December to mid-January, Capricorn, which is Jupiter's tropical fall and the sign Pluto already occupies.",
  ] },
  { title: "Directions", lines: [
    "Favorable: north for the Moon, east for Venus in the 10th.",
    "Partial: west for Saturn. Saturn is not in fall.",
    "Avoid: south. That is Mars, and Mars is in fall.",
    "Sleep with your head toward the north. Do not sleep toward the south.",
    "Work facing east.",
  ] },
  { title: "Metals", lines: [
    "Favorable: silver.",
    "Partial: copper, and gold only as a second metal.",
    "Avoid: iron.",
  ] },
];

export default function SkyPage() {
  return (
    <Page kicker="Western" title="Tropical chart" lede="September 8, 2009. This page is the Western chart only. The lists below come from these placements. They are not the Vedic reading and not the numerology colors.">
      <Card>
        <ul className="space-y-3 text-sm">
          {WEST.map((p) => (
            <li key={p.planet}>
              <p className="text-foreground font-medium">{p.planet} in {p.sign} · {p.deg} · {p.house}{p.note ? ` · ${p.note}` : ""}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{p.role}</p>
              <p className="text-muted-foreground">{p.body}</p>
            </li>
          ))}
        </ul>
      </Card>
      {BLOCKS.map((b) => (
        <Card key={b.title}>
          <h2 className="font-display text-lg">{b.title}</h2>
          <ul className="mt-2 space-y-1 text-sm text-foreground">{b.lines.map((l) => <li key={l}>{l}</li>)}</ul>
        </Card>
      ))}
      <Card>
        <h2 className="font-display text-lg">Body</h2>
        <p className="text-sm text-muted-foreground mt-2">Taken from the planets in this chart. Not a diagnosis. Not the Virgo sun-sign note.</p>
        <ul className="mt-2 space-y-2 text-sm">
          <li>The Moon is exalted in Taurus in the 6th. That is the strongest body in the chart. Taurus is the throat and neck. The Moon is the stomach and the fluids. The 6th is the daily body, so the strength holds when the day has a rhythm.</li>
          <li>Mars is in fall in Cancer in the 8th. That is the weak point. Cancer is the chest and the stomach. Mars is muscle, blood, and heat. The 8th is a cut, a crisis, or a strain you cannot see. Do not treat red or iron as a fix.</li>
          <li>Mercury is retrograde in Libra in the 11th. Libra is the kidneys and the lower back. Mercury is the nerves and the skin. Retrograde means they run slow. It does not mean they are broken.</li>
          <li>The Sun is in Virgo in the 11th. The Sun's body is the heart and the spine. The sign adds the intestines, and the 11th adds circulation. The Sun is not in its own sign, so this is not the lead system.</li>
          <li>Venus is in Leo in the 10th, and the 10th is an angular house, so this one works. Venus is the throat, the kidneys, and the reproductive system. Leo puts the heart in the picture, and the planet sitting there is not weak.</li>
          <li>Jupiter is retrograde in Aquarius in the 4th. Jupiter is the liver, the hips, and fat. Aquarius is the calves and circulation. It is retrograde, not in fall. The fall of Jupiter is Capricorn, and Jupiter is not there.</li>
          <li>Saturn is in Virgo in the 11th. Saturn is bone, teeth, knees, and skin. It is not in fall and not in detriment, so the bones are a structure, not the broken part. Virgo on Saturn is a second pass at the intestines, from Saturn, not from the sun sign.</li>
        </ul>
      </Card>
      <SkyNow primary="tropical" />
      <RelatedReading page="western" />
    </Page>
  );
}
