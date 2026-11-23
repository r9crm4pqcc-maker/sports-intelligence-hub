// ─── Cristian Zavala's Birth Chart ───────────────────────────────────────────
// DOB: September 8, 2009 | Time: 11:18 AM CDT | Chicago, IL 41.88°N 87.63°W
// Western (Tropical) + Vedic (Sidereal, ayanamsa 23°51') charts

export const SIGNS_WESTERN = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
export const SIGNS_VEDIC   = ["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"];

export interface Planet {
  name: string;
  symbol: string;
  sign: string;
  degree: string;
  house: number;
  signVedic: string;
  retrograde: boolean;
  note?: string;
}

// ── Western Chart (Tropical) ─────────────────────────────────────────────────
export const WESTERN_CHART: Planet[] = [
  { name:"Sun",          symbol:"☉", sign:"Virgo",       degree:"15°48'", house:10, signVedic:"Leo",         retrograde:false, note:"10th house — career, public fame. Conjunct Saturn — immense discipline & authority imprint." },
  { name:"Moon",         symbol:"☽", sign:"Taurus",       degree:"18°22'", house:5,  signVedic:"Aries",       retrograde:false, note:"5th house — sports, creativity, romance. Exalted in Vedic Aries." },
  { name:"Mercury",      symbol:"☿", sign:"Virgo",        degree:"29°04'", house:10, signVedic:"Virgo",       retrograde:true,  note:"Rx — just stationed retrograde Sept 7. Deep analytical mind. Own sign in Vedic." },
  { name:"Venus",        symbol:"♀", sign:"Leo",          degree:"22°17'", house:9,  signVedic:"Cancer",      retrograde:false, note:"9th house — travel, higher purpose, philosophy. Magnetic creative flair." },
  { name:"Mars",         symbol:"♂", sign:"Cancer",       degree:"28°55'", house:8,  signVedic:"Cancer",      retrograde:false, note:"8th house — transformation, hidden power, intense drive." },
  { name:"Jupiter",      symbol:"♃", sign:"Aquarius",     degree:"17°08'", house:3,  signVedic:"Capricorn",   retrograde:true,  note:"Rx conjunct Neptune & Chiron. Triple conjunction — spiritual genius." },
  { name:"Saturn",       symbol:"♄", sign:"Virgo",        degree:"25°12'", house:10, signVedic:"Virgo",       retrograde:false, note:"10th house conjunct Sun — karmic authority. Born during Saturn-Uranus opposition." },
  { name:"Uranus",       symbol:"⛢", sign:"Pisces",       degree:"24°43'", house:4,  signVedic:"Aquarius",    retrograde:true,  note:"Rx — opposite Sun/Saturn. Revolutionary tension in roots/home." },
  { name:"Neptune",      symbol:"♆", sign:"Aquarius",     degree:"24°18'", house:3,  signVedic:"Capricorn",   retrograde:true,  note:"Rx conjunct Jupiter — visionary imagination, spiritual art." },
  { name:"Pluto",        symbol:"♇", sign:"Capricorn",    degree:"00°47'", house:2,  signVedic:"Sagittarius", retrograde:true,  note:"Rx in 2nd — transformative relationship with money, values, resources." },
  { name:"Chiron",       symbol:"⚷", sign:"Aquarius",     degree:"24°11'", house:3,  signVedic:"Capricorn",   retrograde:true,  note:"Rx conjunct Jupiter/Neptune — healer-teacher energy." },
  { name:"North Node",   symbol:"☊", sign:"Capricorn",    degree:"26°35'", house:2,  signVedic:"Sagittarius", retrograde:false, note:"Rahu — destiny with material achievement, authority, structure." },
  { name:"South Node",   symbol:"☋", sign:"Cancer",       degree:"26°35'", house:8,  signVedic:"Gemini",      retrograde:false, note:"Ketu — past life sensitivity, intuitive knowing from birth." },
];

export const CHART_META = {
  ascendant: { western:"Sagittarius 20°", vedic:"Scorpio 26°", note:"Sagittarius rising — freedom-loving, philosophical, athletic, optimistic. Ruled by Jupiter in Aquarius." },
  mc: { western:"Virgo 15°", vedic:"Leo 21°", note:"MC conjunct Sun & Saturn — you are meant to be seen, to achieve and to lead publicly. A born public figure." },
  ic: { western:"Pisces 15°", vedic:"Aquarius 21°", note:"IC in Pisces — deep spiritual roots, imaginative inner world." },
  dc: { western:"Gemini 20°", vedic:"Taurus 26°", note:"DC in Gemini — seeks intellectual, communicative partners." },
};

// ── Key Aspects ──────────────────────────────────────────────────────────────
export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: string;
  nature: "major" | "minor";
  interpretation: string;
}

export const ASPECTS: Aspect[] = [
  { planet1:"Sun",     planet2:"Saturn",  type:"Conjunction", orb:"9°24'",  nature:"major", interpretation:"The king meets the taskmaster — extraordinary discipline, ambition, and work ethic hardwired at birth. You take everything seriously. Built for long-term legacy." },
  { planet1:"Sun",     planet2:"Uranus",  type:"Opposition",  orb:"9°05'",  nature:"major", interpretation:"The revolutionary tension — you are simultaneously a traditional authority (Saturn) AND a rebel innovator (Uranus). You break systems to build better ones." },
  { planet1:"Sun",     planet2:"Mercury", type:"Conjunction", orb:"13°16'", nature:"major", interpretation:"Combust Mercury — your mind and identity are fused. Deep thinker, highly analytical, perfectionist communicator." },
  { planet1:"Jupiter", planet2:"Neptune", type:"Conjunction", orb:"0°50'",  nature:"major", interpretation:"The 2009 triple conjunction! Spiritual genius, boundless creativity, prophetic vision. Rare and powerful." },
  { planet1:"Jupiter", planet2:"Chiron",  type:"Conjunction", orb:"7°03'",  nature:"major", interpretation:"Healer-teacher born to uplift others through wisdom and experience." },
  { planet1:"Mars",    planet2:"North Node", type:"Conjunction", orb:"2°20'", nature:"major", interpretation:"Destiny activated through action, drive and athletic/competitive endeavors. Mars on your life's purpose." },
  { planet1:"Saturn",  planet2:"Uranus",  type:"Opposition",  orb:"0°29'",  nature:"major", interpretation:"You were born at the exact Saturn-Uranus opposition of 2009. The axis of order vs. chaos. You carry this tension as your life theme." },
];

