/** Life path 28/1. 28 stays 28. It is the wealth compound, not a plain 1. */

import { calcUniversalDay, calcUniversalMonth } from "@/lib/numerology";
import { chineseMonthSign, chineseSign, lifePath } from "@/lib/vote-decode";
import { sunSign } from "@/lib/life-studio";
import { compat } from "@/lib/gg33";
import { numberRelation, secretRelation, signRelation, type Sign } from "@/lib/vote-decode";

export const PATH_28 = {
  label: "28/1",
  kicker: "28 is the number of Wealth",
  overview:
    "As a 28 lifepath you have an edge over everybody else when it comes to materialistic success in your projects, business and endeavors. You have strong leadership traits, thrive under pressure and can easily handle stress. You say things how they are instead of sugarcoating it which often leads to conflict and you are good at giving advice but not that good at taking it, causing you to often learn things the hard way.",
  personality: {
    title: "Ambitious and Determined",
    body: "Your drive and willpower is the leading force behind your actions. You get things done, even if it means doing it alone.",
    advantage:
      "You have an edge when it comes to noticing potential business moves and ways of making money and seeing the bigger picture before the competition catches on.",
    do: "Be a strong leader and independent. 28s don't get to the top by being a follower. They make it by doing things their way.",
    watch:
      "Family life usually suffers for the successful 28s, because they have often had to sacrifice family time for personal gains.",
  },
  birthday: {
    title: "8th of the Month",
    body: "People born on the 8th showcase strength, determination and a strong drive towards success, as 8 is the number of money and power. Money always plays a big role in your life, whether it's about having it or not having it, as you swing between the two sides of Success and Failure.",
    traits: [
      { title: "Resolute", body: "Your sense of mission comes as first priority." },
      { title: "Business", body: "Naturally talented in business endeavors." },
      { title: "Volatile", body: "You are not afraid of taking risks." },
    ],
    insight:
      "You have to live a righteous life, as 8 is also the number of karma. If you do anything bad it comes back to you 10x, as you know the meaning of instant karma.",
  },
  strengths: [
    { title: "Wealth Magnet", body: "You attract money and often stumble upon hidden opportunities." },
    { title: "Safety Net", body: "Whenever you desperately need money, somehow it comes to you." },
    { title: "Leadership", body: "28s manifest wealth by doing their own thing, not by being a follower." },
    { title: "Quality over Quantity", body: "Focus on being the best of the best at what you do, and money will come naturally." },
    { title: "Improvement", body: "Learn from your mistakes instead of repeating them over and over again." },
  ],
  weaknesses: [
    { title: "Family struggles", body: "When your main goal in life is money, family life is bound to suffer." },
    { title: "Greed", body: "Always wanting more can leave you neglected by your peers." },
    { title: "Priorities", body: "Decide what's important to you in life and move accordingly." },
    { title: "Embrace ambition", body: "Take constant action in life, as stagnation depletes your energy." },
    { title: "Drinking", body: "Avoid alcohol, as some of the worst decisions in your life might have been made when drunk." },
  ],
  career: {
    body: "28 lifepaths work best when money, power, or high stakes are involved. You are built for pressure and responsibility and usually perform better when outcomes matter. Passive roles or capped income drain you.",
    tags: ["Strategy", "Financial Magnetism", "Authority", "Precision"],
    paths: ["Business Owner", "Entrepreneur", "Finance", "Sales", "Real Estate", "Negotiation", "Leadership", "High Stakes Work"],
    style: "You move with strategy and build through decisive action. You naturally pull money and opportunity into your orbit through precision.",
    watch: "Wasted time and emotional distance. Your ambition can isolate you if you do not maintain personal balance.",
  },
  love: {
    body: "28 lifepaths naturally bring dominance and financial gravity into relationships. You do best with partners who are independent and stable. You are not built for codependency or emotional bargaining.",
    traits: ["Independent", "High-Value", "Stable", "Respectful"],
    match: "High-value individuals who can improve with you. You attract wealth and power, and your partner should align with that frequency.",
    bonding: "Precision and alignment. You need a partner who respects your drive and stands on their own without competing with you.",
    watch: "Watch out for emotional distance and control issues. Relationships can easily turn transactional if you are not careful.",
  },
  study: [
    { n: "01", title: "Magnetism", body: "28s naturally pull money and opportunity into their orbit. Wealth often arrives when it is needed most, sometimes from an unexpected place." },
    { n: "02", title: "Authority", body: "Command comes naturally to 28s. You do not need to raise your voice or force direction. Your presence itself creates structure." },
    { n: "03", title: "Instant Karma", body: "For 28s, life operates on a quick cycle of return. Every action you take sends an immediate signal back, whether as gain or as a correction." },
    { n: "04", title: "Work Ethic", body: "A 28 thrives through relentless effort. When focus is clear, every unit of energy translates into tangible results." },
    { n: "05", title: "Strategic Influence", body: "Your greatest power often works behind the scenes. You do not need the spotlight to control outcomes, because your moves set the frame other people walk into." },
    { n: "06", title: "Independent Operator", body: "You function best when steering your own path. Collaboration can succeed, but only when the people around you hold their own weight." },
    { n: "07", title: "Long Term Visionary", body: "You see wealth as structure, not chance. Systems, strategy, and legacy matter more than quick wins." },
    { n: "08", title: "Financially Reincarnated", body: "Many 28s feel as if wealth is already familiar. Old patterns of success often resurface as instinct, before you can explain how you knew." },
    { n: "09", title: "Smooth Persuader", body: "You rarely need to force outcomes. Your timing, tone, and presence naturally guide others to follow your lead." },
    { n: "10", title: "Energy Can Burn Hot", body: "Your ambition is powerful but volatile. Directed with discipline, it produces exponential results. Unchecked, it burns the people and the plan around you." },
  ],
};

