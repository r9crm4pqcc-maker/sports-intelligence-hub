import { reduce } from "./numerology";

// ─── Full 78-card Tarot Deck ─────────────────────────────────────────────────
export interface TarotCard {
  number: number;
  name: string;
  arcana: "Major" | "Minor";
  suit?: string;
  element?: string;
  keywords: string[];
  upright: string;
  reversed: string;
  numerology: string;
  planet?: string;
  zodiac?: string;
  emoji: string;
}

export const MAJOR_ARCANA: TarotCard[] = [
  { number:0,  name:"The Fool",       arcana:"Major", element:"Air",   planet:"Uranus",    zodiac:"Aquarius",    emoji:"🌟", keywords:["Beginnings","Spontaneity","Free spirit","Leap of faith"], upright:"New beginnings, unlimited potential, innocence, a leap into the unknown with faith.", reversed:"Recklessness, naivety, poor judgment, missing the opportunity.", numerology:"0 = Infinite potential. The void before creation. Connected to Life Path 22 (master builder from nothing).", },
  { number:1,  name:"The Magician",   arcana:"Major", element:"Air",   planet:"Mercury",   zodiac:"Gemini",      emoji:"🪄", keywords:["Willpower","Skill","Resourcefulness","Focus"], upright:"Manifestation, skill mastery, concentrated will. You have all the tools — use them.", reversed:"Manipulation, untapped potential, illusion, trickery.", numerology:"1 = Initiative, leadership, new beginnings. Aligns with Life Path 1 — your core number.", },
  { number:2,  name:"The High Priestess", arcana:"Major", element:"Water", planet:"Moon", zodiac:"Cancer",    emoji:"🌙", keywords:["Intuition","Mystery","Inner knowing","Patience"], upright:"Deep intuition, subconscious wisdom, hidden knowledge revealed in stillness.", reversed:"Secrets exposed, information withheld, surface-level thinking.", numerology:"2 = Duality, intuition, receptivity. The gateway between worlds.", },
  { number:3,  name:"The Empress",    arcana:"Major", element:"Earth", planet:"Venus",    zodiac:"Taurus",      emoji:"🌸", keywords:["Abundance","Fertility","Creativity","Nature"], upright:"Creation, abundance, creativity in full bloom. Your expression number — number 3 energy.", reversed:"Dependence, creative block, neglect of self.", numerology:"3 = Creation, expression, joy. Matches your Expression Number 3.", },
  { number:4,  name:"The Emperor",    arcana:"Major", element:"Fire",  planet:"Mars",     zodiac:"Aries",       emoji:"👑", keywords:["Authority","Structure","Leadership","Stability"], upright:"Authority, structure, fatherhood, mastery over chaos through discipline.", reversed:"Domination, rigidity, loss of control.", numerology:"4 = Structure, discipline, foundation. Your Soul Urge 4 — what you truly desire.", },
  { number:5,  name:"The Hierophant", arcana:"Major", element:"Earth", planet:"Venus",    zodiac:"Taurus",      emoji:"📿", keywords:["Tradition","Institutions","Mentorship","Beliefs"], upright:"Tradition, religious/cultural institutions, a teacher or mentor appears.", reversed:"Challenging norms, personal belief, rebellion against institutions.", numerology:"5 = Freedom, change, experience. The bridge between material and spiritual.", },
  { number:6,  name:"The Lovers",     arcana:"Major", element:"Air",   planet:"Mercury",  zodiac:"Gemini",      emoji:"💕", keywords:["Love","Choices","Union","Values"], upright:"Deep love, meaningful choices, alignment of values. A major life decision.", reversed:"Disharmony, imbalance, misaligned values.", numerology:"6 = Love, harmony, responsibility, the nurturer.", },
  { number:7,  name:"The Chariot",    arcana:"Major", element:"Water", planet:"Moon",     zodiac:"Cancer",      emoji:"🏆", keywords:["Victory","Control","Determination","Triumph"], upright:"Victory through willpower and control. You master opposing forces and win. Athletic triumph.", reversed:"Lack of control, aggression without direction, scattered energy.", numerology:"7 = Mastery, spiritual victory, completion of a phase.", },
  { number:8,  name:"Strength",       arcana:"Major", element:"Fire",  planet:"Sun",      zodiac:"Leo",         emoji:"🦁", keywords:["Courage","Patience","Inner power","Compassion"], upright:"Inner strength, courage over brute force, mastering impulses with grace.", reversed:"Self-doubt, raw anger, weakness of will.", numerology:"8 = Power, authority, infinite force. Your Personality Number and Birthday Number.", },
  { number:9,  name:"The Hermit",     arcana:"Major", element:"Earth", planet:"Mercury",  zodiac:"Virgo",       emoji:"🕯️", keywords:["Introspection","Guidance","Wisdom","Solitude"], upright:"Inner wisdom, soul-searching, being a guiding light. Wisdom earned through experience.", reversed:"Isolation, loneliness, withdrawal at wrong time.", numerology:"9 = Completion, wisdom, universal love. Your Personal Year 2026 — a year of The Hermit.", },
  { number:10, name:"Wheel of Fortune", arcana:"Major", element:"Fire",planet:"Jupiter", zodiac:"Sagittarius", emoji:"🎡", keywords:["Fate","Cycles","Luck","Change"], upright:"Fate turns in your favor. A major cycle completes. Destined good fortune.", reversed:"Bad luck, resistance to change, breaking cycles.", numerology:"10 = 1+0 = 1. Your compound Life Path number (28/10/1). The wheel aligns with your wealth portal.", },
  { number:11, name:"Justice",        arcana:"Major", element:"Air",   planet:"Venus",    zodiac:"Libra",       emoji:"⚖️", keywords:["Truth","Fairness","Karma","Law"], upright:"Cause and effect, karmic truth, legal matters resolved fairly.", reversed:"Dishonesty, unfairness, avoiding accountability.", numerology:"11 = Master number. Illumination, spiritual law above human law.", },
  { number:12, name:"The Hanged Man", arcana:"Major", element:"Water", planet:"Neptune",  zodiac:"Pisces",      emoji:"🙃", keywords:["Suspension","Surrender","New perspective","Pause"], upright:"Pause, surrender, gaining perspective by letting go. The liminal space before breakthrough.", reversed:"Stalling, martyrdom, avoidance.", numerology:"12 = 1+2 = 3. Suspended creativity seeking release.", },
  { number:13, name:"Death",          arcana:"Major", element:"Water", planet:"Pluto",    zodiac:"Scorpio",     emoji:"🦋", keywords:["Transformation","Endings","Transition","Release"], upright:"Profound transformation. Not physical death — the death of an old chapter. Major rebirth.", reversed:"Resistance to change, stagnation, inability to let go.", numerology:"13 = Karmic number. Transformation through discipline. Do not fear it.", },
  { number:14, name:"Temperance",     arcana:"Major", element:"Fire",  planet:"Jupiter",  zodiac:"Sagittarius", emoji:"⚗️", keywords:["Balance","Moderation","Patience","Alchemy"], upright:"Divine alchemy, patience, blending opposites into gold. Your path requires balance.", reversed:"Imbalance, excess, lack of patience.", numerology:"14 = Karmic number requiring moderation and flexibility.", },
  { number:15, name:"The Devil",      arcana:"Major", element:"Earth", planet:"Saturn",   zodiac:"Capricorn",   emoji:"⛓️", keywords:["Shadow","Materialism","Bondage","Temptation"], upright:"Shadow work, breaking free from material chains, facing addiction/attachment.", reversed:"Breaking free, reclaiming power, detachment.", numerology:"15 = 1+5 = 6. Love corrupted into possessiveness — or purified.", },
  { number:16, name:"The Tower",      arcana:"Major", element:"Fire",  planet:"Mars",     zodiac:"Aries",       emoji:"⚡", keywords:["Disruption","Revelation","Sudden change","Upheaval"], upright:"Sudden breakthrough — walls crumble revealing truth. The universe intervenes. Necessary chaos.", reversed:"Avoiding disaster, fear of change, resisting inevitable truth.", numerology:"16 = Karmic number of sudden revelation. Truth will not be suppressed.", },
  { number:17, name:"The Star",       arcana:"Major", element:"Air",   planet:"Uranus",   zodiac:"Aquarius",    emoji:"⭐", keywords:["Hope","Healing","Inspiration","Renewal"], upright:"Hope renewed, healing, guiding light after darkness. Your authentic self shines.", reversed:"Despair, loss of faith, disconnection from purpose.", numerology:"17 = 1+7 = 8. Star power expressed as material abundance and legacy.", },
  { number:18, name:"The Moon",       arcana:"Major", element:"Water", planet:"Neptune",  zodiac:"Pisces",      emoji:"🌕", keywords:["Illusion","Fear","Subconscious","Dreams"], upright:"The subconscious speaks — pay attention to dreams and intuition. Navigate fog with trust.", reversed:"Confusion lifting, truth emerging, fear dissolving.", numerology:"18 = Karmic number of hidden forces revealed.", },
  { number:19, name:"The Sun",        arcana:"Major", element:"Fire",  planet:"Sun",      zodiac:"Leo",         emoji:"☀️", keywords:["Joy","Success","Vitality","Clarity"], upright:"Pure joy, success, clarity, vitality. The world is your playground. Full illumination.", reversed:"Delays in joy, temporary setback, need for inner sunshine.", numerology:"19 = Karmic number of independence achieved through self-sufficiency.", },
  { number:20, name:"Judgement",      arcana:"Major", element:"Fire",  planet:"Pluto",    zodiac:"Scorpio",     emoji:"🎺", keywords:["Renewal","Calling","Rebirth","Reckoning"], upright:"A major calling — your higher self demands you rise. Spiritual rebirth and renewal.", reversed:"Self-doubt, ignoring the calling, fear of judgment.", numerology:"20 = 2+0 = 2. The great awakening through cooperation with divine will.", },
  { number:21, name:"The World",      arcana:"Major", element:"Earth", planet:"Saturn",   zodiac:"Capricorn",   emoji:"🌍", keywords:["Completion","Achievement","Wholeness","Integration"], upright:"Total completion of a cycle. Achievement, wholeness, the world is yours. You made it.", reversed:"Loose ends, delayed success, incomplete cycle.", numerology:"21 = 2+1 = 3. Joyful completion. The number of the world aligned.", },
];

