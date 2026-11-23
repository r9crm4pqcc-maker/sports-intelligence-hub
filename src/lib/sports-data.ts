// ShemUniverse SportsCode — comprehensive franchise / city / stadium dataset.
// Dates are best-effort consensus from Wikipedia and franchise records.
// All entries can be overridden by editing this file directly.

export type DateTuple = [year: number, month: number, day: number];

export interface TeamMeta {
  founded: DateTuple;          // franchise founding date
  city: string;
  cityFounded: DateTuple;      // city incorporation date
  stadium: string;
  stadiumOpened: DateTuple;    // stadium opening date
}

// ─── MLB (30) ──────────────────────────────────────────────────────────────
const MLB: Record<string, TeamMeta> = {
  "Arizona Diamondbacks":  { founded: [1995, 3, 9],  city: "Phoenix",         cityFounded: [1881, 2, 25], stadium: "Chase Field",                stadiumOpened: [1998, 3, 31] },
  "Atlanta Braves":        { founded: [1966, 4, 12], city: "Atlanta",         cityFounded: [1847, 12, 29],stadium: "Truist Park",                stadiumOpened: [2017, 3, 31] },
  "Baltimore Orioles":     { founded: [1954, 4, 13], city: "Baltimore",       cityFounded: [1729, 7, 30], stadium: "Oriole Park at Camden Yards",stadiumOpened: [1992, 4, 6] },
  "Boston Red Sox":        { founded: [1907, 12, 18],city: "Boston",          cityFounded: [1630, 9, 7],  stadium: "Fenway Park",                stadiumOpened: [1912, 4, 20] },
  "Chicago Cubs":          { founded: [1876, 2, 2],  city: "Chicago",         cityFounded: [1837, 3, 4],  stadium: "Wrigley Field",              stadiumOpened: [1914, 4, 23] },
  "Chicago White Sox":     { founded: [1901, 4, 24], city: "Chicago",         cityFounded: [1837, 3, 4],  stadium: "Guaranteed Rate Field",      stadiumOpened: [1991, 4, 18] },
  "Cincinnati Reds":       { founded: [1882, 5, 2],  city: "Cincinnati",      cityFounded: [1819, 3, 1],  stadium: "Great American Ball Park",   stadiumOpened: [2003, 3, 31] },
  "Cleveland Guardians":   { founded: [2021, 11, 19],city: "Cleveland",       cityFounded: [1836, 3, 5],  stadium: "Progressive Field",          stadiumOpened: [1994, 4, 4] },
  "Colorado Rockies":      { founded: [1993, 4, 9],  city: "Denver",          cityFounded: [1861, 11, 7], stadium: "Coors Field",                stadiumOpened: [1995, 4, 26] },
  "Detroit Tigers":        { founded: [1901, 4, 25], city: "Detroit",         cityFounded: [1815, 9, 13], stadium: "Comerica Park",              stadiumOpened: [2000, 4, 11] },
  "Houston Astros":        { founded: [1964, 12, 1], city: "Houston",         cityFounded: [1837, 6, 5],  stadium: "Daikin Park",                stadiumOpened: [2000, 3, 30] },
  "Kansas City Royals":    { founded: [1968, 1, 11], city: "Kansas City",     cityFounded: [1850, 6, 1],  stadium: "Kauffman Stadium",           stadiumOpened: [1973, 4, 10] },
  "Los Angeles Angels":    { founded: [1965, 9, 2],  city: "Anaheim",         cityFounded: [1876, 3, 18], stadium: "Angel Stadium",              stadiumOpened: [1966, 4, 9] },
  "Los Angeles Dodgers":   { founded: [1957, 10, 8], city: "Los Angeles",     cityFounded: [1850, 4, 4],  stadium: "Dodger Stadium",             stadiumOpened: [1962, 4, 10] },
  "Miami Marlins":         { founded: [2011, 11, 11],city: "Miami",           cityFounded: [1896, 7, 28], stadium: "loanDepot park",             stadiumOpened: [2012, 4, 4] },
  "Milwaukee Brewers":     { founded: [1970, 3, 31], city: "Milwaukee",       cityFounded: [1846, 1, 31], stadium: "American Family Field",      stadiumOpened: [2001, 4, 6] },
  "Minnesota Twins":       { founded: [1961, 4, 11], city: "Minneapolis",     cityFounded: [1867, 2, 13], stadium: "Target Field",               stadiumOpened: [2010, 4, 12] },
  "New York Mets":         { founded: [1961, 5, 8],  city: "New York",        cityFounded: [1624, 1, 1],  stadium: "Citi Field",                 stadiumOpened: [2009, 4, 13] },
  "New York Yankees":      { founded: [1903, 3, 12], city: "New York",        cityFounded: [1624, 1, 1],  stadium: "Yankee Stadium",             stadiumOpened: [2009, 4, 16] },
  "Oakland Athletics":     { founded: [1901, 4, 26], city: "Oakland",         cityFounded: [1852, 5, 4],  stadium: "Sutter Health Park",         stadiumOpened: [2000, 5, 15] },
  "Philadelphia Phillies": { founded: [1883, 5, 1],  city: "Philadelphia",    cityFounded: [1701, 10, 25],stadium: "Citizens Bank Park",         stadiumOpened: [2004, 4, 12] },
  "Pittsburgh Pirates":    { founded: [1887, 4, 30], city: "Pittsburgh",      cityFounded: [1816, 3, 18], stadium: "PNC Park",                   stadiumOpened: [2001, 3, 31] },
  "San Diego Padres":      { founded: [1968, 5, 27], city: "San Diego",       cityFounded: [1850, 3, 27], stadium: "Petco Park",                 stadiumOpened: [2004, 4, 8] },
  "San Francisco Giants":  { founded: [1958, 4, 15], city: "San Francisco",   cityFounded: [1850, 4, 15], stadium: "Oracle Park",                stadiumOpened: [2000, 4, 11] },
  "Seattle Mariners":      { founded: [1977, 4, 6],  city: "Seattle",         cityFounded: [1869, 12, 2], stadium: "T-Mobile Park",              stadiumOpened: [1999, 7, 15] },
  "St. Louis Cardinals":   { founded: [1882, 5, 2],  city: "St. Louis",       cityFounded: [1822, 12, 9], stadium: "Busch Stadium",              stadiumOpened: [2006, 4, 10] },
  "Tampa Bay Rays":        { founded: [2007, 11, 8], city: "St. Petersburg",  cityFounded: [1892, 2, 29], stadium: "Tropicana Field",            stadiumOpened: [1990, 3, 3] },
  "Texas Rangers":         { founded: [1971, 9, 21], city: "Arlington",       cityFounded: [1876, 4, 19], stadium: "Globe Life Field",           stadiumOpened: [2020, 7, 24] },
  "Toronto Blue Jays":     { founded: [1976, 8, 12], city: "Toronto",         cityFounded: [1834, 3, 6],  stadium: "Rogers Centre",              stadiumOpened: [1989, 6, 3] },
  "Washington Nationals":  { founded: [2004, 9, 29], city: "Washington",      cityFounded: [1790, 7, 16], stadium: "Nationals Park",             stadiumOpened: [2008, 3, 30] },
};