// ── House Descriptions ────────────────────────────────────────────────────────
export const HOUSES: Record<number, { name:string; sign:string; planets:string[]; meaning:string }> = {
  1:  { name:"Self & Identity",      sign:"Sagittarius", planets:[],                     meaning:"Sagittarius rising — adventurous, philosophical, athletic, honest, freedom-loving. Ruled by Jupiter. You appear optimistic and larger-than-life." },
  2:  { name:"Money & Values",       sign:"Capricorn",   planets:["Pluto","North Node"], meaning:"Pluto and Rahu in 2nd — your destiny is tied to financial transformation. Extreme highs possible. Powerful, controlled financial drive." },
  3:  { name:"Mind & Communication", sign:"Aquarius",    planets:["Jupiter","Neptune","Chiron"], meaning:"Triple conjunction here — genius-level communication, visionary mind, spiritual messaging. You think in ways others can't imagine." },
  4:  { name:"Home & Roots",         sign:"Pisces",      planets:["Uranus"],             meaning:"Uranus in 4th — unconventional home life, possibly frequent moves. Roots are complex but spiritually deep." },
  5:  { name:"Creativity & Sports",  sign:"Aries",       planets:["Moon"],               meaning:"Moon in 5th — emotionally tied to sports, creativity and performance. Natural joy in competition. Your Moon loves to PLAY and WIN." },
  6:  { name:"Health & Work",        sign:"Taurus",      planets:[],                     meaning:"Taurus in 6th — steady health routines work best. Grounded, consistent daily habits. Value quality in your work." },
  7:  { name:"Relationships",        sign:"Gemini",      planets:[],                     meaning:"Gemini DC — seeks intellectual, witty, communicative partners. Variety in relationships. Mental connection is primary." },
  8:  { name:"Power & Transformation",sign:"Cancer",     planets:["Mars","South Node"],  meaning:"Mars and Ketu in 8th — past life warrior energy. Powerful hidden drive. Intensity in transformation, possible hidden talents." },
  9:  { name:"Philosophy & Travel",  sign:"Leo",         planets:["Venus"],              meaning:"Venus in 9th Leo — you are drawn to international experience, philosophy and beauty. Travel activates your love nature." },
  10: { name:"Career & Public Self", sign:"Virgo",       planets:["Sun","Mercury","Saturn"], meaning:"Sun conjunct Saturn in 10th — the ultimate career placement. Born to be publicly recognized. Virgo precision with authority. Your career IS your life's mission." },
  11: { name:"Community & Goals",    sign:"Libra",       planets:[],                     meaning:"Libra in 11th — goals tied to fairness, art and community. Seeks balance and beauty in group endeavors." },
  12: { name:"Hidden Depths",        sign:"Scorpio",     planets:[],                     meaning:"Scorpio in 12th — deep subconscious Scorpio energy. Hidden intensity and spiritual power behind your public Sagittarius mask." },
};

// ── Nakshatra (Vedic Lunar Mansion) ──────────────────────────────────────────
export const MOON_NAKSHATRA = {
  name: "Bharani",
  range: "Aries 13°20' – 26°40' (Vedic)",
  lord: "Venus",
  symbol: "Yoni (womb/vessel)",
  deity: "Yama (God of Death & Dharma)",
  quality: "Fierce (Ugra)",
  goal: "Artha (Material prosperity)",
  interpretation: "Bharani Nakshatra — the star of bearing burdens and transformation. Venus-ruled in Mars's sign. You carry great responsibility with grace. Intense competitive nature. Willingness to go where others fear. Athletic, driven, fiercely independent.",
};

// ── Vedic Summary ─────────────────────────────────────────────────────────────
export const VEDIC_SUMMARY = {
  lagna: "Scorpio (approximate)",
  sunRashi: "Simha (Leo)",
  moonRashi: "Mesha (Aries)",
  nakshatra: "Bharani (Aries)",
  yoga: "Budha-Aditya Yoga (Sun+Mercury conjunct) — sharp intellect, fame through skill",
  specialNotes: [
    "Exalted Moon (Aries) — emotional strength, warrior spirit, leadership instinct",
    "Sun in Leo (own sign in Vedic) — natural royalty, performer, born to lead",
    "Mercury in own sign Virgo — analytical genius, perfectionist communication",
    "Budha-Aditya Yoga — intelligence + fame combination",
    "Bharani Nakshatra Moon — intense, competitive, destined for transformation",
    "Rahu (2nd house) + Ketu (8th house) — material destiny, hidden karmic gifts",
  ],
};

// ── Current Transits (live calculation based on today) ───────────────────────
export function getTransitNote(planet: string, birthSign: string): string {
  const notes: Record<string, Record<string, string>> = {
    "Saturn": {
      "Virgo": "Saturn transiting Pisces (2023-2026) opposes your natal Virgo Sun/Saturn — major restructuring, responsibility tests, karmic clearing. Powerful growth period.",
      "default": "Saturn brings structure and tests to this area.",
    },
    "Jupiter": {
      "default": "Jupiter expands opportunities in the house it transits.",
    },
  };
  return notes[planet]?.[birthSign] ?? notes[planet]?.["default"] ?? "";
}