export const OX_YEAR = {
  title: "The Dictator",
  line: "Earth Ox · Lunar year Jan 26, 2009 – Feb 13, 2010",
  body: "Steady and trustworthy, the Ox represents hard work, determination and strength, but they can be extremely hardheaded. Once they make up their mind, there is no changing it.",
  glance: {
    strengths: ["Loyalty", "Consistency"],
    weaknesses: ["Stubbornness", "Anger Issues"],
    gift: "Reading body language",
  },
  friendlyIntro:
    "These are your friendly signs in Eastern astrology. Their energies align with yours as you balance and complement each other. Look for these signs in relationships, friendship, and business partners. The more friendly energy you have around you, the better it gets.",
  goodYearsIntro:
    "During these years, energy is aligned in your favor. Take action and make things happen. Best for new beginnings and big imprints like opening a company, getting married, having a child, and starting new things.",
  enemyIntro:
    "Your enemy sign must be avoided. Being around it causes conflict and drains your energy. Never date, marry, or sleep with your enemy sign. Don't have your enemy sign as your boss, doctor, lawyer, or in any influential position that affects your life. It always brings problems.",
  enemyYearsIntro:
    "Enemy years happen once every 12 years and bring massive problems. Lay low, exercise caution, and avoid taking big risks. Don't start a company, get married, move into a new country, or make any big imprints. The risk of failure and distress is much higher.",
  strength:
    "The Ox's strength comes from a natural skill for reading body language. People can't hide anything from you. You see through their movements and mannerisms if they are lying, so trust your intuition when it's telling you something.",
  weakness:
    "Oxen often struggle from a lack of compassion and empathy when dealing with people. A strong and intense personality can easily overpower others and cause both of you to miss out on beneficial opportunities.",
  dos: [
    "Take constant action and work hard",
    "Maintain the momentum you have built",
    "Be considerate to those around you",
  ],
  donts: [
    "Avoid letting anger control your actions",
    "Don't refuse necessary change",
    "Watch out for being too stubborn and inadaptable",
  ],
  study: [
    { n: "01", title: "Dependable", body: "Consistent, reliable, and steady across long timeframes. Follows through on commitments and becomes a structural support for the people who rely on you." },
    { n: "02", title: "Patient", body: "Maintains composure under pressure and resists rushed decisions. Progress is made through steady assessment and endurance rather than speed." },
    { n: "03", title: "Practical", body: "Prioritizes what works over what looks good. Decisions are grounded in function, reliability, and proven outcomes rather than experimentation." },
    { n: "04", title: "Strong & Athletic", body: "Physically and emotionally resilient. Serves as a stabilizing force in demanding situations through endurance and strength." },
    { n: "05", title: "Stubborn", body: "Holds position firmly once decided. Determination sustains long-term effort but reduces flexibility when compromise is required." },
    { n: "06", title: "Decisive", body: "Makes firm, confident decisions once information is sufficient. Certainty provides direction and stability for others." },
    { n: "07", title: "Authoritative", body: "Naturally takes charge and establishes order. Authority is expressed calmly through structure, consistency, and expectation setting." },
    { n: "08", title: "Honest", body: "Communicates directly and transparently. Trust is built through truthfulness and consistency rather than diplomacy." },
    { n: "09", title: "Dictatorial", body: "Becomes rigid and controlling when authority is questioned. Order is enforced through structure, sometimes at the expense of flexibility." },
    { n: "10", title: "Determined", body: "Maintains unwavering persistence toward goals. Progress continues through resistance and delay without abandoning course." },
  ],
  balance: {
    strengths: ["Reliable", "Calm Under Pressure", "Practical Executor", "Physically Strong", "Relentlessly Determined"],
    challenges: ["Stubborn", "Domineering Under Pressure", "Rigid Thinking", "Resistant to Change", "Physically Restless When Idle"],
  },
};