// ─── NBA (30) ──────────────────────────────────────────────────────────────
const NBA: Record<string, TeamMeta> = {
  "Atlanta Hawks":          { founded: [1968, 5, 3], city: "Atlanta",        cityFounded: [1847, 12, 29], stadium: "State Farm Arena",     stadiumOpened: [1999, 9, 18] },
  "Boston Celtics":         { founded: [1946, 6, 6], city: "Boston",         cityFounded: [1630, 9, 7],   stadium: "TD Garden",            stadiumOpened: [1995, 9, 30] },
  "Brooklyn Nets":          { founded: [2012, 4, 30],city: "New York",       cityFounded: [1624, 1, 1],   stadium: "Barclays Center",      stadiumOpened: [2012, 9, 21] },
  "Charlotte Hornets":      { founded: [2014, 5, 20],city: "Charlotte",      cityFounded: [1768, 11, 7],  stadium: "Spectrum Center",      stadiumOpened: [2005, 10, 21] },
  "Chicago Bulls":          { founded: [1966, 1, 16],city: "Chicago",        cityFounded: [1837, 3, 4],   stadium: "United Center",        stadiumOpened: [1994, 8, 18] },
  "Cleveland Cavaliers":    { founded: [1970, 6, 22],city: "Cleveland",      cityFounded: [1836, 3, 5],   stadium: "Rocket Arena",         stadiumOpened: [1994, 10, 17] },
  "Dallas Mavericks":       { founded: [1980, 5, 1], city: "Dallas",         cityFounded: [1856, 2, 2],   stadium: "American Airlines Center", stadiumOpened: [2001, 7, 17] },
  "Denver Nuggets":         { founded: [1967, 6, 14],city: "Denver",         cityFounded: [1861, 11, 7],  stadium: "Ball Arena",           stadiumOpened: [1999, 10, 1] },
  "Detroit Pistons":        { founded: [1941, 6, 22],city: "Detroit",        cityFounded: [1815, 9, 13],  stadium: "Little Caesars Arena", stadiumOpened: [2017, 9, 5] },
  "Golden State Warriors":  { founded: [1971, 7, 17],city: "San Francisco",  cityFounded: [1850, 4, 15],  stadium: "Chase Center",         stadiumOpened: [2019, 9, 6] },
  "Houston Rockets":        { founded: [1967, 1, 11],city: "Houston",        cityFounded: [1837, 6, 5],   stadium: "Toyota Center",        stadiumOpened: [2003, 10, 6] },
  "Indiana Pacers":         { founded: [1967, 2, 2], city: "Indianapolis",   cityFounded: [1847, 3, 30],  stadium: "Gainbridge Fieldhouse",stadiumOpened: [1999, 11, 6] },
  "LA Clippers":            { founded: [1984, 5, 16],city: "Inglewood",      cityFounded: [1908, 2, 14],  stadium: "Intuit Dome",          stadiumOpened: [2024, 8, 15] },
  "Los Angeles Lakers":     { founded: [1947, 11, 1],city: "Los Angeles",    cityFounded: [1850, 4, 4],   stadium: "Crypto.com Arena",     stadiumOpened: [1999, 10, 17] },
  "Memphis Grizzlies":      { founded: [2001, 3, 26],city: "Memphis",        cityFounded: [1826, 12, 19], stadium: "FedExForum",           stadiumOpened: [2004, 9, 6] },
  "Miami Heat":             { founded: [1988, 12, 1],city: "Miami",          cityFounded: [1896, 7, 28],  stadium: "Kaseya Center",        stadiumOpened: [1999, 12, 31] },
  "Milwaukee Bucks":        { founded: [1968, 1, 22],city: "Milwaukee",      cityFounded: [1846, 1, 31],  stadium: "Fiserv Forum",         stadiumOpened: [2018, 8, 26] },
  "Minnesota Timberwolves": { founded: [1989, 11, 3],city: "Minneapolis",    cityFounded: [1867, 2, 13],  stadium: "Target Center",        stadiumOpened: [1990, 10, 13] },
  "New Orleans Pelicans":   { founded: [2013, 4, 18],city: "New Orleans",    cityFounded: [1718, 5, 7],   stadium: "Smoothie King Center", stadiumOpened: [1999, 10, 19] },
  "New York Knicks":        { founded: [1946, 6, 6], city: "New York",       cityFounded: [1624, 1, 1],   stadium: "Madison Square Garden",stadiumOpened: [1968, 2, 11] },
  "Oklahoma City Thunder":  { founded: [2008, 9, 3], city: "Oklahoma City",  cityFounded: [1890, 7, 15],  stadium: "Paycom Center",        stadiumOpened: [2002, 6, 8] },
  "Orlando Magic":          { founded: [1989, 6, 15],city: "Orlando",        cityFounded: [1875, 7, 31],  stadium: "Kia Center",           stadiumOpened: [2010, 10, 1] },
  "Philadelphia 76ers":     { founded: [1946, 5, 14],city: "Philadelphia",   cityFounded: [1701, 10, 25], stadium: "Wells Fargo Center",   stadiumOpened: [1996, 8, 31] },
  "Phoenix Suns":           { founded: [1968, 1, 22],city: "Phoenix",        cityFounded: [1881, 2, 25],  stadium: "PHX Arena",            stadiumOpened: [1992, 6, 6] },
  "Portland Trail Blazers": { founded: [1970, 2, 6], city: "Portland",       cityFounded: [1851, 2, 8],   stadium: "Moda Center",          stadiumOpened: [1995, 10, 12] },
  "Sacramento Kings":       { founded: [1985, 10, 25],city: "Sacramento",     cityFounded: [1850, 2, 27],  stadium: "Golden 1 Center",      stadiumOpened: [2016, 10, 4] },
  "San Antonio Spurs":      { founded: [1973, 4, 9], city: "San Antonio",    cityFounded: [1837, 6, 5],   stadium: "Frost Bank Center",    stadiumOpened: [2002, 10, 18] },
  "Toronto Raptors":        { founded: [1995, 5, 5], city: "Toronto",        cityFounded: [1834, 3, 6],   stadium: "Scotiabank Arena",     stadiumOpened: [1999, 2, 19] },
  "Utah Jazz":              { founded: [1974, 6, 7], city: "Salt Lake City", cityFounded: [1851, 1, 19],  stadium: "Delta Center",         stadiumOpened: [1991, 10, 4] },
  "Washington Wizards":     { founded: [1997, 12, 2],city: "Washington",     cityFounded: [1790, 7, 16],  stadium: "Capital One Arena",    stadiumOpened: [1997, 12, 2] },
};