// ── Sun Sign Interpretations ─────────────────────────────────────────────────
export const VIRGO_SUN = {
  element: "Earth",
  modality: "Mutable",
  ruler: "Mercury",
  traits: ["Analytical","Precise","Perfectionist","Diligent","Health-conscious","Helpful","Critical","Organized"],
  strengths: "You see every detail others miss. Your mind works like a precision instrument — breaking down problems, optimizing systems, and executing with mastery.",
  shadows: "Self-criticism, overthinking, analysis paralysis. You must learn that done is better than perfect.",
  inSports: "In soccer/athletics, Virgo energy gives you extraordinary technical precision, footwork mastery, and the discipline to perfect every skill. You study opponents deeply.",
};

export const SAGITTARIUS_RISING = {
  appearance: "Tall or athletic build, bright energetic eyes, warm and adventurous demeanor. People feel your optimism immediately.",
  firstImpression: "Enthusiastic, free-spirited, philosophical. You walk in like you own the place — naturally.",
  lifeTheme: "The search for truth, freedom and expanded experience. You are a teacher and student simultaneously throughout life.",
  athleticsNote: "Sagittarius rules the hips and thighs — your winger speed and hip rotation are literally written in your chart.",
};

// ── Essential Dignities & Debilities ────────────────────────────────────────
export interface Dignity {
  planet: string;
  dignity: string;
  type: "Domicile" | "Exaltation" | "Detriment" | "Fall" | "Peregrine" | "Own Sign" | "Neutral";
  strength: number;
  note: string;
}

export const DIGNITIES: Dignity[] = [
  { planet:"Sun", dignity:"Peregrine", type:"Peregrine", strength:0, note:"Sun in Virgo is peregrine — no essential dignity. Relies on accidental dignity (10th house angularity gives +5 strength)." },
  { planet:"Moon", dignity:"Exalted (Vedic)", type:"Exaltation", strength:5, note:"Moon in Taurus is in exaltation (Western). In Vedic (Aries), Moon is also exalted. Double exaltation — extremely powerful emotional core." },
  { planet:"Mercury", dignity:"Domicile", type:"Domicile", strength:5, note:"Mercury in Virgo — domicile AND exaltation. The strongest Mercury possible. Analytical genius. Retrograde adds depth." },
  { planet:"Venus", dignity:"Peregrine", type:"Peregrine", strength:0, note:"Venus in Leo — peregrine. Venus prefers harmony; Leo demands attention. Creative flair but can be dramatic in love." },
  { planet:"Mars", dignity:"Fall", type:"Fall", strength:-4, note:"Mars in Cancer — in its fall. Emotional warrior. Action driven by feelings. Must channel through sports/creativity, not anger." },
  { planet:"Jupiter", dignity:"Detriment", type:"Detriment", strength:-5, note:"Jupiter in Aquarius — in ancient system, Jupiter is in detriment here. However, Jupiter-Neptune-Chiron triple conjunction overrides with spiritual power." },
  { planet:"Saturn", dignity:"Peregrine", type:"Peregrine", strength:0, note:"Saturn in Virgo — peregrine but gains accidental dignity from 10th house angularity (+5). Conjunct Sun gives authority." },
  { planet:"Uranus", dignity:"Neutral", type:"Neutral", strength:0, note:"Uranus in Pisces — outer planet, traditional dignities don't apply. Spiritual revolution in the subconscious." },
  { planet:"Neptune", dignity:"Neutral", type:"Neutral", strength:0, note:"Neptune in Aquarius — outer planet. Visionary, humanitarian dreams." },
  { planet:"Pluto", dignity:"Neutral", type:"Neutral", strength:0, note:"Pluto in Capricorn — generation planet. Transformation of structures and authority worldwide (2008-2024)." },
];

// ── Chart Rulers & Dispositors ──────────────────────────────────────────────
export const CHART_RULERS = {
  chartRuler: { planet:"Jupiter", sign:"Aquarius", house:3, note:"Sagittarius rising → Jupiter rules the chart. Jupiter in Aquarius 3rd house: your life purpose flows through communication, learning, and visionary ideas. Jupiter conjunct Neptune amplifies spiritual vision." },
  sunRuler: { planet:"Mercury", sign:"Virgo", house:10, note:"Sun in Virgo → Mercury rules your identity. Mercury Rx in Virgo 10th house: your ego/identity is expressed through analytical precision in career. Retrograde means you process internally first." },
  moonRuler: { planet:"Venus", sign:"Leo", house:9, note:"Moon in Taurus → Venus rules your emotions. Venus in Leo 9th: emotional fulfillment through travel, philosophy, creative performance, and foreign connections." },
  dispositorChain: "Jupiter (chart ruler) → Uranus (Aquarius ruler) → Neptune (Pisces ruler) → Jupiter. MUTUAL RECEPTION loop — Jupiter-Neptune-Uranus form a closed dispositor chain, amplifying spiritual and revolutionary energy endlessly.",
  finalDispositor: "Mercury in Virgo — Mercury is in its own sign, making it a FINAL DISPOSITOR. All planetary energy eventually channels through Mercury. Your mind is the ultimate processor of all life experience.",
};

// ── Aspect Patterns ─────────────────────────────────────────────────────────
export const ASPECT_PATTERNS = [
  { name:"Saturn-Uranus Opposition T-Square", planets:["Saturn","Uranus","Pluto"], type:"T-Square (wide)", interpretation:"Saturn in Virgo opposite Uranus in Pisces, both squaring Pluto in Capricorn (wide orb). Tension between order and chaos, with transformative power as the outlet. You are built to break old systems and build new ones." },
  { name:"Jupiter-Neptune-Chiron Triple Conjunction", planets:["Jupiter","Neptune","Chiron"], type:"Stellium/Conjunction", interpretation:"Three bodies within 7° in Aquarius 3rd house. The 2009 rare alignment. Spiritual genius, healing communication, visionary messaging. You carry this cosmic signature as a once-in-a-century stamp." },
  { name:"Sun-Saturn-Mercury Stellium", planets:["Sun","Saturn","Mercury"], type:"Stellium", interpretation:"Three personal planets in Virgo 10th house. Career-defining concentration. Authority, precision, and analytical power all focused on public achievement. Born for the spotlight through mastery." },
  { name:"Mars-Node Axis", planets:["Mars","North Node","South Node"], type:"Nodal Conjunction", interpretation:"Mars conjunct North Node in Capricorn 2nd house. Your destiny is activated through bold action, physical competition, and material achievement. South Node conjunct Mars = past life warrior returning to complete the mission." },
];