/** Ox against the 12. Cat, not Rabbit. Percents are the match, not a life-path score. */
export const OX_MATCHES = [
  { animal: "Rat", pct: 95, tone: "friend" },
  { animal: "Snake", pct: 80, tone: "friend" },
  { animal: "Rooster", pct: 80, tone: "friend" },
  { animal: "Ox", pct: 70, tone: "self" },
  { animal: "Tiger", pct: 60, tone: "neutral" },
  { animal: "Cat", pct: 60, tone: "neutral" },
  { animal: "Dragon", pct: 60, tone: "neutral" },
  { animal: "Horse", pct: 60, tone: "neutral" },
  { animal: "Monkey", pct: 60, tone: "neutral" },
  { animal: "Dog", pct: 60, tone: "neutral" },
  { animal: "Pig", pct: 60, tone: "neutral" },
  { animal: "Goat", pct: 10, tone: "enemy" },
] as const;

/** Next 12 lunar years from the 2026 Horse year. Dates are lunar, not January 1. */
export const OX_NEXT_12 = [
  { year: 2026, animal: "Horse", span: "Feb 17, 2026 – Feb 5, 2027", tone: "Neutral Year", now: true },
  { year: 2027, animal: "Goat", span: "Feb 6, 2027 – Jan 25, 2028", tone: "Enemy Year" },
  { year: 2028, animal: "Monkey", span: "Jan 26, 2028 – Feb 12, 2029", tone: "Neutral Year" },
  { year: 2029, animal: "Rooster", span: "Feb 13, 2029 – Feb 2, 2030", tone: "Friendly Year" },
  { year: 2030, animal: "Dog", span: "Feb 3, 2030 – Jan 22, 2031", tone: "Neutral Year" },
  { year: 2031, animal: "Pig", span: "Jan 23, 2031 – Feb 10, 2032", tone: "Neutral Year" },
  { year: 2032, animal: "Rat", span: "Feb 11, 2032 – Jan 30, 2033", tone: "Friendly Year" },
  { year: 2033, animal: "Ox", span: "Jan 31, 2033 – Feb 18, 2034", tone: "Your Sign" },
  { year: 2034, animal: "Tiger", span: "Feb 19, 2034 – Feb 7, 2035", tone: "Neutral Year" },
  { year: 2035, animal: "Cat", span: "Feb 8, 2035 – Jan 27, 2036", tone: "Neutral Year" },
  { year: 2036, animal: "Dragon", span: "Jan 28, 2036 – Feb 15, 2037", tone: "Neutral Year" },
  { year: 2037, animal: "Snake", span: "Feb 16, 2037 – Feb 4, 2038", tone: "Friendly Year" },
] as const;

const GOOD_STARTS: [string, number][] = [["Rooster", 2029], ["Rat", 2032], ["Ox", 2033], ["Snake", 2037]];

export function oxGoodYears(until = 2056) {
  const rows: { year: number; animal: string }[] = [];
  for (const [animal, start] of GOOD_STARTS) {
    for (let year = start; year <= until; year += 12) rows.push({ year, animal });
  }
  return rows.sort((a, b) => a.year - b.year);
}

export function oxEnemyYears(until = 2135) {
  const rows: { year: number; animal: string }[] = [];
  for (let year = 2027; year <= until; year += 12) rows.push({ year, animal: "Goat" });
  return rows;
}