// ─── NFL (32) ──────────────────────────────────────────────────────────────
const NFL: Record<string, TeamMeta> = {
  "Arizona Cardinals":     { founded: [1898, 7, 9],  city: "Glendale",         cityFounded: [1910, 6, 18], stadium: "State Farm Stadium",   stadiumOpened: [2006, 8, 1] },
  "Atlanta Falcons":       { founded: [1965, 6, 30], city: "Atlanta",          cityFounded: [1847, 12, 29],stadium: "Mercedes-Benz Stadium",stadiumOpened: [2017, 8, 26] },
  "Baltimore Ravens":      { founded: [1996, 2, 9],  city: "Baltimore",        cityFounded: [1729, 7, 30], stadium: "M&T Bank Stadium",     stadiumOpened: [1998, 9, 6] },
  "Buffalo Bills":         { founded: [1959, 10, 28],city: "Orchard Park",     cityFounded: [1850, 1, 1],  stadium: "Highmark Stadium",     stadiumOpened: [1973, 8, 17] },
  "Carolina Panthers":     { founded: [1993, 10, 26],city: "Charlotte",        cityFounded: [1768, 11, 7], stadium: "Bank of America Stadium",stadiumOpened: [1996, 9, 14] },
  "Chicago Bears":         { founded: [1920, 9, 17], city: "Chicago",          cityFounded: [1837, 3, 4],  stadium: "Soldier Field",        stadiumOpened: [1924, 10, 9] },
  "Cincinnati Bengals":    { founded: [1967, 5, 23], city: "Cincinnati",       cityFounded: [1819, 3, 1],  stadium: "Paycor Stadium",       stadiumOpened: [2000, 8, 19] },
  "Cleveland Browns":      { founded: [1944, 6, 4],  city: "Cleveland",        cityFounded: [1836, 3, 5],  stadium: "Huntington Bank Field",stadiumOpened: [1999, 9, 12] },
  "Dallas Cowboys":        { founded: [1960, 1, 28], city: "Arlington",        cityFounded: [1876, 4, 19], stadium: "AT&T Stadium",         stadiumOpened: [2009, 5, 27] },
  "Denver Broncos":        { founded: [1959, 8, 14], city: "Denver",           cityFounded: [1861, 11, 7], stadium: "Empower Field at Mile High",stadiumOpened: [2001, 9, 10] },
  "Detroit Lions":         { founded: [1930, 7, 12], city: "Detroit",          cityFounded: [1815, 9, 13], stadium: "Ford Field",           stadiumOpened: [2002, 8, 24] },
  "Green Bay Packers":     { founded: [1921, 8, 27], city: "Green Bay",        cityFounded: [1838, 1, 1],  stadium: "Lambeau Field",        stadiumOpened: [1957, 9, 29] },
  "Houston Texans":        { founded: [1999, 10, 6], city: "Houston",          cityFounded: [1837, 6, 5],  stadium: "NRG Stadium",          stadiumOpened: [2002, 8, 24] },
  "Indianapolis Colts":    { founded: [1953, 1, 23], city: "Indianapolis",     cityFounded: [1847, 3, 30], stadium: "Lucas Oil Stadium",    stadiumOpened: [2008, 8, 16] },
  "Jacksonville Jaguars":  { founded: [1993, 11, 30],city: "Jacksonville",     cityFounded: [1832, 2, 9],  stadium: "EverBank Stadium",     stadiumOpened: [1995, 8, 18] },
  "Kansas City Chiefs":    { founded: [1959, 8, 14], city: "Kansas City",      cityFounded: [1850, 6, 1],  stadium: "GEHA Field at Arrowhead Stadium",stadiumOpened: [1972, 8, 12] },
  "Las Vegas Raiders":     { founded: [1960, 1, 30], city: "Paradise",         cityFounded: [1950, 1, 1],  stadium: "Allegiant Stadium",    stadiumOpened: [2020, 7, 31] },
  "Los Angeles Chargers":  { founded: [1959, 8, 14], city: "Inglewood",        cityFounded: [1908, 2, 14], stadium: "SoFi Stadium",         stadiumOpened: [2020, 9, 8] },
  "Los Angeles Rams":      { founded: [1937, 2, 12], city: "Inglewood",        cityFounded: [1908, 2, 14], stadium: "SoFi Stadium",         stadiumOpened: [2020, 9, 8] },
  "Miami Dolphins":        { founded: [1965, 8, 16], city: "Miami Gardens",    cityFounded: [2003, 5, 13], stadium: "Hard Rock Stadium",    stadiumOpened: [1987, 8, 16] },
  "Minnesota Vikings":     { founded: [1960, 1, 28], city: "Minneapolis",      cityFounded: [1867, 2, 13], stadium: "U.S. Bank Stadium",    stadiumOpened: [2016, 7, 22] },
  "New England Patriots":  { founded: [1959, 11, 22],city: "Foxborough",       cityFounded: [1778, 6, 10], stadium: "Gillette Stadium",     stadiumOpened: [2002, 9, 9] },
  "New Orleans Saints":    { founded: [1966, 11, 1], city: "New Orleans",      cityFounded: [1718, 5, 7],  stadium: "Caesars Superdome",    stadiumOpened: [1975, 8, 3] },
  "New York Giants":       { founded: [1925, 8, 1],  city: "East Rutherford",  cityFounded: [1894, 3, 28], stadium: "MetLife Stadium",      stadiumOpened: [2010, 4, 10] },
  "New York Jets":         { founded: [1959, 8, 14], city: "East Rutherford",  cityFounded: [1894, 3, 28], stadium: "MetLife Stadium",      stadiumOpened: [2010, 4, 10] },
  "Philadelphia Eagles":   { founded: [1933, 7, 8],  city: "Philadelphia",     cityFounded: [1701, 10, 25],stadium: "Lincoln Financial Field",stadiumOpened: [2003, 8, 3] },
  "Pittsburgh Steelers":   { founded: [1933, 7, 8],  city: "Pittsburgh",       cityFounded: [1816, 3, 18], stadium: "Acrisure Stadium",     stadiumOpened: [2001, 8, 25] },
  "San Francisco 49ers":   { founded: [1944, 6, 4],  city: "Santa Clara",      cityFounded: [1852, 7, 5],  stadium: "Levi's Stadium",       stadiumOpened: [2014, 7, 17] },
  "Seattle Seahawks":      { founded: [1974, 6, 4],  city: "Seattle",          cityFounded: [1869, 12, 2], stadium: "Lumen Field",          stadiumOpened: [2002, 7, 28] },
  "Tampa Bay Buccaneers":  { founded: [1974, 4, 24], city: "Tampa",            cityFounded: [1849, 1, 18], stadium: "Raymond James Stadium",stadiumOpened: [1998, 9, 20] },
  "Tennessee Titans":      { founded: [1959, 8, 14], city: "Nashville",        cityFounded: [1806, 12, 24],stadium: "Nissan Stadium",       stadiumOpened: [1999, 8, 27] },
  "Washington Commanders": { founded: [1932, 7, 9],  city: "Landover",         cityFounded: [1973, 1, 1],  stadium: "Northwest Stadium",    stadiumOpened: [1997, 9, 14] },
};

