// ─── Chakra Analysis & Color Therapy for Cristian Zavala ─────────────────────
// Core numbers: LP=1, Expression=3, Soul Urge=4, Personality=8, Birthday=8, PY=9
// Missing from name: 6, 7 (karmic lessons → weak chakras)

export interface ChakraProfile {
  name: string;
  number: number;
  color: string;
  colorHex: string;
  sanskrit: string;
  location: string;
  element: string;
  note: string; // musical note
  crystals: string[];
  affirmations: string[];
  rifeHz: number;
  status: "Overactive" | "Underactive" | "Blocked" | "Balanced" | "Dominant";
  userRelevance: string;
  activationPractice: string;
  blockSymptoms: string[];
}

export const CHAKRAS: ChakraProfile[] = [
  {
    name: "Root Chakra", number: 1, color: "Red", colorHex: "#e11d48",
    sanskrit: "Muladhara", location: "Base of spine", element: "Earth", note: "C",
    crystals: ["Red Jasper", "Black Tourmaline", "Hematite", "Garnet"],
    affirmations: ["I am safe and grounded", "I have everything I need", "I belong here"],
    rifeHz: 396,
    status: "Dominant",
    userRelevance: "LP 1 (Sun/Fire) rules Root chakra. Your dominant number energizes safety, survival, and leadership. LP 1 is a natural Root activator — you are fundamentally grounded in your identity as a pioneer.",
    activationPractice: "Walk barefoot on grass before games. Hold red jasper during warm-up visualization. Eat red foods (beets, tomatoes, cherries) on match days.",
    blockSymptoms: ["Financial anxiety", "Fear of failure", "Physical fatigue", "Disconnection from body"],
  },
  {
    name: "Sacral Chakra", number: 2, color: "Orange", colorHex: "#ea580c",
    sanskrit: "Svadhisthana", location: "Lower abdomen", element: "Water", note: "D",
    crystals: ["Carnelian", "Orange Calcite", "Sunstone"],
    affirmations: ["I create freely", "My creativity flows", "I feel deeply"],
    rifeHz: 417,
    status: "Balanced",
    userRelevance: "Expression 3 (creative energy) supports Sacral balance. Jupiter rules Expression 3 and Jupiter governs abundance and creativity — your creative expression on the field (dribbling, vision, flair plays) flows from a healthy Sacral chakra.",
    activationPractice: "Hip-opening stretches and yoga. Orange-colored fruit (oranges, mangos) in pre-match meals. Paint, draw, or listen to music to keep creative channels open.",
    blockSymptoms: ["Creative blocks", "Emotional suppression", "Rigidity in play", "Lack of enjoyment"],
  },
  {
    name: "Solar Plexus", number: 3, color: "Yellow", colorHex: "#ca8a04",
    sanskrit: "Manipura", location: "Upper abdomen", element: "Fire", note: "E",
    crystals: ["Citrine", "Tiger's Eye", "Pyrite", "Yellow Jasper"],
    affirmations: ["I am powerful", "I trust myself", "I take action with confidence"],
    rifeHz: 528,
    status: "Dominant",
    userRelevance: "Expression 3 + Personality 8 both channel through Solar Plexus. Your competitive drive, self-confidence, and willpower — this chakra is a power center for you. 8 (Saturn) demands Solar Plexus mastery: discipline, willpower, authority.",
    activationPractice: "Core exercises every morning. Yellow crystals (citrine, pyrite) in training bag. Core breath work before matches — box breathing 4-4-4-4. Eat yellow foods (banana, pineapple, lemon).",
    blockSymptoms: ["Self-doubt under pressure", "Control issues", "Stomach tension before games", "Fear of criticism"],
  },
  {
    name: "Heart Chakra", number: 4, color: "Green", colorHex: "#16a34a",
    sanskrit: "Anahata", location: "Center of chest", element: "Air", note: "F",
    crystals: ["Rose Quartz", "Green Aventurine", "Malachite", "Emerald"],
    affirmations: ["I love and accept myself", "I give and receive freely", "I am connected to my team"],
    rifeHz: 639,
    status: "Balanced",
    userRelevance: "Soul Urge 4 (Uranus energy) channels through Heart chakra. Your deepest desire (Soul Urge 4) is for stability, structure, and reliable love — Heart chakra is where this manifest. Compatibility and team chemistry flow from Heart chakra health.",
    activationPractice: "Team gratitude practice: after every game, name 3 things you appreciate about a teammate. Green aventurine in left pocket. Hug your family regularly — Heart chakra heals through physical connection.",
    blockSymptoms: ["Feeling disconnected from teammates", "Difficulty celebrating others' wins", "Emotional isolation after losses"],
  },
  {
    name: "Throat Chakra", number: 5, color: "Blue", colorHex: "#2563eb",
    sanskrit: "Vishuddha", location: "Throat", element: "Ether/Sound", note: "G",
    crystals: ["Blue Lace Agate", "Aquamarine", "Sodalite", "Lapis Lazuli"],
    affirmations: ["I speak my truth", "I communicate clearly", "My voice matters"],
    rifeHz: 741,
    status: "Balanced",
    userRelevance: "Mercury rules communication and the Throat chakra. Your Virgo Sun (Mercury-ruled) means Throat chakra quality directly impacts your on-field communication, calling for the ball, directing teammates, and self-expression as an athlete.",
    activationPractice: "Vocal warm-ups before games. Singing or humming during warm-up walk. Speak up during training — leadership voice. Blue lace agate bracelet on match days.",
    blockSymptoms: ["Hesitation calling for the ball", "Poor communication under pressure", "Holding back tactical feedback"],
  },
  {
    name: "Third Eye", number: 6, color: "Indigo", colorHex: "#4f46e5",
    sanskrit: "Ajna", location: "Between eyebrows", element: "Light", note: "A",
    crystals: ["Amethyst", "Lapis Lazuli", "Labradorite", "Fluorite"],
    affirmations: ["I see clearly", "I trust my intuition", "I am connected to higher wisdom"],
    rifeHz: 852,
    status: "Blocked",
    userRelevance: "KARMIC LESSON 6 — The number 6 is MISSING from your name 'CRISTIAN ZAVALA'. This means Third Eye chakra is a karmic growth area. Intuition, pattern recognition, and strategic vision in soccer (reading plays before they happen) are areas requiring conscious development. This is your primary spiritual development zone.",
    activationPractice: "Daily 5-minute meditation focusing on breathing and 'seeing' plays unfold in your mind. Game visualization every morning — see the entire match in mental theater. Amethyst on bedside table. Indigo color in your room. Avoid screens 1 hour before sleep.",
    blockSymptoms: ["Over-thinking plays instead of flowing", "Difficulty reading opponents", "Confusion in high-pressure moments", "Difficulty trusting gut instinct"],
  },
  {
    name: "Crown Chakra", number: 7, color: "Violet/White", colorHex: "#7c3aed",
    sanskrit: "Sahasrara", location: "Top of head", element: "Thought/Cosmic", note: "B",
    crystals: ["Clear Quartz", "Selenite", "Amethyst", "Diamond"],
    affirmations: ["I am connected to the divine", "I am guided and protected", "I am part of something greater"],
    rifeHz: 963,
    status: "Underactive",
    userRelevance: "KARMIC LESSON 7 — The number 7 is MISSING from your name. Crown chakra connection to higher intelligence, spiritual guidance, and 'the Matrix' coding is an area for growth. When athletes describe being 'in the zone' or 'playing out of their mind' — that is Crown chakra activation. GG33 teaches that 7 (Neptune/Ketu) connects you to the Matrix frequency.",
    activationPractice: "Sit in silence for 5 minutes every morning — no phone, no music. Look at the night sky weekly. Learn the GG33 matrix codes. Clear quartz crystal cluster in your room. Practice 'letting go' during play — trust the training, let the Crown guide.",
    blockSymptoms: ["Feeling disconnected from purpose", "Playing mechanically without flow", "Spiritual emptiness", "Overthinking instead of trusting"],
  },
  {
    name: "Soul Star (8th)", number: 8, color: "Gold/White", colorHex: "#92400e",
    sanskrit: "Vyapini", location: "Above crown", element: "Light-beyond-form", note: "High B",
    crystals: ["Selenite", "Meteorite", "Clear Quartz", "Gold Sheen Obsidian"],
    affirmations: ["I am more than this physical body", "My soul has a purpose", "I am part of the cosmic code"],
    rifeHz: 1111,
    status: "Dominant",
    userRelevance: "Birthday 8 AND Personality 8 activate the 8th chakra — the Soul Star above the physical body. This is where Saturn energy lives: karma, discipline, past-life authority, and destined wealth. Your 28/10/1 compound activates the 8th chakra's wealth-manifestation codes. You carry Saturn's authority in your energetic blueprint.",
    activationPractice: "Honor Saturn rituals: discipline, structure, showing up even when you don't feel like it. Gold-colored objects in your space. Selenite tower on desk. Saturn mantras: 'Om Sham Shanaishcharaya Namaha' (108 times on Saturdays).",
    blockSymptoms: ["Avoiding responsibility", "Disrespecting authority structures", "Karmic debt accumulation through shortcuts"],
  },
];