export const VIRGO = {
  title: "The Healer",
  line: "Virgo · Earth Sign",
  overview:
    "Virgo is the perfectionist of the zodiac. This sign is detail oriented, methodical, and focused on doing things the right way. Virgo pays close attention to systems, order, and efficiency and feels most stable when life is structured and controlled. Being productive and useful is essential. When idle or surrounded by disorder, stress increases quickly.",
  insight: "Virgo succeeds by applying high standards without becoming trapped by perfection.",
  strength:
    "Virgo has exceptional attention to detail and a strong ability to identify flaws, inefficiencies, and inconsistencies. This makes Virgo highly effective in work, business, and problem solving. Discipline, reliability, and high standards allow Virgo to produce consistent results. When focused, Virgo's precision becomes a major advantage.",
  weakness:
    "Perfectionism can become a limitation. Overanalyzing small details may slow progress or create unnecessary stress. Virgo may judge others too harshly and apply the same criticism inward, leading to self doubt, anxiety, and mental strain. Learning to let go of minor imperfections is essential for balance.",
  love: {
    title: "Devoted & Observant",
    body: "Virgo holds high standards in relationships and may prefer being alone over settling for less than expected. Partners are often evaluated closely, and Virgo may attempt to coach or correct them. Excessive criticism and complaining can create tension. Long term success improves when Virgo maintains standards while allowing flexibility and accepting imperfections.",
  },
  opposite: {
    sign: "Pisces",
    pct: "10% match",
    note: "Your opposite sign",
    body: "Pisces energy clashes with Virgo around order, boundaries, and practicality. Extra caution is advised in relationships, partnerships, and major risk taking with a Pisces.",
  },
  career: {
    body: "Virgo excels in careers that reward precision, analysis, and problem detection. Roles involving investigation, quality control, organization, research, cleaning, auditing, human resources, or system improvement align well. Virgo performs strongly when tasked with finding weaknesses and strengthening foundations. Business success comes from identifying inefficiencies and refining operations.",
    tags: ["Precision", "System Improvement", "Auditing", "Reliability"],
    paths: ["Quality Controller", "Data Auditor", "Researcher", "HR Manager"],
    style: "You are focused on order, efficiency, and doing things the right way.",
    watch: "Perfectionism and over-criticism can create unnecessary stress and delays.",
  },
  health: {
    title: "Abdomen and intestines",
    body: "Virgo is associated with the abdomen, intestines, and digestive system. Digestive sensitivity, weight fluctuation, and stress-related stomach issues are common. Mental stress often shows up physically. Maintaining routine, clean environments, and grounded daily habits supports overall health.",
    vulnerability: "Stomach issues",
    remedy: "Routine and cleanliness",
    insight: "Ground your daily habits to stabilize digestion.",
  },
  friends: {
    signs: [
      { sign: "Taurus", pct: 100 },
      { sign: "Capricorn", pct: 100 },
    ],
    body: "These signs align with Virgo's need for stability, structure, and long term planning. People with Taurus or Capricorn energy are supportive across relationships, business, and daily life. Earth sign alignment improves consistency and reliability.",
    windows: "Taurus and Capricorn seasons are the strongest periods for Virgo. These times support planning, organization, long term decisions, and system building.",
  },
  caution: "During Pisces season, Virgo should avoid taking major risks and making emotionally driven commitments.",
};

export const VIRGO_MATCHES = [
  { sign: "Taurus", pct: 100, tone: "friend" },
  { sign: "Capricorn", pct: 100, tone: "friend" },
  { sign: "Virgo", pct: 80, tone: "self" },
  { sign: "Aries", pct: 60, tone: "neutral" },
  { sign: "Gemini", pct: 60, tone: "neutral" },
  { sign: "Cancer", pct: 60, tone: "neutral" },
  { sign: "Leo", pct: 60, tone: "neutral" },
  { sign: "Libra", pct: 60, tone: "neutral" },
  { sign: "Scorpio", pct: 60, tone: "neutral" },
  { sign: "Sagittarius", pct: 60, tone: "neutral" },
  { sign: "Aquarius", pct: 60, tone: "neutral" },
  { sign: "Pisces", pct: 10, tone: "enemy" },
] as const;

/** Life-path number kept for the compatibility chart. 28 stays 28. */
export function fitFace(compound: number, reduced: number) {
  if (compound === 28 || compound === 11 || compound === 22 || compound === 33) return compound;
  return reduced;
}

export function numberFit(self: number, other: number) {
  const hit = compat(self, other);
  if (hit.rel === "enemy") return { rel: "enemy" as const, pct: 10 };
  if (hit.rel === "friendly") return { rel: "friend" as const, pct: hit.pct };
  const rel = numberRelation(self, other);
  if (rel === "enemy" || rel === "worst") return { rel: "enemy" as const, pct: 10 };
  if (rel === "friend" || rel === "soulmate" || rel === "same") return { rel: "friend" as const, pct: rel === "soulmate" ? 95 : null };
  return { rel: "neutral" as const, pct: 60 };
}

export function animalPct(self: string, other: string) {
  if (self === "Ox") {
    const hit = OX_MATCHES.find((m) => m.animal === other);
    if (hit) return hit.pct;
  }
  if (self === other) return 70;
  const rel = signRelation(self as Sign, other as Sign);
  if (rel === "friend") return 80;
  if (rel === "enemy") return 10;
  const secret = secretRelation(self as Sign, other as Sign);
  if (secret === "secret-friend") return 75;
  if (secret === "secret-enemy") return 35;
  return 60;
}

export function sunPct(self: string, other: string) {
  if (self === "Virgo") {
    const hit = VIRGO_MATCHES.find((m) => m.sign === other);
    if (hit) return hit.pct;
  }
  if (self === other) return 80;
  const order = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const element: Record<string, string> = { Aries: "fire", Leo: "fire", Sagittarius: "fire", Taurus: "earth", Virgo: "earth", Capricorn: "earth", Gemini: "air", Libra: "air", Aquarius: "air", Cancer: "water", Scorpio: "water", Pisces: "water" };
  const ia = order.indexOf(self);
  const ib = order.indexOf(other);
  if (ia >= 0 && ib >= 0 && (ia + 6) % 12 === ib) return 10;
  if (element[self] && element[self] === element[other]) return 100;
  return 60;
}