// ─── NHL (32) ──────────────────────────────────────────────────────────────
const NHL: Record<string, TeamMeta> = {
  "Anaheim Ducks":           { founded: [1992, 12, 10],city: "Anaheim",        cityFounded: [1876, 3, 18], stadium: "Honda Center",        stadiumOpened: [1993, 6, 17] },
  "Boston Bruins":           { founded: [1924, 11, 1],city: "Boston",         cityFounded: [1630, 9, 7],  stadium: "TD Garden",           stadiumOpened: [1995, 9, 30] },
  "Buffalo Sabres":          { founded: [1970, 5, 22],city: "Buffalo",        cityFounded: [1832, 4, 20], stadium: "KeyBank Center",      stadiumOpened: [1996, 9, 21] },
  "Calgary Flames":          { founded: [1980, 6, 24], city: "Calgary",        cityFounded: [1894, 1, 1],  stadium: "Scotiabank Saddledome",stadiumOpened: [1983, 10, 15] },
  "Carolina Hurricanes":     { founded: [1997, 5, 6], city: "Raleigh",        cityFounded: [1792, 12, 31],stadium: "Lenovo Center",       stadiumOpened: [1999, 10, 29] },
  "Chicago Blackhawks":      { founded: [1926, 9, 25],city: "Chicago",        cityFounded: [1837, 3, 4],  stadium: "United Center",       stadiumOpened: [1994, 8, 18] },
  "Colorado Avalanche":      { founded: [1995, 7, 1], city: "Denver",         cityFounded: [1861, 11, 7], stadium: "Ball Arena",          stadiumOpened: [1999, 10, 1] },
  "Columbus Blue Jackets":   { founded: [1997, 6, 25],city: "Columbus",       cityFounded: [1812, 2, 14], stadium: "Nationwide Arena",    stadiumOpened: [2000, 9, 9] },
  "Dallas Stars":            { founded: [1993, 3, 10], city: "Dallas",         cityFounded: [1856, 2, 2],  stadium: "American Airlines Center",stadiumOpened: [2001, 7, 17] },
  "Detroit Red Wings":       { founded: [1932, 10, 5], city: "Detroit",        cityFounded: [1815, 9, 13], stadium: "Little Caesars Arena",stadiumOpened: [2017, 9, 5] },
  "Edmonton Oilers":         { founded: [1979, 10, 10],city: "Edmonton",       cityFounded: [1904, 10, 8], stadium: "Rogers Place",        stadiumOpened: [2016, 9, 8] },
  "Florida Panthers":        { founded: [1993, 4, 20], city: "Sunrise",        cityFounded: [1961, 6, 22], stadium: "Amerant Bank Arena",  stadiumOpened: [1998, 10, 3] },
  "Los Angeles Kings":       { founded: [1967, 6, 5], city: "Los Angeles",    cityFounded: [1850, 4, 4],  stadium: "Crypto.com Arena",    stadiumOpened: [1999, 10, 17] },
  "Minnesota Wild":          { founded: [1997, 6, 25],city: "Saint Paul",     cityFounded: [1854, 3, 4],  stadium: "Grand Casino Arena",  stadiumOpened: [2000, 9, 29] },
  "Montreal Canadiens":      { founded: [1909, 12, 4],city: "Montreal",       cityFounded: [1832, 6, 5],  stadium: "Bell Centre",         stadiumOpened: [1996, 3, 16] },
  "Nashville Predators":     { founded: [1998, 5, 4], city: "Nashville",      cityFounded: [1806, 12, 24],stadium: "Bridgestone Arena",   stadiumOpened: [1996, 12, 18] },
  "New Jersey Devils":       { founded: [1882, 6, 30], city: "Newark",         cityFounded: [1666, 1, 1],  stadium: "Prudential Center",   stadiumOpened: [2007, 10, 25] },
  "New York Islanders":      { founded: [1971, 11, 8], city: "Elmont",         cityFounded: [1882, 1, 1],  stadium: "UBS Arena",           stadiumOpened: [2021, 11, 20] },
  "New York Rangers":        { founded: [1926, 5, 15],city: "New York",       cityFounded: [1624, 1, 1],  stadium: "Madison Square Garden",stadiumOpened: [1968, 2, 11] },
  "Ottawa Senators":         { founded: [1992, 6, 1], city: "Ottawa",         cityFounded: [1855, 1, 1],  stadium: "Canadian Tire Centre",stadiumOpened: [1996, 1, 17] },
  "Philadelphia Flyers":     { founded: [1967, 10, 11],city: "Philadelphia",   cityFounded: [1701, 10, 25],stadium: "Wells Fargo Center",  stadiumOpened: [1996, 8, 31] },
  "Pittsburgh Penguins":     { founded: [1967, 6, 5], city: "Pittsburgh",     cityFounded: [1816, 3, 18], stadium: "PPG Paints Arena",    stadiumOpened: [2010, 8, 1] },
  "San Jose Sharks":         { founded: [1990, 5, 9], city: "San Jose",       cityFounded: [1850, 3, 27], stadium: "SAP Center at San Jose",stadiumOpened: [1993, 9, 7] },
  "Seattle Kraken":          { founded: [2018, 12, 4],city: "Seattle",        cityFounded: [1869, 12, 2], stadium: "Climate Pledge Arena",stadiumOpened: [2021, 10, 22] },
  "St. Louis Blues":         { founded: [1967, 6, 5], city: "St. Louis",      cityFounded: [1822, 12, 9], stadium: "Enterprise Center",   stadiumOpened: [1994, 10, 8] },
  "Tampa Bay Lightning":     { founded: [1990, 9, 12], city: "Tampa",         cityFounded: [1849, 1, 18], stadium: "Benchmark International Arena",stadiumOpened: [1996, 10, 20] },
  "Toronto Maple Leafs":     { founded: [1917, 11, 22],city: "Toronto",       cityFounded: [1834, 3, 6],  stadium: "Scotiabank Arena",    stadiumOpened: [1999, 2, 19] },
  "Utah Hockey Club":        { founded: [2014, 6, 27], city: "Salt Lake City", cityFounded: [1851, 1, 19], stadium: "Delta Center",        stadiumOpened: [1991, 10, 4] },
  "Utah Mammoth":            { founded: [2014, 6, 27], city: "Salt Lake City", cityFounded: [1851, 1, 19], stadium: "Delta Center",        stadiumOpened: [1991, 10, 4] },
  "Vancouver Canucks":       { founded: [1945, 9, 22], city: "Vancouver",      cityFounded: [1886, 4, 6],  stadium: "Rogers Arena",        stadiumOpened: [1995, 9, 17] },
  "Vegas Golden Knights":    { founded: [2016, 6, 22], city: "Paradise",       cityFounded: [1950, 1, 1],  stadium: "T-Mobile Arena",      stadiumOpened: [2016, 4, 6] },
  "Washington Capitals":     { founded: [1974, 9, 9], city: "Washington",     cityFounded: [1790, 7, 16], stadium: "Capital One Arena",   stadiumOpened: [1997, 12, 2] },
  "Winnipeg Jets":           { founded: [1972, 6, 22], city: "Winnipeg",       cityFounded: [1873, 11, 8], stadium: "Canada Life Centre",  stadiumOpened: [2004, 11, 16] },
};