// ── Minor Aspects ───────────────────────────────────────────────────────────
export const MINOR_ASPECTS: Aspect[] = [
  { planet1:"Sun", planet2:"Moon", type:"Trine (Fire/Earth)", orb:"2°34'", nature:"minor", interpretation:"Sun trine Moon — inner harmony. Your conscious goals (Virgo precision) and emotional needs (Taurus stability) work together naturally. Emotional intelligence." },
  { planet1:"Venus", planet2:"Pluto", type:"Quincunx", orb:"8°30'", nature:"minor", interpretation:"Venus quincunx Pluto — adjustment between love/beauty and deep transformation. Relationships involve periodic intense recalibrations." },
  { planet1:"Mars", planet2:"Saturn", type:"Sextile", orb:"3°43'", nature:"minor", interpretation:"Mars sextile Saturn — disciplined action. Your drive (Mars) harmonizes with your structure (Saturn). Athletic endurance is natural." },
  { planet1:"Moon", planet2:"Jupiter", type:"Sextile", orb:"1°14'", nature:"minor", interpretation:"Moon sextile Jupiter — emotional generosity and optimism. You inspire others through your emotional warmth and philosophical outlook." },
  { planet1:"Sun", planet2:"Pluto", type:"Trine", orb:"15°01'", nature:"minor", interpretation:"Sun trine Pluto (wide) — subtle but present regenerative power. You recover from setbacks with deep inner strength." },
  { planet1:"Mercury", planet2:"Mars", type:"Sextile", orb:"0°09'", nature:"minor", interpretation:"Mercury sextile Mars — razor-sharp mental reflexes. Quick decision-making. Perfect for athletics where split-second thinking matters." },
  { planet1:"Venus", planet2:"Jupiter", type:"Quincunx", orb:"5°09'", nature:"minor", interpretation:"Venus quincunx Jupiter — creative abundance that needs channeling. Too many talents; must focus to avoid scattering." },
  { planet1:"Moon", planet2:"Neptune", type:"Sextile", orb:"5°56'", nature:"minor", interpretation:"Moon sextile Neptune — psychic sensitivity and imagination. Dreams are vivid and often prophetic. Trust your gut feelings." },
];

// ── Asteroids & Fixed Stars ─────────────────────────────────────────────────
export const ASTEROIDS = [
  { name:"Chiron", sign:"Aquarius", degree:"24°11'", house:3, interpretation:"The Wounded Healer in Aquarius 3rd — your wound is feeling different/alien. Your healing gift is innovative communication. Teaching others through your own unique perspective." },
  { name:"Juno", sign:"Virgo", degree:"~21°", house:10, interpretation:"Juno in Virgo 10th — your ideal committed partnership involves shared work ethic, precision, and public achievement together. Partner is likely detail-oriented." },
  { name:"Pallas Athena", sign:"Aquarius", degree:"~12°", house:3, interpretation:"Pallas in Aquarius 3rd — pattern recognition genius. You see systems and strategies others miss. Military/sports tactician energy." },
  { name:"Vesta", sign:"Cancer", degree:"~8°", house:8, interpretation:"Vesta in Cancer 8th — sacred devotion to emotional transformation. The sacred flame burns in your hidden depths. Deep commitment to inner work." },
  { name:"Ceres", sign:"Leo", degree:"~17°", house:9, interpretation:"Ceres in Leo 9th — nurturing through creative performance and philosophical teaching. You feed others' spirits through inspiration." },
  { name:"Lilith (Black Moon)", sign:"Capricorn", degree:"~18°", house:2, interpretation:"Black Moon Lilith in Capricorn 2nd — raw, unfiltered power around money and values. Refuses to conform to others' definitions of worth. Self-made wealth energy." },
];

export const FIXED_STARS = [
  { name:"Regulus", degree:"Leo 29°50' (2009)", conjunct:"Venus (orb 7°)", interpretation:"Regulus — the Heart of the Lion. Royal star of success. Near Venus, amplifies magnetic charisma and creative power. Military honors and fame." },
  { name:"Spica", degree:"Libra 23°50'", conjunct:"11th house cusp", interpretation:"Spica — the most benefic fixed star. Gifts, talents, and fortune. Near the 11th cusp, brings fortunate friendships and group associations." },
  { name:"Antares", degree:"Sagittarius 09°46'", conjunct:"Ascendant (orb 10°)", interpretation:"Antares — the Heart of the Scorpion. Intense, courageous, and competitive. Near the Ascendant, gives a fearless warrior presence." },
  { name:"Aldebaran", degree:"Gemini 09°47'", conjunct:"7th house (wide)", interpretation:"Aldebaran — the Eye of the Bull. Watcher of the East. Royal star of honor and integrity. Influences partnerships." },
  { name:"Fomalhaut", degree:"Pisces 03°52'", conjunct:"4th house area", interpretation:"Fomalhaut — the Royal Star of Autumn. Spiritual ideals manifested. Near IC, influences deep spiritual foundations and home life." },
];