/** Two birthdays. Not the Reports day list. A friendly life path counts as 80. Life path 50%, year animal 25%, sun 25%. The year animal turns on February 4. */
export function birthPair(a: { year: number; month: number; day: number }, b: { year: number; month: number; day: number }) {
  const la = lifePath(a.year, a.month, a.day);
  const lb = lifePath(b.year, b.month, b.day);
  const faceA = fitFace(la.compound, la.reduced);
  const faceB = fitFace(lb.compound, lb.reduced);
  const num = numberFit(faceA, faceB);
  const lp = pairLifePct(num);
  const animalNameA = yearAnimal(a.year, a.month, a.day);
  const animalNameB = yearAnimal(b.year, b.month, b.day);
  const sunA = sunSign(a.month, a.day);
  const sunB = sunSign(b.month, b.day);
  const animal = animalPct(animalNameA, animalNameB);
  const sky = sunPct(sunA, sunB);
  const pct = Math.max(1, Math.min(99, Math.round(lp * 0.5 + animal * 0.25 + sky * 0.25)));
  return {
    pct,
    lp,
    animal,
    sky,
    num,
    a: `${la.compound}/${la.reduced}`,
    b: `${lb.compound}/${lb.reduced}`,
    animals: `${animalNameA} and ${animalNameB}`,
    suns: `${sunA} and ${sunB}`,
    fatal: num.rel === "enemy" || animal <= 10 || sky <= 10,
  };
}

function yearAnimal(year: number, month: number, day: number) {
  const y = month < 2 || (month === 2 && day < 4) ? year - 1 : year;
  return chineseSign(y);
}

function pairLifePct(num: { rel: string; pct: number | null }) {
  if (num.rel === "enemy") return 10;
  if (num.rel === "friend") return 80;
  return num.pct ?? 60;
}

export function dayCompatibility(input: {
  lifeCompound: number;
  lifeReduced: number;
  universalReduced: number;
  universalCompound: number;
  dayReduced: number;
  dayCompound: number;
  combinedReduced: number;
  combinedCompound: number;
  yearAnimal: string;
  monthAnimal: string;
  sun: string;
  daySun: string;
}) {
  const self = fitFace(input.lifeCompound, input.lifeReduced);
  const numbers = [
    { name: "Universal", other: fitFace(input.universalCompound, input.universalReduced) },
    { name: "Day", other: fitFace(input.dayCompound, input.dayReduced) },
    { name: "Together", other: fitFace(input.combinedCompound, input.combinedReduced) },
  ].map((row) => ({ ...row, ...numberFit(self, row.other) }));
  const scored = numbers.filter((n) => n.name !== "Together" && n.pct != null) as (typeof numbers[number] & { pct: number })[];
  const numberPct = scored.length ? Math.round(scored.reduce((s, n) => s + n.pct, 0) / scored.length) : null;
  return {
    self,
    numbers,
    numberPct,
    month: animalPct(input.yearAnimal, input.monthAnimal),
    sky: sunPct(input.sun, input.daySun),
  };
}

/** 28 life path on the 7th of the month. Three layers, not the personal day. */
export const DAY_28_ON_7 = {
  life: {
    kicker: "28 life path day",
    title: "Focus on Wealth",
    tags: ["Wealth", "Money", "Value"],
    body: "Wealth and material progress are emphasized today, making money and value based decisions more important.",
    good: ["Making money and handling finances", "Positioning yourself for profit", "Thinking in terms of value and return"],
    watch: ["Wasting money or ignoring finances", "Trying to make money dishonestly"],
  },
  day: {
    kicker: "7 day",
    title: "Move With Caution",
    tags: ["Safety", "Awareness", "Caution"],
    body: "The 7th can bring more sensitivity around health, injury, and physical strain, so move with awareness today.",
    good: ["Move carefully and avoid putting your body in a risky spot", "Stay mentally alert and pay attention to your surroundings", "Listen to your body before you push past your limit"],
    watch: ["Avoid taking unnecessary risks with your health or safety", "Don't do dangerous activities just to prove something"],
  },
  combo: {
    kicker: "28 life path · 7 day",
    title: "Wealth Through Strategy",
    headline: "Wealth Slows Down to Think",
    event: "28 Wealth Day. Money, power, and long term value.",
    tags: ["Wealth", "Leadership", "Knowledge"],
    body: "A day where money is best made through strategy, knowledge, and calculated thinking.",
    positive: "Best used to research, learn about business or investments, and refine your financial plans so your next move is based on clear understanding rather than impulse.",
    negative: "Overthinking and hesitation. The analytical nature of the 7 can slow down the natural drive of 28 if you get stuck in research.",
    forecast: "Steady support for money and business, and for spirituality and reflection. Make practical progress without forcing the outcome. Do not let overthinking stall action.",
    use: ["Handle practical money or business priorities", "Create quiet space to think and reset", "Do not let overthinking stall action"],
  },
};