// Color Therapy by purpose
export interface ColorTherapy {
  purpose: string;
  colors: { name: string; hex: string; why: string }[];
}

export const COLOR_THERAPY: ColorTherapy[] = [
  {
    purpose: "Daily Activation (GG33 LP1 + Birthday 8)",
    colors: [
      { name: "Gold", hex: "#b45309", why: "LP 1/10 = Gold (GG33). Activates wealth portal and solar energy." },
      { name: "Red", hex: "#dc2626", why: "LP 1 = Red (GG33). Sun energy. Courage, initiative, power." },
      { name: "Black", hex: "#1a1a1a", why: "Birthday/Personality 8 = Black/Gold (GG33). Saturn. Authority." },
      { name: "Yellow", hex: "#ca8a04", why: "Solar plexus activation. Personal Year 9 completion energy." },
    ],
  },
  {
    purpose: "Healing Karmic Lessons 6 & 7 (Blocked Chakras)",
    colors: [
      { name: "Indigo", hex: "#4338ca", why: "Third Eye (6) activation — open intuition and pattern recognition." },
      { name: "Violet/Purple", hex: "#7c3aed", why: "Crown (7) activation — connect to Matrix frequency." },
      { name: "White", hex: "#f1f5f9", why: "Crown purification. Selenite white light for clearing karmic blocks." },
    ],
  },
  {
    purpose: "Match Day Power Combination",
    colors: [
      { name: "Black", hex: "#111827", why: "Activate Saturn/8 authority energy. Psychological dominance." },
      { name: "Gold/Yellow", hex: "#b45309", why: "LP1 wealth + Solar Plexus confidence." },
      { name: "Red", hex: "#dc2626", why: "Root chakra activation = groundedness under pressure." },
    ],
  },
  {
    purpose: "Recovery & Rest (Post-Match)",
    colors: [
      { name: "Blue", hex: "#1d4ed8", why: "Throat chakra and nervous system calming." },
      { name: "Green", hex: "#15803d", why: "Heart chakra healing. Regeneration and team connection." },
      { name: "Purple", hex: "#6d28d9", why: "Crown chakra spiritual recovery. Sleep and dream processing." },
    ],
  },
  {
    purpose: "Personal Year 9 (2026) Completion Energy",
    colors: [
      { name: "Gold", hex: "#b45309", why: "9 completion + LP 1/10 gold = harvest of 9-year cycle." },
      { name: "Maroon/Deep Red", hex: "#7f1d1d", why: "Mars/9 energy for completion rites. Releasing the old." },
      { name: "White", hex: "#f1f5f9", why: "Purification. Clearing for 2027 Personal Year 1 new cycle." },
    ],
  },
];