export const SPORTS_TEAM_GROUPS: Record<string, Record<string, TeamMeta>> = {
  MLB, NBA, NFL, NHL,
};

export const TEAM_DB: Record<string, TeamMeta> = {
  ...SPORTS_TEAM_GROUPS.MLB,
  ...SPORTS_TEAM_GROUPS.NBA,
  ...SPORTS_TEAM_GROUPS.NFL,
  ...SPORTS_TEAM_GROUPS.NHL,
};

// Map ESPN displayName variations to canonical keys.
export const TEAM_ALIASES: Record<string, string> = {
  "LA Lakers": "Los Angeles Lakers",
  "LA Clippers": "LA Clippers",
  "Saint Louis Cardinals": "St. Louis Cardinals",
  "St Louis Cardinals": "St. Louis Cardinals",
  "St Louis Blues": "St. Louis Blues",
  "Athletics": "Oakland Athletics",
  "Sacramento Athletics": "Oakland Athletics",
};

export function getTeamMeta(name: string): TeamMeta | undefined {
  if (TEAM_DB[name]) return TEAM_DB[name];
  if (TEAM_ALIASES[name]) return TEAM_DB[TEAM_ALIASES[name]];
  // fuzzy: last token match
  const lower = name.toLowerCase();
  for (const k of Object.keys(TEAM_DB)) {
    if (k.toLowerCase().endsWith(lower) || lower.endsWith(k.toLowerCase())) return TEAM_DB[k];
  }
  return undefined;
}