export const CAUTION_2027 = {
  title: "Caution year",
  span: "Feb 6, 2027 – Sep 7, 2027",
  best: "Best for letting go",
  body: "Endings and emotions may feel heavier this year. Let go with honesty, avoid clinging to what is complete, and do not drag unfinished burdens into the next cycle.",
  layers: "Personal Year 9 is still running, and the Goat year has started. Goat is the enemy animal.",
};

export const YEAR_NOW = {
  span: "Sep 8, 2026 – Sep 7, 2027",
  face: 9,
  title: "Completion",
  body: "Finish what has run its course, close open loops, and make space for the next cycle by completing what remains.",
  why: "Completion, release, and change matter now.",
  universal: "Universal Year 1. How new beginnings shape the wider year.",
  animal: "Horse year, Feb 17, 2026 – Feb 5, 2027. Neutral. How movement and independence shape the year.",
};

export const MONTH_NOW = {
  span: "Oct 8 – Nov 8, 2026",
  face: 1,
  title: "Strength",
  body: "Use movement, discipline, and physical action to keep your energy focused. Initiative and direction matter now.",
  west: "Scorpio season. Neutral. How depth and transformation shape this month.",
  animal: "Pig month. Neutral. How connection and enjoyment shape this period.",
};

export const POWER_WINDOW = {
  span: "Dec 6, 2026 – Dec 7, 2026",
  title: "Best for awareness",
  body: "Pay attention to intuition, signals, and emotional insight. This is a strong time for awareness, inspiration, and seeing what others may miss before taking the next step.",
  layers: "Personal Month 11 plus a friendly Rat month.",
};

export const ROADMAP = [
  { y: 2026, when: "Feb 17", title: "Horse year", note: "Neutral. Movement and independence through Feb 5, 2027." },
  { y: 2026, when: "Sep 8", title: "Personal Year 9", note: "Completion and release through Sep 7, 2027." },
  { y: 2026, when: "Oct 8", title: "Personal Month 1", note: "Strength. Through Nov 8." },
  { y: 2026, when: "Nov 8", title: "Personal Month 11", note: "Master month." },
  { y: 2026, when: "Nov 22", title: "Sagittarius season", note: "Neutral." },
  { y: 2026, when: "Dec 6", title: "Rat month", note: "Friendly to the Ox year. Power window with Personal Month 11 on Dec 6–7." },
  { y: 2026, when: "Dec 8", title: "Personal Month 3", note: "Month changes on the 8th." },
  { y: 2026, when: "Dec 22", title: "Capricorn season", note: "Friendly for Virgo. Planning and systems." },
  { y: 2027, when: "Jan 1", title: "Universal Year 11", note: "Collective emotional shift. 11 stays 11." },
  { y: 2027, when: "Jan 6", title: "Ox month", note: "Friendly." },
  { y: 2027, when: "Jan 8", title: "Personal Month 1", note: "Still inside Personal Year 9." },
  { y: 2027, when: "Jan 20", title: "Aquarius season", note: "Neutral." },
  { y: 2027, when: "Feb 6", title: "Goat year", note: "Enemy. Caution with Personal Year 9 until Sep 7." },
  { y: 2027, when: "Sep 8", title: "Personal Year 28", note: "Leadership and wealth. 28 stays 28." },
  { y: 2028, when: "Jan 1", title: "Universal Year 3", note: "Collective communication." },
  { y: 2028, when: "Jan 26", title: "Monkey year", note: "Neutral." },
  { y: 2028, when: "Sep 8", title: "Personal Year 11", note: "Emotional and spiritual intensity." },
  { y: 2029, when: "Jan 1", title: "Universal Year 4", note: "Collective structure." },
  { y: 2029, when: "Feb 13", title: "Rooster year", note: "Friendly." },
  { y: 2029, when: "Sep 8", title: "Personal Year 3", note: "Communication and creativity." },
] as const;