// ── Minor Arcana (condensed — key cards) ────────────────────────────────────
export const SUIT_MEANINGS: Record<string, { element:string; realm:string; energy:string; number:number }> = {
  "Wands":  { element:"Fire",  realm:"Career, passion, action, creativity", energy:"Drive, ambition, entrepreneurship, sports", number:1 },
  "Cups":   { element:"Water", realm:"Emotions, relationships, intuition",  energy:"Love, feelings, dreams, spiritual flow",    number:2 },
  "Swords": { element:"Air",   realm:"Mind, conflict, communication, truth",energy:"Thought, challenge, clarity through pain",   number:3 },
  "Pentacles":{ element:"Earth", realm:"Money, health, material, career",  energy:"Abundance, grounding, practical mastery",   number:4 },
};

// ── Card of the Year ─────────────────────────────────────────────────────────
export function getCardOfYear(lifePath: number, personalYear: number): TarotCard {
  const num = reduce(lifePath + personalYear);
  const idx = num > 21 ? reduce(num) : num;
  return MAJOR_ARCANA[Math.min(idx, 21)];
}

// ── Daily Card (based on today's date reduced) ────────────────────────────────
export function getDailyCard(month: number, day: number, year: number): TarotCard {
  const fullSum = [...`${String(month).padStart(2,"0")}${String(day).padStart(2,"0")}${year}`].reduce((a,d)=>a+(+d),0);
  const reduced = reduce(fullSum);
  const idx = reduced > 21 ? reduce(reduced) : reduced;
  return MAJOR_ARCANA[Math.min(idx, 21)];
}