// ── Midpoints ───────────────────────────────────────────────────────────────
export const MIDPOINTS = [
  { point:"Sun/Moon", degree:"Scorpio ~2°", meaning:"Your core integration point — where conscious will meets emotional need. In Scorpio: your deepest drive is for transformative power and psychological depth." },
  { point:"Venus/Mars", degree:"Leo ~25°", meaning:"Your love/desire axis. In Leo 9th: passionate, dramatic, and philosophical in matters of love and desire. Romance and athletics blend." },
  { point:"Jupiter/Saturn", degree:"Scorpio ~21°", meaning:"Your social integration — where expansion meets restriction. In Scorpio: success comes through deep transformation and strategic patience." },
  { point:"Mars/Jupiter", degree:"Sagittarius ~8°", meaning:"Your action-expansion axis. On the Ascendant! Your entire physical presence radiates confident, expansive energy. Born athlete." },
  { point:"Sun/Saturn", degree:"Virgo ~20°", meaning:"Your ambition axis. In Virgo 10th: career precision and disciplined authority are your defining life theme." },
  { point:"Mercury/Pluto", degree:"Scorpio ~15°", meaning:"Your mental power axis. Intense, penetrating, investigative mind. Sees through lies and deception instantly." },
  { point:"Moon/Saturn", degree:"Aquarius ~21°", meaning:"Your emotional discipline. In Aquarius 3rd: emotional maturity expressed through innovative communication." },
  { point:"Ascendant/MC", degree:"Aquarius ~17°", meaning:"Your life direction integration. In Aquarius conjunct Jupiter-Neptune: your public path and personal direction are unified through visionary humanitarian work." },
];

// ── Degree Analysis (Sabian Symbols) ────────────────────────────────────────
export const DEGREE_ANALYSIS = [
  { planet:"Sun", degree:"Virgo 16° (rounded)", sabian:"In the zoo, children are brought face to face with an orangutan.", interpretation:"Learning from nature and primal wisdom. Understanding the animal within. Athletic instinct meets analytical mind." },
  { planet:"Moon", degree:"Taurus 19° (rounded)", sabian:"A newly formed continent.", interpretation:"New emotional foundations being built. You are creating something that didn't exist before — a new emotional landscape." },
  { planet:"Ascendant", degree:"Sagittarius 20°", sabian:"In an old-fashioned northern village, men cut the ice of a frozen pond for use during the summer.", interpretation:"Strategic preparation. Planning ahead for future needs. Athletic training and discipline for future glory." },
  { planet:"MC", degree:"Virgo 15°", sabian:"A fine lace handkerchief, heirloom from valorous ancestors.", interpretation:"Heritage of excellence. You carry the skill and courage of your lineage. Precision craftsmanship in your career." },
  { planet:"Mercury Rx", degree:"Virgo 29° (anaretic)", sabian:"Totally intent upon completing an immediate task, a man is deaf to any allurement.", interpretation:"CRITICAL DEGREE — the 29th degree of any sign is the anaretic degree of urgency. Your mind is laser-focused when engaged. Nothing can distract you from the mission. This is your superpower AND your burden." },
  { planet:"Jupiter", degree:"Aquarius 17°", sabian:"A watchdog stands guard, protecting his master and his possessions.", interpretation:"Loyal guardian energy. Protecting your vision and those you love. Spiritual watchfulness." },
  { planet:"Saturn", degree:"Virgo 25°", sabian:"A flag at half-mast in front of a large public building.", interpretation:"Honoring what has passed to make way for new authority. Respectful transition of power. Public responsibility." },
];

// ── Secondary Progressions (age 16 → 2025-2026) ────────────────────────────
export const SECONDARY_PROGRESSIONS = {
  method: "One day = one year. Birth date Sept 8, 2009. Age 16 = Sept 24, 2009 positions.",
  progressedSun: { sign:"Libra", degree:"~1°", note:"Progressed Sun entered Libra around age 15. For the next 30 years, your conscious identity shifts toward partnership, balance, diplomacy, and aesthetic beauty. A major identity evolution from Virgo precision to Libra harmony." },
  progressedMoon: { sign:"Scorpio", degree:"~10° (approx 2025-2026)", note:"Progressed Moon in Scorpio — emotional intensity, transformation, and deep psychological processing. Lasts about 2.5 years. Powerful period for inner growth and letting go of old emotional patterns." },
  progressedMercury: { sign:"Libra", degree:"~3°", note:"Progressed Mercury moved direct and entered Libra. Communication style becoming more diplomatic, balanced, and partnership-oriented. Writing/speaking about fairness and beauty." },
  progressedVenus: { sign:"Virgo", degree:"~8°", note:"Progressed Venus in Virgo — love expressed through acts of service and practical care. Attracted to competence and intelligence in partners." },
  progressedMars: { sign:"Cancer", degree:"~29° (anaretic)", note:"Progressed Mars at the very end of Cancer — urgency in emotional action. About to enter Leo, which will dramatically increase confidence and creative drive." },
};

// ── Solar Return 2025-2026 ──────────────────────────────────────────────────
export const SOLAR_RETURN = {
  year: "2025-2026 (Sept 8, 2025 → Sept 7, 2026)",
  srSun: { sign:"Virgo", house:"Approximate 10th (varies by location)", note:"Solar Return Sun near natal position — reinforcing career and public life themes. This year amplifies your natal promise of public achievement." },
  srMoon: { sign:"Varies (calculate for exact time)", note:"The SR Moon sign sets the emotional tone for the year. In a career house = emotionally invested in work success." },
  themes: [
    "Saturn transiting Pisces opposing natal Sun/Saturn — major karmic tests in career and authority",
    "Jupiter entering Cancer (June 2025) — hitting natal Mars. Athletic breakthroughs and physical expansion",
    "Pluto in Aquarius transiting natal Jupiter-Neptune — generational awakening of your spiritual gifts",
    "North Node moving through Pisces — activating your 4th house. Home and family themes intensify",
  ],
  keyDates: [
    { date:"Sept 2025", event:"Solar Return activation. New year cycle begins. Set major intentions." },
    { date:"Oct-Nov 2025", event:"Mars activation period. Peak athletic performance window." },
    { date:"Jan 2026", event:"Saturn-Sun opposition exact. Major career test or responsibility milestone." },
    { date:"March 2026", event:"Eclipse season near your nodal axis. Fated events." },
    { date:"June 2026", event:"Jupiter enters Cancer — conjunct natal Mars. PEAK expansion of physical ability and drive." },
  ],
};