// Rife frequencies tied to chakras
export const RIFE_CHAKRA: Record<string, number> = {
  Root:        396,
  Sacral:      417,
  SolarPlexus: 528,
  Heart:       639,
  Throat:      741,
  ThirdEye:    852,
  Crown:       963,
  SoulStar:    1111,
};

// Daily chakra color wearables by day of week
export const DAILY_COLOR_WEAR: Record<string, { color: string; hex: string; chakra: string; why: string }> = {
  Sunday:    { color: "Gold/Yellow",  hex: "#b45309", chakra: "Solar Plexus",  why: "Sun day — LP 1/Sun energy. Gold activates your wealth portal." },
  Monday:    { color: "White/Silver", hex: "#e2e8f0", chakra: "Crown",          why: "Moon day — Water element. Crown purification and intuition." },
  Tuesday:   { color: "Red",          hex: "#dc2626", chakra: "Root",           why: "Mars day — Root activation. Courage, physical power, competition." },
  Wednesday: { color: "Indigo/Blue",  hex: "#4338ca", chakra: "Third Eye",      why: "Mercury day — Third Eye. Open karmic lesson 6, enhance game vision." },
  Thursday:  { color: "Purple",       hex: "#6d28d9", chakra: "Crown",          why: "Jupiter day — Crown and Expression 3 activation. Expand vision." },
  Friday:    { color: "Green/Pink",   hex: "#15803d", chakra: "Heart",          why: "Venus day — Heart chakra. Team connection and creativity." },
  Saturday:  { color: "Black/Gold",   hex: "#111827", chakra: "Soul Star",      why: "Saturn day — Personality/Birthday 8 activation. Authority and discipline." },
};