/** Sidereal natal for September 8, 2009. Given positions, not the date estimate. */
export const VEDIC_NATAL = {
  when: "September 8, 2009",
  rows: [
    { planet: "Ascendant", sign: "Libra", nakshatra: "Swati", notes: "Libra rising" },
    { planet: "Sun", sign: "Leo", nakshatra: "Purva Phalguni", notes: "Own sign" },
    { planet: "Moon", sign: "Aries", nakshatra: "Ashwini", notes: "" },
    { planet: "Mars", sign: "Gemini", nakshatra: "Ardra", notes: "" },
    { planet: "Mercury", sign: "Virgo", nakshatra: "Hasta", notes: "Retrograde, own sign" },
    { planet: "Jupiter", sign: "Capricorn", nakshatra: "Dhanishta", notes: "Retrograde, debilitated" },
    { planet: "Venus", sign: "Cancer", nakshatra: "Ashlesha", notes: "" },
    { planet: "Saturn", sign: "Leo", nakshatra: "Uttara Phalguni", notes: "Atmakaraka" },
    { planet: "Rahu", sign: "Capricorn", nakshatra: "Uttara Ashadha", notes: "" },
    { planet: "Ketu", sign: "Cancer", nakshatra: "Pushya", notes: "" },
  ],
  lines: [
    "The lagna is sidereal Libra, Swati. This is the Vedic rising. It is not the tropical rising estimate.",
    "The Sun is in Leo, its own sign, in Purva Phalguni. Mercury is also in its own sign, Virgo, but retrograde, in Hasta. Jupiter is retrograde and debilitated in Capricorn, Dhanishta.",
    "Saturn in Leo, Uttara Phalguni, is the atmakaraka. Rahu is in Capricorn with that Jupiter. Ketu is in Cancer, Pushya. Venus is in Cancer, Ashlesha. The Moon is in Aries, Ashwini. Mars is in Gemini, Ardra.",
  ],
};

export const FRIENDLY = {
  countries: [
    { name: "Australia", pct: 90 },
    { name: "Bahamas", pct: 88 },
    { name: "Peru", pct: 88 },
    { name: "Indonesia", pct: 88 },
    { name: "Belize", pct: 88 },
    { name: "France", pct: 84 },
    { name: "Singapore", pct: 82 },
    { name: "Guatemala", pct: 82 },
    { name: "Cambodia", pct: 82 },
    { name: "Thailand", pct: 81 },
  ],
  cities: [
    { name: "New York City", pct: 98 },
    { name: "Raleigh, NC", pct: 97 },
    { name: "Las Vegas, NV", pct: 93 },
    { name: "Savannah, GA", pct: 93 },
    { name: "Charlotte, NC", pct: 91 },
    { name: "Madrid, Spain", pct: 91 },
    { name: "Orange County, CA", pct: 91 },
    { name: "Oceanside, CA", pct: 91 },
    { name: "Los Angeles", pct: 90 },
    { name: "Oakland, CA", pct: 90 },
  ],
  clothes: [
    { name: "Forever 21", pct: 98 },
    { name: "Air Jordan", pct: 91 },
    { name: "Hermès", pct: 91 },
    { name: "Guess", pct: 91 },
    { name: "Prada", pct: 88 },
    { name: "Jimmy Choo", pct: 84 },
    { name: "Gucci", pct: 82 },
    { name: "Vera Wang", pct: 82 },
    { name: "Lee", pct: 82 },
    { name: "Under Armour", pct: 81 },
  ],
  cars: [
    { name: "Land Rover", pct: 98 },
    { name: "Toyota", pct: 97 },
    { name: "McLaren", pct: 89 },
    { name: "Volkswagen Group", pct: 88 },
    { name: "Infiniti", pct: 88 },
    { name: "Chrysler", pct: 86 },
    { name: "Honda", pct: 84 },
    { name: "Bugatti", pct: 84 },
    { name: "Pontiac", pct: 83 },
    { name: "Aston Martin", pct: 82 },
  ],
};

/** CUE day percents. November 2026 and December 2026 are the lists you gave.
 *  The same universal month repeats that list. A friend sun sign adds 9 from the day after it begins
 *  (Capricorn and Taurus). Pisces subtracts 11. The first day of a new sign stays on the old score. */
const CUE_NOV = [0, 60, 50, 56, 63, 66, 32, 57, 67, 46, 57, 44, 56, 63, 66, 29, 57, 67, 46, 51, 44, 56, 63, 66, 29, 57, 67, 46, 60, 44, 56];
/** December 2026. The typed list began with November 30 (56). Day 4 is 70. Day 31 is the last 79. */
const CUE_DEC = [0, 53, 54, 63, 70, 31, 67, 57, 53, 50, 50, 47, 63, 70, 31, 64, 57, 53, 50, 44, 47, 63, 79, 40, 73, 66, 62, 59, 62, 56, 72, 79];