// ── Profections ─────────────────────────────────────────────────────────────
export const PROFECTIONS = {
  currentAge: 16,
  profectedHouse: 5,
  profectedSign: "Aries",
  lordOfYear: "Mars",
  interpretation: "At age 16, you are in a 5TH HOUSE PROFECTION YEAR. The 5th house rules creativity, sports, romance, children, and self-expression. Mars (lord of Aries, your 5th house Vedic sign) is the Time Lord — meaning Mars themes dominate: competition, athletics, physical drive, courage. This is YOUR year to COMPETE, CREATE, and SHINE on the field.",
  nextYears: [
    { age:17, house:6, sign:"Taurus", lord:"Venus", theme:"Health, daily routine, work habits, service. Focus on perfecting your training regimen." },
    { age:18, house:7, sign:"Gemini", lord:"Mercury", theme:"Relationships, partnerships, contracts. Important connections form. College/professional team partnerships." },
    { age:19, house:8, sign:"Cancer", lord:"Moon", theme:"Transformation, shared resources, intensity. Deep inner changes. Financial partnerships." },
    { age:20, house:9, sign:"Leo", lord:"Sun", theme:"Travel, higher learning, philosophy, expansion. International opportunities. College/pro journey." },
  ],
};

// ── Zodiacal Releasing ──────────────────────────────────────────────────────
export const ZODIACAL_RELEASING = {
  method: "Based on the Lot of Fortune and Lot of Spirit. Uses sign-based periods (Hellenistic technique).",
  lotOfFortune: { sign:"Taurus", degree:"~24°", note:"Lot of Fortune in Taurus — material prosperity comes through stable, patient building. Taurus rules your 6th house of daily work and health." },
  lotOfSpirit: { sign:"Scorpio", degree:"~16°", note:"Lot of Spirit in Scorpio — your career/action destiny flows through transformative, intense, strategic endeavors." },
  currentPeriod: {
    level1: "Taurus period (Lot of Fortune): Stable building phase. Material foundations being laid.",
    level2: "Sub-period analysis depends on exact Lot degrees. Generally in a productive, growth-oriented chapter.",
    peakPeriods: "When the releasing reaches angular signs (Aries/Cancer/Libra/Capricorn relative to Fortune), expect peak life events.",
  },
  interpretation: "Zodiacal Releasing from the Lot of Fortune shows you are in a productive building phase. The current sub-period emphasizes practical skill development and health optimization — perfect for athletic training. Peak periods (when releasing hits angular signs) will coincide with major life breakthroughs in career and competition.",
};

// ── Lunar Nodes & Karmic Axis ───────────────────────────────────────────────
export const LUNAR_NODES_DETAIL = {
  northNode: {
    sign: "Capricorn",
    house: 2,
    degree: "26°35'",
    meaning: "Your soul's DESTINY is to master material achievement, financial authority, and structured success. The 2nd house placement makes money, values, and self-worth your primary karmic lessons. You are meant to BUILD WEALTH and VALUE YOURSELF.",
    lessons: [
      "Learn to value yourself and your talents — don't give them away free",
      "Build financial literacy and material security",
      "Develop discipline and structure in earning/saving",
      "Master the physical, material world (don't escape into emotions)",
      "Become an authority figure others respect",
    ],
  },
  southNode: {
    sign: "Cancer",
    house: 8,
    degree: "26°35'",
    meaning: "Your PAST LIFE gifts come from emotional depth, intuition, family bonds, and hidden/occult knowledge. The 8th house placement means you've already mastered transformation, emotional intensity, and psychic sensitivity in past lives.",
    pastLifeGifts: [
      "Natural emotional intelligence and empathy",
      "Intuitive understanding of hidden dynamics",
      "Comfort with crisis and transformation",
      "Psychic sensitivity and gut instincts",
      "Ability to survive and regenerate from anything",
    ],
  },
  axis: "Cancer-Capricorn axis = the axis of SECURITY. Moving from emotional security (Cancer SN) to material/structural security (Capricorn NN). Your life journey: from feeling to building, from reacting to leading.",
  nodalReturn: "Your first Nodal Return occurs around age 18.5 (approximately March 2028). This is a MAJOR karmic milestone — destiny events accelerate, life-defining choices emerge.",
};

// ── Locational Astrology ────────────────────────────────────────────────────
export const LOCATIONAL_ASTROLOGY = {
  method: "Astrocartography maps planetary lines across the globe to find optimal locations.",
  birthLocation: { city:"Chicago, IL", coords:"41.88°N, 87.63°W", note:"Birth location sets your baseline chart. Chicago's energy supports your Virgo-Sagittarius axis — hardworking yet adventurous." },
  powerLines: [
    { planet:"Sun/MC", regions:["Mexico City","Lima","Buenos Aires"], note:"Sun on the Midheaven line — places where you'll achieve maximum public recognition and career success. Latin America is strongly activated." },
    { planet:"Jupiter/AC", regions:["London","Paris","Barcelona","Madrid"], note:"Jupiter on the Ascendant line — places where you appear larger than life, fortunate, and expansive. European soccer capitals!" },
    { planet:"Venus/DC", regions:["Tokyo","Seoul","Manila"], note:"Venus on the Descendant line — places where love and creative partnerships thrive. East Asian cities are Venus-activated." },
    { planet:"Mars/IC", regions:["Rio de Janeiro","São Paulo"], note:"Mars on the IC line — places where your competitive drive is deeply rooted. Brazilian soccer energy!" },
    { planet:"Saturn/MC", regions:["New York","Washington DC"], note:"Saturn on the MC — places where authority and career discipline are maximized. Hard work but lasting achievement." },
    { planet:"Moon/AC", regions:["Dubai","Mumbai","Delhi"], note:"Moon on the Ascendant — places where your emotional nature shines and you feel deeply at home." },
  ],
  bestFor: {
    soccer: ["Mexico City — Sun/MC (fame)","Barcelona — Jupiter/AC (expansion)","London — Jupiter/AC (fortune)","São Paulo — Mars/IC (drive)"],
    career: ["New York — Saturn/MC (authority)","London — Jupiter/AC (growth)","Mexico City — Sun/MC (recognition)"],
    love: ["Tokyo — Venus/DC","Barcelona — Jupiter/AC","Paris — Jupiter/AC"],
    spiritual: ["Varanasi — Neptune/IC","Sedona — Pluto/AC","Cusco — Uranus/MC"],
  },
};