// ── 3-Card Spread ─────────────────────────────────────────────────────────────
export function getThreeCardSpread(month: number, day: number, year: number, lifePath: number): { past: TarotCard; present: TarotCard; future: TarotCard } {
  const base = [...`${String(month).padStart(2,"0")}${String(day).padStart(2,"0")}${year}`].reduce((a,d)=>a+(+d),0);
  const past    = MAJOR_ARCANA[reduce(base - lifePath) % 22];
  const present = getDailyCard(month, day, year);
  const future  = MAJOR_ARCANA[reduce(base + lifePath) % 22];
  return { past, present, future };
}

// ── Personal Year → Major Arcana ─────────────────────────────────────────────
export const YEAR_CARD: Record<number, number> = {
  1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9,
  10:10, 11:11, 22:0
};

// ── Life Path → Tarot Archetype ───────────────────────────────────────────────
export const LP_CARD: Record<number, { card: string; interpretation: string }> = {
  1:  { card:"The Magician",    interpretation:"You are The Magician — wielding all tools, pure concentrated will, manifesting reality through focused action. Your number 1 LP is The Magician's domain." },
  2:  { card:"The High Priestess", interpretation:"The High Priestess — intuitive, receptive, keeper of sacred knowledge." },
  3:  { card:"The Empress",     interpretation:"The Empress — creative abundance, self-expression, joyful creation." },
  4:  { card:"The Emperor",     interpretation:"The Emperor — authority, structure, mastery over order." },
  5:  { card:"The Hierophant", interpretation:"The Hierophant — seeking truth through varied experience and questioning." },
  6:  { card:"The Lovers",      interpretation:"The Lovers — choice, love, alignment of values as life mission." },
  7:  { card:"The Chariot",     interpretation:"The Chariot — victory through mastery, triumph of will." },
  8:  { card:"Strength",        interpretation:"Strength — inner power, compassionate mastery of force." },
  9:  { card:"The Hermit",      interpretation:"The Hermit — wisdom earned through experience, guiding light for others." },
};

// ── Elemental Spread for today ────────────────────────────────────────────────
export function getElementalSpread(personalDay: number) {
  return {
    fire: MAJOR_ARCANA[personalDay % 22],
    water: MAJOR_ARCANA[(personalDay + 4) % 22],
    earth: MAJOR_ARCANA[(personalDay + 8) % 22],
    air: MAJOR_ARCANA[(personalDay + 12) % 22],
  };
}