function sunPoints(month: number, day: number) {
  const sign = sunSign(month, day);
  const prevMonth = day > 1 ? month : month === 1 ? 12 : month - 1;
  const prevDay = day > 1 ? day - 1 : prevMonth === 2 ? 28 : [4, 6, 9, 11].includes(prevMonth) ? 30 : 31;
  if (sunSign(prevMonth, prevDay) !== sign) return 0;
  const pct = sign === "Taurus" || sign === "Capricorn" ? 100 : sign === "Virgo" ? 80 : sign === "Pisces" ? 10 : 60;
  return Math.round(((pct - 60) * 9) / 40);
}

export function cueDayPercent(year: number, month: number, day: number) {
  if (year === 2026 && month === 11 && day >= 1 && day <= 30) return CUE_NOV[day];
  if (year === 2026 && month === 12 && day >= 1 && day <= 31) return CUE_DEC[day];
  const um = calcUniversalMonth(year, month).reduced;
  const nov = day === 31 ? 63 : CUE_NOV[day] ?? CUE_NOV[((day - 1) % 30) + 1];
  const decNeutral = (CUE_DEC[day] ?? 63) - (day >= 22 ? 9 : 0);
  const sun = sunPoints(month, day);
  if (um === 3) return nov + sun;
  if (um === 4) return decNeutral + sun;
  return nov + sun;
}

export function cueMatchPercent(founded: readonly number[] | undefined, y: number, m: number, d: number) {
  if (!founded || founded.length < 3) return null;
  const [fy, fm, fd] = founded;
  const lp = lifePath(fy, fm, fd);
  const universal = calcUniversalDay(y, m, d);
  const calendarReduced = ((d - 1) % 9) + 1;
  const fit = dayCompatibility({
    lifeCompound: lp.compound,
    lifeReduced: lp.reduced,
    universalReduced: universal.reduced,
    universalCompound: universal.compound,
    dayReduced: calendarReduced,
    dayCompound: d,
    combinedReduced: calendarReduced,
    combinedCompound: universal.reduced,
    yearAnimal: chineseSign(fy),
    monthAnimal: chineseMonthSign(m, d),
    sun: sunSign(fm, fd),
    daySun: sunSign(m, d),
  });
  const parts = [fit.numberPct, fit.month, fit.sky].filter((n): n is number => n != null);
  if (!parts.length) return null;
  return {
    pct: Math.round(parts.reduce((s, n) => s + n, 0) / parts.length),
    number: fit.numberPct,
    month: fit.month,
    sky: fit.sky,
    life: `${lp.compound}/${lp.reduced}`,
  };
}

export function cueDayBand(pct: number) {
  if (pct >= 63) return "Strong";
  if (pct >= 50) return "Good day";
  if (pct >= 40) return "Mixed";
  return "Low";
}

/** Calendar reports describe number compatibility, not a score tier. */
export function calendarRelationLabel(rel: string | null | undefined) {
  if (rel === "friend" || rel === "friendly") return "Friendly";
  if (rel === "enemy") return "Enemy";
  return "Neutral";
}

export function calendarRelationFromPercent(pct: number | null | undefined) {
  if (pct == null || !Number.isFinite(pct)) return "neutral";
  if (pct <= 40) return "enemy";
  if (pct >= 70) return "friend";
  return "neutral";
}

export function isPath28(compound: number) {
  return compound === 28;
}

/** 28 is kept. Every other personal-year compound shows its root. */
export function yearFace(compound: number, reduced: number) {
  return compound === 28 ? 28 : reduced;
}

export function yearCopy(face: number) {
  if (face === 28) {
    return {
      title: "Wealth & Authority",
      body: "A year of financial expansion, strategic power, and high level opportunity. Build assets, scale influence, and position for long term gain.",
      opportunities: ["Launch or scale a business", "Increase income streams", "Strengthen financial systems", "Step into executive leadership"],
      watch: "Reckless investments or ego driven decisions can create losses. Avoid overleveraging or chasing fast money.",
      guidance: "Think like an owner, act strategically, and use disciplined execution to build lasting wealth and authority.",
    };
  }
  if (face === 9) {
    return {
      title: "Completion & Release",
      body: "A year of closure, reflection, and transition. Finish cycles, release what no longer fits, and prepare for renewal.",
      opportunities: ["Complete unfinished projects", "End outdated commitments", "Reflect on key life lessons", "Clear emotional or practical baggage"],
      watch: "Emotional resistance or ego attachment can delay progress. Avoid forcing new long term ventures during transition.",
      guidance: "Accept endings strategically, adapt with maturity, and create clean space for the next chapter.",
    };
  }
  if (face === 8) {
    return {
      title: "Power",
      body: "A year of money, pressure, and authority. Price the work, take the responsibility, and do not sit in a capped role.",
      opportunities: ["Collect what you are owed", "Take the higher-stakes seat", "Build the system that holds the money"],
      watch: "Force without a ledger turns an 8 year into debt.",
      guidance: "Move the money on purpose. Do not drift.",
    };
  }
  return null;
}