// ── Draconic Chart ──────────────────────────────────────────────────────────
export const DRACONIC_CHART = {
  method: "Draconic chart = natal chart rotated so North Node = 0° Aries. Reveals your soul's pre-incarnation blueprint.",
  adjustment: "North Node at Capricorn 26°35'. Subtract 296°35' (or add 63°25') from all positions.",
  planets: [
    { name:"Sun (Draconic)", sign:"Aries", degree:"~19°", note:"Draconic Sun in Aries — your soul CHOSE to incarnate as a warrior, pioneer, and independent leader. At the deepest level, you are Aries energy: first, fastest, fearless." },
    { name:"Moon (Draconic)", sign:"Leo", degree:"~21°", note:"Draconic Moon in Leo — your soul's emotional template is royal, creative, and dramatically expressive. Born to perform and be seen." },
    { name:"Mercury (Draconic)", sign:"Aries", degree:"~2°", note:"Draconic Mercury in Aries — your soul thinks in terms of action, initiative, and speed. Quick-fire mental energy." },
    { name:"Venus (Draconic)", sign:"Scorpio", degree:"~25°", note:"Draconic Venus in Scorpio — your soul craves deep, transformative love. Nothing superficial will satisfy." },
    { name:"Mars (Draconic)", sign:"Libra", degree:"~2°", note:"Draconic Mars in Libra — your soul's action principle involves balance, partnership, and fairness in competition." },
    { name:"Jupiter (Draconic)", sign:"Taurus", degree:"~20°", note:"Draconic Jupiter in Taurus — your soul expands through material mastery and sensory experience." },
    { name:"Ascendant (Draconic)", sign:"Aries", degree:"~23°", note:"Draconic Ascendant in Aries — confirms: your soul's very FIRST instinct is to lead, act, and pioneer." },
  ],
  interpretation: "Your Draconic chart reveals your soul's pre-birth intention. With Sun, Mercury, AND Ascendant all in Aries, your soul SPECIFICALLY CHOSE to be a warrior-leader in this lifetime. The Mars-in-Libra suggests you chose to learn fairness in competition — winning with honor. This is deeply aligned with your athletic destiny.",
};

// ── Divisional Charts (Vedic) ───────────────────────────────────────────────
export const DIVISIONAL_CHARTS = {
  D1: {
    name: "Rashi (Birth Chart)",
    purpose: "Overall life direction",
    key: "Scorpio Lagna, Sun in Simha (own sign), Moon in Mesha (exalted). Already detailed in Vedic summary.",
  },
  D9: {
    name: "Navamsha (D9)",
    purpose: "Marriage, dharma, spiritual purpose, and the 'fruit' of planets",
    key: "The D9 chart shows the deeper expression of your planets. For Cristian: Mercury in own sign in D9 confirms communication mastery. Venus in a water sign D9 deepens emotional connections in relationships. Mars in a fire sign D9 amplifies athletic prowess.",
    interpretation: "Your D9 chart strengthens Mercury (communication genius confirmed at dharmic level), maintains Mars fire (athletic destiny is dharmic — your SOUL PURPOSE), and deepens Moon's emotional intelligence. Your navamsha confirms: the athletic-analytical life is your dharmic path, not just a career choice.",
  },
  D10: {
    name: "Dashamsha (D10)",
    purpose: "Career and professional life specifically",
    key: "D10 chart for career analysis shows concentration of planets in action/leadership signs. Sun and Saturn's 10th house presence in D1 is amplified in D10, confirming: you are MEANT for public career achievement. Athletic career is strongly supported.",
    interpretation: "Your D10 confirms professional success, especially in fields requiring discipline (Saturn), physical action (Mars), and public performance. Soccer/athletics is the ideal career expression. Business ventures later in life are also strongly supported by Saturn-Sun conjunction energy in the career divisional.",
  },
};

// ── Vimshottari Dasha System ────────────────────────────────────────────────
export const DASHAS = {
  method: "Vimshottari Dasha: 120-year cycle based on Moon's Nakshatra at birth. Moon in Bharani → Venus dasha at birth.",
  birthNakshatra: "Bharani (Venus-ruled)",
  sequence: [
    { planet:"Venus", years:20, from:"2009", to:"2029", current:true, note:"Venus Mahadasha (2009-2029) — the ENTIRE first phase of your life is ruled by Venus. Creativity, beauty, love, luxury, and artistic expression dominate. In Bharani, Venus gives intense creative-competitive drive. This is your foundation period." },
    { planet:"Sun", years:6, from:"2029", to:"2035", current:false, note:"Sun Mahadasha (2029-2035) — ages 20-26. Peak career establishment. Sun conjunct Saturn activates fully. Authority, fame, and public recognition. This will be your professional breakout period." },
    { planet:"Moon", years:10, from:"2035", to:"2045", current:false, note:"Moon Mahadasha (2035-2045) — ages 26-36. Emotional fulfillment, family formation, popularity. Exalted Moon gives exceptional results. Peak emotional intelligence and public love." },
    { planet:"Mars", years:7, from:"2045", to:"2052", current:false, note:"Mars Mahadasha (2045-2052) — ages 36-43. Action, competition, property, and leadership. Mars on North Node fully activates your destiny." },
    { planet:"Rahu", years:18, from:"2052", to:"2070", current:false, note:"Rahu Mahadasha (2052-2070) — ages 43-61. Material expansion, foreign connections, unconventional success. Rahu in 2nd house = major wealth accumulation." },
  ],
  currentSubPeriod: {
    major: "Venus",
    sub: "Jupiter (approximate 2024-2027)",
    note: "Venus-Jupiter period — the most fortunate sub-period within Venus dasha. Jupiter conjunct Neptune in birth chart amplifies spiritual blessings, educational opportunities, and philosophical growth. This is a GOLDEN PERIOD for learning, traveling, and expanding your horizons.",
  },
};

// ── Yogas (Vedic Combinations) ──────────────────────────────────────────────
export const YOGAS = [
  { name:"Budha-Aditya Yoga", planets:["Sun","Mercury"], type:"Dhana/Raja", interpretation:"Sun-Mercury conjunction in the 10th house (Vedic). Gives sharp intellect, fame through skill, and recognition from authorities. One of the most favorable yogas for career success." },
  { name:"Gaja Kesari Yoga", planets:["Moon","Jupiter"], type:"Raja", interpretation:"Moon in angle from Jupiter (sextile from 5th to 3rd). Gives fame, fortune, and leadership ability. The 'Elephant-Lion' yoga — power combined with wisdom." },
  { name:"Chandra Mangal Yoga", planets:["Moon","Mars"], type:"Dhana", interpretation:"Moon and Mars in mutual aspect. Gives financial prosperity through bold action. Emotional courage fuels material success. Athletic wealth is strongly indicated." },
  { name:"Shasha Yoga", planets:["Saturn"], type:"Pancha Mahapurusha", interpretation:"Saturn in own/exalted sign in kendra (angular house). In your chart, Saturn occupies the 10th house (a kendra). Gives authority, discipline, and lasting career success. People respect you naturally." },
  { name:"Viparita Raja Yoga", planets:["Mars","Ketu"], type:"Raja", interpretation:"Lord of 6th/8th/12th in another dusthana (difficult house). Mars (6th lord) in 8th house. Turns obstacles into strengths. You thrive under pressure and competition." },
  { name:"Neecha Bhanga Raja Yoga", planets:["Mars"], type:"Raja", interpretation:"Mars is debilitated in Cancer BUT aspects from Moon (Cancer's lord) cancel the debilitation. Fallen warrior rises — your competitive weakness becomes your greatest weapon through emotional intelligence." },
  { name:"Dharma Karmadhipati Yoga", planets:["Sun","Saturn"], type:"Raja", interpretation:"9th and 10th lords in mutual connection. Dharma (duty) and Karma (action) aligned. Your spiritual purpose and career are ONE. Everything you do professionally is also your sacred duty." },
  { name:"Saraswati Yoga", planets:["Jupiter","Venus","Mercury"], type:"Education", interpretation:"Jupiter, Venus, and Mercury well-placed gives mastery of knowledge, arts, and communication. The Goddess of Learning blesses your intellectual and creative pursuits." },
];

// ── Remedial Measures ───────────────────────────────────────────────────────
export const REMEDIAL_MEASURES = {
  forMarsInFall: {
    issue: "Mars debilitated in Cancer — emotional volatility in competition",
    remedies: [
      "Wear a red coral (Moonga) on the ring finger of right hand on Tuesday",
      "Chant Mars mantra: 'Om Angarakaya Namaha' 108 times on Tuesdays",
      "Physical exercise early morning — channel Mars energy before it becomes anger",
      "Donate red lentils (masoor dal) on Tuesdays",
      "Feed jaggery and wheat to monkeys on Tuesdays",
    ],
  },
  forSaturnConjunctSun: {
    issue: "Saturn conjunct Sun — can suppress vitality and confidence",
    remedies: [
      "Offer water to the Sun every morning at sunrise (Surya Arghya)",
      "Chant Saturn mantra: 'Om Shanaischaraya Namaha' on Saturdays",
      "Serve elderly people, especially father figures",
      "Wear dark blue sapphire (Neelam) ONLY after proper consultation",
      "Practice discipline and patience — Saturn rewards effort over time",
    ],
  },
  forMercuryRetrograde: {
    issue: "Mercury Rx — communication reversals, overthinking",
    remedies: [
      "Wear emerald (Panna) on the little finger on Wednesday",
      "Chant Mercury mantra: 'Om Budhaya Namaha' on Wednesdays",
      "Write in a journal daily — Mercury Rx processes internally",
      "Avoid signing important documents during Mercury retrograde transits",
      "Feed green moong dal to birds on Wednesdays",
    ],
  },
  forJupiterInDetriment: {
    issue: "Jupiter in detriment (Aquarius) — wisdom may be unconventional",
    remedies: [
      "Wear yellow sapphire (Pukhraj) on the index finger on Thursday",
      "Chant Jupiter mantra: 'Om Gurave Namaha' on Thursdays",
      "Respect teachers and mentors — Jupiter rewards humility",
      "Donate yellow items (turmeric, gold, yellow cloth) on Thursdays",
      "Study philosophy and spiritual texts regularly",
    ],
  },
  generalStrengthening: [
    "Meditate 15 minutes daily at sunrise — aligns solar and Saturnian energies",
    "Maintain a strict training schedule — Saturn conjunct Sun rewards discipline above all",
    "Practice gratitude journaling — counteracts Saturn's tendency toward pessimism",
    "Spend time near water — calms Mars in Cancer and Neptune/Jupiter in Aquarius",
    "Wear your lucky number (10 → 1) and colors (gold, royal blue) intentionally",
  ],
};
