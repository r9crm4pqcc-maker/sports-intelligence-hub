import { reduce } from "./numerology";

export type Sport = "NFL" | "NBA" | "MLB" | "NHL" | "SOCCER";

export interface SportsTeam {
  name: string;
  abbreviation: string;
  sport: Sport;
  league: string;
  foundingYear: number;
  imprint?: number;
}

function teamImprint(year: number): number {
  return reduce([...String(year)].reduce((a, d) => a + +d, 0));
}

const RAW_TEAMS: Omit<SportsTeam, "imprint">[] = [
  // ── NFL ────────────────────────────────────────────────────────────────────
  { name:"Arizona Cardinals",     abbreviation:"ARI",  sport:"NFL", league:"NFC West",    foundingYear:1898 },
  { name:"Atlanta Falcons",       abbreviation:"ATL",  sport:"NFL", league:"NFC South",   foundingYear:1966 },
  { name:"Baltimore Ravens",      abbreviation:"BAL",  sport:"NFL", league:"AFC North",   foundingYear:1996 },
  { name:"Buffalo Bills",         abbreviation:"BUF",  sport:"NFL", league:"AFC East",    foundingYear:1960 },
  { name:"Carolina Panthers",     abbreviation:"CAR",  sport:"NFL", league:"NFC South",   foundingYear:1993 },
  { name:"Chicago Bears",         abbreviation:"CHI",  sport:"NFL", league:"NFC North",   foundingYear:1920 },
  { name:"Cincinnati Bengals",    abbreviation:"CIN",  sport:"NFL", league:"AFC North",   foundingYear:1967 },
  { name:"Cleveland Browns",      abbreviation:"CLE",  sport:"NFL", league:"AFC North",   foundingYear:1944 },
  { name:"Dallas Cowboys",        abbreviation:"DAL",  sport:"NFL", league:"NFC East",    foundingYear:1960 },
  { name:"Denver Broncos",        abbreviation:"DEN",  sport:"NFL", league:"AFC West",    foundingYear:1960 },
  { name:"Detroit Lions",         abbreviation:"DET",  sport:"NFL", league:"NFC North",   foundingYear:1930 },
  { name:"Green Bay Packers",     abbreviation:"GB",   sport:"NFL", league:"NFC North",   foundingYear:1921 },
  { name:"Houston Texans",        abbreviation:"HOU",  sport:"NFL", league:"AFC South",   foundingYear:2002 },
  { name:"Indianapolis Colts",    abbreviation:"IND",  sport:"NFL", league:"AFC South",   foundingYear:1953 },
  { name:"Jacksonville Jaguars",  abbreviation:"JAX",  sport:"NFL", league:"AFC South",   foundingYear:1995 },
  { name:"Kansas City Chiefs",    abbreviation:"KC",   sport:"NFL", league:"AFC West",    foundingYear:1959 },
  { name:"Las Vegas Raiders",     abbreviation:"LV",   sport:"NFL", league:"AFC West",    foundingYear:1960 },
  { name:"LA Chargers",           abbreviation:"LAC",  sport:"NFL", league:"AFC West",    foundingYear:1960 },
  { name:"LA Rams",               abbreviation:"LAR",  sport:"NFL", league:"NFC West",    foundingYear:1937 },
  { name:"Miami Dolphins",        abbreviation:"MIA",  sport:"NFL", league:"AFC East",    foundingYear:1966 },
  { name:"Minnesota Vikings",     abbreviation:"MIN",  sport:"NFL", league:"NFC North",   foundingYear:1961 },
  { name:"New England Patriots",  abbreviation:"NE",   sport:"NFL", league:"AFC East",    foundingYear:1960 },
  { name:"New Orleans Saints",    abbreviation:"NO",   sport:"NFL", league:"NFC South",   foundingYear:1966 },
  { name:"NY Giants",             abbreviation:"NYG",  sport:"NFL", league:"NFC East",    foundingYear:1925 },
  { name:"NY Jets",               abbreviation:"NYJ",  sport:"NFL", league:"AFC East",    foundingYear:1960 },
  { name:"Philadelphia Eagles",   abbreviation:"PHI",  sport:"NFL", league:"NFC East",    foundingYear:1933 },
  { name:"Pittsburgh Steelers",   abbreviation:"PIT",  sport:"NFL", league:"AFC North",   foundingYear:1933 },
  { name:"San Francisco 49ers",   abbreviation:"SF",   sport:"NFL", league:"NFC West",    foundingYear:1946 },
  { name:"Seattle Seahawks",      abbreviation:"SEA",  sport:"NFL", league:"NFC West",    foundingYear:1976 },
  { name:"Tampa Bay Buccaneers",  abbreviation:"TB",   sport:"NFL", league:"NFC South",   foundingYear:1976 },
  { name:"Tennessee Titans",      abbreviation:"TEN",  sport:"NFL", league:"AFC South",   foundingYear:1960 },
  { name:"Washington Commanders", abbreviation:"WSH",  sport:"NFL", league:"NFC East",    foundingYear:1932 },

  // ── NBA ────────────────────────────────────────────────────────────────────
  { name:"Atlanta Hawks",         abbreviation:"ATL",  sport:"NBA", league:"Eastern",     foundingYear:1968 },
  { name:"Boston Celtics",        abbreviation:"BOS",  sport:"NBA", league:"Eastern",     foundingYear:1946 },
  { name:"Brooklyn Nets",         abbreviation:"BKN",  sport:"NBA", league:"Eastern",     foundingYear:2012 },
  { name:"Charlotte Hornets",     abbreviation:"CHA",  sport:"NBA", league:"Eastern",     foundingYear:2014 },
  { name:"Chicago Bulls",         abbreviation:"CHI",  sport:"NBA", league:"Eastern",     foundingYear:1966 },
  { name:"Cleveland Cavaliers",   abbreviation:"CLE",  sport:"NBA", league:"Eastern",     foundingYear:1970 },
  { name:"Dallas Mavericks",      abbreviation:"DAL",  sport:"NBA", league:"Western",     foundingYear:1980 },
  { name:"Denver Nuggets",        abbreviation:"DEN",  sport:"NBA", league:"Western",     foundingYear:1967 },
  { name:"Detroit Pistons",       abbreviation:"DET",  sport:"NBA", league:"Eastern",     foundingYear:1941 },
  { name:"Golden State Warriors", abbreviation:"GSW",  sport:"NBA", league:"Western",     foundingYear:1971 },
  { name:"Houston Rockets",       abbreviation:"HOU",  sport:"NBA", league:"Western",     foundingYear:1967 },
  { name:"Indiana Pacers",        abbreviation:"IND",  sport:"NBA", league:"Eastern",     foundingYear:1967 },
  { name:"LA Clippers",           abbreviation:"LAC",  sport:"NBA", league:"Western",     foundingYear:1984 },
  { name:"LA Lakers",             abbreviation:"LAL",  sport:"NBA", league:"Western",     foundingYear:1947 },
  { name:"Memphis Grizzlies",     abbreviation:"MEM",  sport:"NBA", league:"Western",     foundingYear:2001 },
  { name:"Miami Heat",            abbreviation:"MIA",  sport:"NBA", league:"Eastern",     foundingYear:1988 },
  { name:"Milwaukee Bucks",       abbreviation:"MIL",  sport:"NBA", league:"Eastern",     foundingYear:1968 },
  { name:"Minnesota Timberwolves",abbreviation:"MIN",  sport:"NBA", league:"Western",     foundingYear:1989 },
  { name:"New Orleans Pelicans",  abbreviation:"NOP",  sport:"NBA", league:"Western",     foundingYear:2013 },
  { name:"NY Knicks",             abbreviation:"NYK",  sport:"NBA", league:"Eastern",     foundingYear:1946 },
  { name:"OKC Thunder",           abbreviation:"OKC",  sport:"NBA", league:"Western",     foundingYear:2008 },
  { name:"Orlando Magic",         abbreviation:"ORL",  sport:"NBA", league:"Eastern",     foundingYear:1989 },
  { name:"Philadelphia 76ers",    abbreviation:"PHI",  sport:"NBA", league:"Eastern",     foundingYear:1946 },
  { name:"Phoenix Suns",          abbreviation:"PHX",  sport:"NBA", league:"Western",     foundingYear:1968 },
  { name:"Portland Trail Blazers",abbreviation:"POR",  sport:"NBA", league:"Western",     foundingYear:1970 },
  { name:"Sacramento Kings",      abbreviation:"SAC",  sport:"NBA", league:"Western",     foundingYear:1985 },
  { name:"San Antonio Spurs",     abbreviation:"SAS",  sport:"NBA", league:"Western",     foundingYear:1973 },
  { name:"Toronto Raptors",       abbreviation:"TOR",  sport:"NBA", league:"Eastern",     foundingYear:1995 },
  { name:"Utah Jazz",             abbreviation:"UTA",  sport:"NBA", league:"Western",     foundingYear:1974 },
  { name:"Washington Wizards",    abbreviation:"WSH",  sport:"NBA", league:"Eastern",     foundingYear:1997 },

  // ── MLB ────────────────────────────────────────────────────────────────────
  { name:"Arizona Diamondbacks",  abbreviation:"ARI",  sport:"MLB", league:"NL West",     foundingYear:1995 },
  { name:"Atlanta Braves",        abbreviation:"ATL",  sport:"MLB", league:"NL East",     foundingYear:1966 },
  { name:"Baltimore Orioles",     abbreviation:"BAL",  sport:"MLB", league:"AL East",     foundingYear:1954 },
  { name:"Boston Red Sox",        abbreviation:"BOS",  sport:"MLB", league:"AL East",     foundingYear:1907 },
  { name:"Chicago Cubs",          abbreviation:"CHC",  sport:"MLB", league:"NL Central",  foundingYear:1876 },
  { name:"Chicago White Sox",     abbreviation:"CWS",  sport:"MLB", league:"AL Central",  foundingYear:1901 },
  { name:"Cincinnati Reds",       abbreviation:"CIN",  sport:"MLB", league:"NL Central",  foundingYear:1882 },
  { name:"Cleveland Guardians",   abbreviation:"CLE",  sport:"MLB", league:"AL Central",  foundingYear:2021 },
  { name:"Colorado Rockies",      abbreviation:"COL",  sport:"MLB", league:"NL West",     foundingYear:1993 },
  { name:"Detroit Tigers",        abbreviation:"DET",  sport:"MLB", league:"AL Central",  foundingYear:1901 },
  { name:"Houston Astros",        abbreviation:"HOU",  sport:"MLB", league:"AL West",     foundingYear:1964 },
  { name:"Kansas City Royals",    abbreviation:"KC",   sport:"MLB", league:"AL Central",  foundingYear:1968 },
  { name:"LA Angels",             abbreviation:"LAA",  sport:"MLB", league:"AL West",     foundingYear:1965 },
  { name:"LA Dodgers",            abbreviation:"LAD",  sport:"MLB", league:"NL West",     foundingYear:1957 },
  { name:"Miami Marlins",         abbreviation:"MIA",  sport:"MLB", league:"NL East",     foundingYear:2011 },
  { name:"Milwaukee Brewers",     abbreviation:"MIL",  sport:"MLB", league:"NL Central",  foundingYear:1970 },
  { name:"Minnesota Twins",       abbreviation:"MIN",  sport:"MLB", league:"AL Central",  foundingYear:1961 },
  { name:"NY Mets",               abbreviation:"NYM",  sport:"MLB", league:"NL East",     foundingYear:1961 },
  { name:"NY Yankees",            abbreviation:"NYY",  sport:"MLB", league:"AL East",     foundingYear:1903 },
  { name:"Oakland Athletics",     abbreviation:"OAK",  sport:"MLB", league:"AL West",     foundingYear:1901 },
  { name:"Philadelphia Phillies", abbreviation:"PHI",  sport:"MLB", league:"NL East",     foundingYear:1883 },
  { name:"Pittsburgh Pirates",    abbreviation:"PIT",  sport:"MLB", league:"NL Central",  foundingYear:1887 },
  { name:"San Diego Padres",      abbreviation:"SD",   sport:"MLB", league:"NL West",     foundingYear:1968 },
  { name:"San Francisco Giants",  abbreviation:"SF",   sport:"MLB", league:"NL West",     foundingYear:1958 },
  { name:"Seattle Mariners",      abbreviation:"SEA",  sport:"MLB", league:"AL West",     foundingYear:1977 },
  { name:"St. Louis Cardinals",   abbreviation:"STL",  sport:"MLB", league:"NL Central",  foundingYear:1882 },
  { name:"Tampa Bay Rays",        abbreviation:"TB",   sport:"MLB", league:"AL East",     foundingYear:2007 },
  { name:"Texas Rangers",         abbreviation:"TEX",  sport:"MLB", league:"AL West",     foundingYear:1971 },
  { name:"Toronto Blue Jays",     abbreviation:"TOR",  sport:"MLB", league:"AL East",     foundingYear:1976 },
  { name:"Washington Nationals",  abbreviation:"WSH",  sport:"MLB", league:"NL East",     foundingYear:2004 },

  // ── NHL ────────────────────────────────────────────────────────────────────
  { name:"Anaheim Ducks",         abbreviation:"ANA",  sport:"NHL", league:"Pacific",     foundingYear:1992 },
  { name:"Boston Bruins",         abbreviation:"BOS",  sport:"NHL", league:"Atlantic",    foundingYear:1924 },
  { name:"Buffalo Sabres",        abbreviation:"BUF",  sport:"NHL", league:"Atlantic",    foundingYear:1970 },
  { name:"Calgary Flames",        abbreviation:"CGY",  sport:"NHL", league:"Pacific",     foundingYear:1980 },
  { name:"Carolina Hurricanes",   abbreviation:"CAR",  sport:"NHL", league:"Metropolitan",foundingYear:1997 },
  { name:"Chicago Blackhawks",    abbreviation:"CHI",  sport:"NHL", league:"Central",     foundingYear:1926 },
  { name:"Colorado Avalanche",    abbreviation:"COL",  sport:"NHL", league:"Central",     foundingYear:1995 },
  { name:"Columbus Blue Jackets", abbreviation:"CBJ",  sport:"NHL", league:"Metropolitan",foundingYear:2000 },
  { name:"Dallas Stars",          abbreviation:"DAL",  sport:"NHL", league:"Central",     foundingYear:1993 },
  { name:"Detroit Red Wings",     abbreviation:"DET",  sport:"NHL", league:"Atlantic",    foundingYear:1932 },
  { name:"Edmonton Oilers",       abbreviation:"EDM",  sport:"NHL", league:"Pacific",     foundingYear:1979 },
  { name:"Florida Panthers",      abbreviation:"FLA",  sport:"NHL", league:"Atlantic",    foundingYear:1993 },
  { name:"LA Kings",              abbreviation:"LAK",  sport:"NHL", league:"Pacific",     foundingYear:1967 },
  { name:"Minnesota Wild",        abbreviation:"MIN",  sport:"NHL", league:"Central",     foundingYear:2000 },
  { name:"Montreal Canadiens",    abbreviation:"MTL",  sport:"NHL", league:"Atlantic",    foundingYear:1909 },
  { name:"Nashville Predators",   abbreviation:"NSH",  sport:"NHL", league:"Central",     foundingYear:1998 },
  { name:"New Jersey Devils",     abbreviation:"NJD",  sport:"NHL", league:"Metropolitan",foundingYear:1882 },
  { name:"NY Islanders",          abbreviation:"NYI",  sport:"NHL", league:"Metropolitan",foundingYear:1971 },
  { name:"NY Rangers",            abbreviation:"NYR",  sport:"NHL", league:"Metropolitan",foundingYear:1926 },
  { name:"Ottawa Senators",       abbreviation:"OTT",  sport:"NHL", league:"Atlantic",    foundingYear:1992 },
  { name:"Philadelphia Flyers",   abbreviation:"PHI",  sport:"NHL", league:"Metropolitan",foundingYear:1967 },
  { name:"Pittsburgh Penguins",   abbreviation:"PIT",  sport:"NHL", league:"Metropolitan",foundingYear:1967 },
  { name:"San Jose Sharks",       abbreviation:"SJS",  sport:"NHL", league:"Pacific",     foundingYear:1990 },
  { name:"Seattle Kraken",        abbreviation:"SEA",  sport:"NHL", league:"Pacific",     foundingYear:2021 },
  { name:"St. Louis Blues",       abbreviation:"STL",  sport:"NHL", league:"Central",     foundingYear:1967 },
  { name:"Tampa Bay Lightning",   abbreviation:"TBL",  sport:"NHL", league:"Atlantic",    foundingYear:1990 },
  { name:"Toronto Maple Leafs",   abbreviation:"TOR",  sport:"NHL", league:"Atlantic",    foundingYear:1917 },
  { name:"Utah Hockey Club",      abbreviation:"UTA",  sport:"NHL", league:"Central",     foundingYear:2014 },
  { name:"Vancouver Canucks",     abbreviation:"VAN",  sport:"NHL", league:"Pacific",     foundingYear:1945 },
  { name:"Vegas Golden Knights",  abbreviation:"VGK",  sport:"NHL", league:"Pacific",     foundingYear:2016 },
  { name:"Washington Capitals",   abbreviation:"WSH",  sport:"NHL", league:"Metropolitan",foundingYear:1974 },
  { name:"Winnipeg Jets",         abbreviation:"WPG",  sport:"NHL", league:"Central",     foundingYear:1972 },

  // ── MLS ────────────────────────────────────────────────────────────────────
  { name:"Atlanta United",        abbreviation:"ATL",  sport:"SOCCER", league:"MLS",      foundingYear:2017 },
  { name:"Austin FC",             abbreviation:"AUS",  sport:"SOCCER", league:"MLS",      foundingYear:2021 },
  { name:"Charlotte FC",          abbreviation:"CLT",  sport:"SOCCER", league:"MLS",      foundingYear:2022 },
  { name:"Chicago Fire",          abbreviation:"CHI",  sport:"SOCCER", league:"MLS",      foundingYear:1997 },
  { name:"FC Cincinnati",         abbreviation:"CIN",  sport:"SOCCER", league:"MLS",      foundingYear:2018 },
  { name:"Colorado Rapids",       abbreviation:"COL",  sport:"SOCCER", league:"MLS",      foundingYear:1996 },
  { name:"Columbus Crew",         abbreviation:"CLB",  sport:"SOCCER", league:"MLS",      foundingYear:1996 },
  { name:"DC United",             abbreviation:"DC",   sport:"SOCCER", league:"MLS",      foundingYear:1996 },
  { name:"Houston Dynamo",        abbreviation:"HOU",  sport:"SOCCER", league:"MLS",      foundingYear:2006 },
  { name:"Inter Miami",           abbreviation:"MIA",  sport:"SOCCER", league:"MLS",      foundingYear:2020 },
  { name:"LA FC",                 abbreviation:"LAFC", sport:"SOCCER", league:"MLS",      foundingYear:2018 },
  { name:"LA Galaxy",             abbreviation:"LAG",  sport:"SOCCER", league:"MLS",      foundingYear:1996 },
  { name:"Minnesota United",      abbreviation:"MIN",  sport:"SOCCER", league:"MLS",      foundingYear:2017 },
  { name:"Nashville SC",          abbreviation:"NSH",  sport:"SOCCER", league:"MLS",      foundingYear:2020 },
  { name:"New England Revolution",abbreviation:"NE",   sport:"SOCCER", league:"MLS",      foundingYear:1996 },
  { name:"NY City FC",            abbreviation:"NYC",  sport:"SOCCER", league:"MLS",      foundingYear:2015 },
  { name:"NY Red Bulls",          abbreviation:"NYRB", sport:"SOCCER", league:"MLS",      foundingYear:1996 },
  { name:"Orlando City",          abbreviation:"ORL",  sport:"SOCCER", league:"MLS",      foundingYear:2015 },
  { name:"Philadelphia Union",    abbreviation:"PHI",  sport:"SOCCER", league:"MLS",      foundingYear:2010 },
  { name:"Portland Timbers",      abbreviation:"POR",  sport:"SOCCER", league:"MLS",      foundingYear:2011 },
  { name:"Real Salt Lake",        abbreviation:"RSL",  sport:"SOCCER", league:"MLS",      foundingYear:2005 },
  { name:"San Jose Earthquakes",  abbreviation:"SJ",   sport:"SOCCER", league:"MLS",      foundingYear:1996 },
  { name:"Seattle Sounders",      abbreviation:"SEA",  sport:"SOCCER", league:"MLS",      foundingYear:2009 },
  { name:"Sporting KC",           abbreviation:"SKC",  sport:"SOCCER", league:"MLS",      foundingYear:1996 },
  { name:"St. Louis City SC",     abbreviation:"STL",  sport:"SOCCER", league:"MLS",      foundingYear:2023 },
  { name:"Toronto FC",            abbreviation:"TOR",  sport:"SOCCER", league:"MLS",      foundingYear:2007 },
  { name:"Vancouver Whitecaps",   abbreviation:"VAN",  sport:"SOCCER", league:"MLS",      foundingYear:2011 },

  // ── Premier League ──────────────────────────────────────────────────────────
  { name:"Arsenal",               abbreviation:"ARS",  sport:"SOCCER", league:"Premier League", foundingYear:1886 },
  { name:"Aston Villa",           abbreviation:"AVL",  sport:"SOCCER", league:"Premier League", foundingYear:1874 },
  { name:"Brentford",             abbreviation:"BRE",  sport:"SOCCER", league:"Premier League", foundingYear:1889 },
  { name:"Brighton",              abbreviation:"BHA",  sport:"SOCCER", league:"Premier League", foundingYear:1901 },
  { name:"Burnley",               abbreviation:"BUR",  sport:"SOCCER", league:"Premier League", foundingYear:1882 },
  { name:"Chelsea",               abbreviation:"CHE",  sport:"SOCCER", league:"Premier League", foundingYear:1905 },
  { name:"Crystal Palace",        abbreviation:"CRY",  sport:"SOCCER", league:"Premier League", foundingYear:1905 },
  { name:"Everton",               abbreviation:"EVE",  sport:"SOCCER", league:"Premier League", foundingYear:1878 },
  { name:"Fulham",                abbreviation:"FUL",  sport:"SOCCER", league:"Premier League", foundingYear:1879 },
  { name:"Liverpool",             abbreviation:"LIV",  sport:"SOCCER", league:"Premier League", foundingYear:1892 },
  { name:"Luton Town",            abbreviation:"LUT",  sport:"SOCCER", league:"Premier League", foundingYear:1885 },
  { name:"Manchester City",       abbreviation:"MCI",  sport:"SOCCER", league:"Premier League", foundingYear:1880 },
  { name:"Manchester United",     abbreviation:"MUN",  sport:"SOCCER", league:"Premier League", foundingYear:1878 },
  { name:"Newcastle United",      abbreviation:"NEW",  sport:"SOCCER", league:"Premier League", foundingYear:1892 },
  { name:"Nottingham Forest",     abbreviation:"NFO",  sport:"SOCCER", league:"Premier League", foundingYear:1865 },
  { name:"Sheffield United",      abbreviation:"SHU",  sport:"SOCCER", league:"Premier League", foundingYear:1889 },
  { name:"Tottenham Hotspur",     abbreviation:"TOT",  sport:"SOCCER", league:"Premier League", foundingYear:1882 },
  { name:"West Ham United",       abbreviation:"WHU",  sport:"SOCCER", league:"Premier League", foundingYear:1895 },
  { name:"Wolves",                abbreviation:"WOL",  sport:"SOCCER", league:"Premier League", foundingYear:1877 },

  // ── La Liga ────────────────────────────────────────────────────────────────
  { name:"Real Madrid",           abbreviation:"RMA",  sport:"SOCCER", league:"La Liga",   foundingYear:1902 },
  { name:"Barcelona",             abbreviation:"BAR",  sport:"SOCCER", league:"La Liga",   foundingYear:1899 },
  { name:"Atletico Madrid",       abbreviation:"ATM",  sport:"SOCCER", league:"La Liga",   foundingYear:1903 },
  { name:"Sevilla",               abbreviation:"SEV",  sport:"SOCCER", league:"La Liga",   foundingYear:1890 },
  { name:"Real Sociedad",         abbreviation:"RSO",  sport:"SOCCER", league:"La Liga",   foundingYear:1909 },
  { name:"Real Betis",            abbreviation:"BET",  sport:"SOCCER", league:"La Liga",   foundingYear:1907 },
  { name:"Villarreal",            abbreviation:"VIL",  sport:"SOCCER", league:"La Liga",   foundingYear:1923 },
  { name:"Athletic Club",         abbreviation:"ATH",  sport:"SOCCER", league:"La Liga",   foundingYear:1898 },
  { name:"Valencia",              abbreviation:"VAL",  sport:"SOCCER", league:"La Liga",   foundingYear:1919 },
  { name:"Girona",                abbreviation:"GIR",  sport:"SOCCER", league:"La Liga",   foundingYear:1930 },
  { name:"Las Palmas",            abbreviation:"LPA",  sport:"SOCCER", league:"La Liga",   foundingYear:1949 },
  { name:"Getafe",                abbreviation:"GET",  sport:"SOCCER", league:"La Liga",   foundingYear:1983 },
  { name:"Osasuna",               abbreviation:"OSA",  sport:"SOCCER", league:"La Liga",   foundingYear:1920 },
  { name:"Celta Vigo",            abbreviation:"CEL",  sport:"SOCCER", league:"La Liga",   foundingYear:1923 },
  { name:"Alaves",                abbreviation:"ALA",  sport:"SOCCER", league:"La Liga",   foundingYear:1921 },
  { name:"Cadiz",                 abbreviation:"CAD",  sport:"SOCCER", league:"La Liga",   foundingYear:1910 },
  { name:"Rayo Vallecano",        abbreviation:"RAY",  sport:"SOCCER", league:"La Liga",   foundingYear:1924 },
  { name:"Mallorca",              abbreviation:"MLL",  sport:"SOCCER", league:"La Liga",   foundingYear:1916 },

  // ── Bundesliga ────────────────────────────────────────────────────────────
  { name:"Bayern Munich",         abbreviation:"BAY",  sport:"SOCCER", league:"Bundesliga",foundingYear:1900 },
  { name:"Borussia Dortmund",     abbreviation:"BVB",  sport:"SOCCER", league:"Bundesliga",foundingYear:1909 },
  { name:"RB Leipzig",            abbreviation:"RBL",  sport:"SOCCER", league:"Bundesliga",foundingYear:2009 },
  { name:"Bayer Leverkusen",      abbreviation:"B04",  sport:"SOCCER", league:"Bundesliga",foundingYear:1904 },
  { name:"Wolfsburg",             abbreviation:"WOB",  sport:"SOCCER", league:"Bundesliga",foundingYear:1945 },
  { name:"Eintracht Frankfurt",   abbreviation:"SGE",  sport:"SOCCER", league:"Bundesliga",foundingYear:1899 },
  { name:"Borussia Mönchengladbach",abbreviation:"BMG",sport:"SOCCER", league:"Bundesliga",foundingYear:1900 },
  { name:"SC Freiburg",           abbreviation:"SCF",  sport:"SOCCER", league:"Bundesliga",foundingYear:1904 },
  { name:"Union Berlin",          abbreviation:"FCU",  sport:"SOCCER", league:"Bundesliga",foundingYear:1906 },
  { name:"Stuttgart",             abbreviation:"VFB",  sport:"SOCCER", league:"Bundesliga",foundingYear:1893 },
  { name:"Augsburg",              abbreviation:"FCA",  sport:"SOCCER", league:"Bundesliga",foundingYear:1907 },
  { name:"Hoffenheim",            abbreviation:"TSG",  sport:"SOCCER", league:"Bundesliga",foundingYear:1899 },
  { name:"Mainz 05",              abbreviation:"M05",  sport:"SOCCER", league:"Bundesliga",foundingYear:1905 },
  { name:"Werder Bremen",         abbreviation:"SVW",  sport:"SOCCER", league:"Bundesliga",foundingYear:1899 },
  { name:"Darmstadt",             abbreviation:"D98",  sport:"SOCCER", league:"Bundesliga",foundingYear:1898 },
  { name:"Köln",                  abbreviation:"KOE",  sport:"SOCCER", league:"Bundesliga",foundingYear:1948 },

  // ── Serie A ───────────────────────────────────────────────────────────────
  { name:"Inter Milan",           abbreviation:"INT",  sport:"SOCCER", league:"Serie A",   foundingYear:1908 },
  { name:"Juventus",              abbreviation:"JUV",  sport:"SOCCER", league:"Serie A",   foundingYear:1897 },
  { name:"AC Milan",              abbreviation:"ACM",  sport:"SOCCER", league:"Serie A",   foundingYear:1899 },
  { name:"Napoli",                abbreviation:"NAP",  sport:"SOCCER", league:"Serie A",   foundingYear:1926 },
  { name:"Roma",                  abbreviation:"ROM",  sport:"SOCCER", league:"Serie A",   foundingYear:1927 },
  { name:"Lazio",                 abbreviation:"LAZ",  sport:"SOCCER", league:"Serie A",   foundingYear:1900 },
  { name:"Atalanta",              abbreviation:"ATA",  sport:"SOCCER", league:"Serie A",   foundingYear:1907 },
  { name:"Fiorentina",            abbreviation:"FIO",  sport:"SOCCER", league:"Serie A",   foundingYear:1926 },
  { name:"Torino",                abbreviation:"TOR",  sport:"SOCCER", league:"Serie A",   foundingYear:1906 },
  { name:"Bologna",               abbreviation:"BOL",  sport:"SOCCER", league:"Serie A",   foundingYear:1909 },
  { name:"Udinese",               abbreviation:"UDI",  sport:"SOCCER", league:"Serie A",   foundingYear:1896 },
  { name:"Monza",                 abbreviation:"MON",  sport:"SOCCER", league:"Serie A",   foundingYear:1912 },
  { name:"Frosinone",             abbreviation:"FRO",  sport:"SOCCER", league:"Serie A",   foundingYear:1928 },
  { name:"Genoa",                 abbreviation:"GEN",  sport:"SOCCER", league:"Serie A",   foundingYear:1893 },
  { name:"Lecce",                 abbreviation:"LEC",  sport:"SOCCER", league:"Serie A",   foundingYear:1908 },
  { name:"Cagliari",              abbreviation:"CAG",  sport:"SOCCER", league:"Serie A",   foundingYear:1920 },
  { name:"Salernitana",           abbreviation:"SAL",  sport:"SOCCER", league:"Serie A",   foundingYear:1919 },
  { name:"Hellas Verona",         abbreviation:"HEL",  sport:"SOCCER", league:"Serie A",   foundingYear:1903 },
  { name:"Empoli",                abbreviation:"EMP",  sport:"SOCCER", league:"Serie A",   foundingYear:1920 },
  { name:"Sassuolo",              abbreviation:"SAS",  sport:"SOCCER", league:"Serie A",   foundingYear:1920 },

  // ── Ligue 1 ───────────────────────────────────────────────────────────────
  { name:"Paris Saint-Germain",   abbreviation:"PSG",  sport:"SOCCER", league:"Ligue 1",   foundingYear:1970 },
  { name:"Marseille",             abbreviation:"OM",   sport:"SOCCER", league:"Ligue 1",   foundingYear:1899 },
  { name:"Lyon",                  abbreviation:"OL",   sport:"SOCCER", league:"Ligue 1",   foundingYear:1950 },
  { name:"Monaco",                abbreviation:"ASM",  sport:"SOCCER", league:"Ligue 1",   foundingYear:1924 },
  { name:"Lille",                 abbreviation:"LIL",  sport:"SOCCER", league:"Ligue 1",   foundingYear:1944 },
  { name:"Nice",                  abbreviation:"OGC",  sport:"SOCCER", league:"Ligue 1",   foundingYear:1904 },
  { name:"Lens",                  abbreviation:"LEN",  sport:"SOCCER", league:"Ligue 1",   foundingYear:1906 },
  { name:"Rennes",                abbreviation:"REN",  sport:"SOCCER", league:"Ligue 1",   foundingYear:1901 },
  { name:"Nantes",                abbreviation:"NAN",  sport:"SOCCER", league:"Ligue 1",   foundingYear:1943 },
  { name:"Reims",                 abbreviation:"REI",  sport:"SOCCER", league:"Ligue 1",   foundingYear:1931 },
  { name:"Strasbourg",            abbreviation:"STR",  sport:"SOCCER", league:"Ligue 1",   foundingYear:1906 },
  { name:"Montpellier",           abbreviation:"MPL",  sport:"SOCCER", league:"Ligue 1",   foundingYear:1974 },
  { name:"Brest",                 abbreviation:"SB29", sport:"SOCCER", league:"Ligue 1",   foundingYear:1950 },
  { name:"Toulouse",              abbreviation:"TFC",  sport:"SOCCER", league:"Ligue 1",   foundingYear:1937 },
  { name:"Lorient",               abbreviation:"LOR",  sport:"SOCCER", league:"Ligue 1",   foundingYear:1926 },
  { name:"Metz",                  abbreviation:"FCM",  sport:"SOCCER", league:"Ligue 1",   foundingYear:1932 },
  { name:"Clermont Foot",         abbreviation:"CLE",  sport:"SOCCER", league:"Ligue 1",   foundingYear:1911 },
  { name:"Le Havre",              abbreviation:"HAC",  sport:"SOCCER", league:"Ligue 1",   foundingYear:1872 },

  // ── Eredivisie ────────────────────────────────────────────────────────────
  { name:"Ajax",                  abbreviation:"AJX",  sport:"SOCCER", league:"Eredivisie",foundingYear:1900 },
  { name:"PSV Eindhoven",         abbreviation:"PSV",  sport:"SOCCER", league:"Eredivisie",foundingYear:1913 },
  { name:"Feyenoord",             abbreviation:"FEY",  sport:"SOCCER", league:"Eredivisie",foundingYear:1908 },
  { name:"AZ Alkmaar",            abbreviation:"AZA",  sport:"SOCCER", league:"Eredivisie",foundingYear:1967 },
  { name:"FC Utrecht",            abbreviation:"UTR",  sport:"SOCCER", league:"Eredivisie",foundingYear:1970 },
  { name:"FC Twente",             abbreviation:"FCT",  sport:"SOCCER", league:"Eredivisie",foundingYear:1965 },

  // ── Liga MX ────────────────────────────────────────────────────────────────
  { name:"Club América",          abbreviation:"AME",  sport:"SOCCER", league:"Liga MX",   foundingYear:1916 },
  { name:"Chivas Guadalajara",    abbreviation:"GDL",  sport:"SOCCER", league:"Liga MX",   foundingYear:1906 },
  { name:"Cruz Azul",             abbreviation:"CAZ",  sport:"SOCCER", league:"Liga MX",   foundingYear:1927 },
  { name:"UNAM Pumas",            abbreviation:"PUM",  sport:"SOCCER", league:"Liga MX",   foundingYear:1954 },
  { name:"Tigres UANL",           abbreviation:"TIG",  sport:"SOCCER", league:"Liga MX",   foundingYear:1960 },
  { name:"Monterrey",             abbreviation:"MTY",  sport:"SOCCER", league:"Liga MX",   foundingYear:1945 },
  { name:"León",                  abbreviation:"LEO",  sport:"SOCCER", league:"Liga MX",   foundingYear:1944 },
  { name:"Santos Laguna",         abbreviation:"SAN",  sport:"SOCCER", league:"Liga MX",   foundingYear:1983 },

  // ── Scottish Premiership ──────────────────────────────────────────────────
  { name:"Celtic",                abbreviation:"CEL",  sport:"SOCCER", league:"Scottish Prem", foundingYear:1888 },
  { name:"Rangers",               abbreviation:"RAN",  sport:"SOCCER", league:"Scottish Prem", foundingYear:1872 },

  // ── Primeira Liga (Portugal) ──────────────────────────────────────────────
  { name:"Benfica",               abbreviation:"BEN",  sport:"SOCCER", league:"Primeira Liga", foundingYear:1904 },
  { name:"Porto",                 abbreviation:"POR",  sport:"SOCCER", league:"Primeira Liga", foundingYear:1893 },
  { name:"Sporting CP",           abbreviation:"SCP",  sport:"SOCCER", league:"Primeira Liga", foundingYear:1906 },
  { name:"Braga",                 abbreviation:"BRG",  sport:"SOCCER", league:"Primeira Liga", foundingYear:1921 },

  // ── Champions League Contenders (current cycle) ───────────────────────────
  { name:"Borussia Dortmund CL",  abbreviation:"BVB-CL",sport:"SOCCER",league:"UCL",       foundingYear:1909 },
  { name:"Real Madrid CL",        abbreviation:"RMA-CL",sport:"SOCCER",league:"UCL",        foundingYear:1902 },
  { name:"Manchester City CL",    abbreviation:"MCI-CL",sport:"SOCCER",league:"UCL",        foundingYear:1880 },
  { name:"Bayern Munich CL",      abbreviation:"BAY-CL",sport:"SOCCER",league:"UCL",        foundingYear:1900 },
  { name:"Arsenal CL",            abbreviation:"ARS-CL",sport:"SOCCER",league:"UCL",        foundingYear:1886 },
  { name:"Inter Milan CL",        abbreviation:"INT-CL",sport:"SOCCER",league:"UCL",        foundingYear:1908 },
  { name:"Atletico Madrid CL",    abbreviation:"ATM-CL",sport:"SOCCER",league:"UCL",        foundingYear:1903 },
  { name:"PSG CL",                abbreviation:"PSG-CL",sport:"SOCCER",league:"UCL",        foundingYear:1970 },

  // ── Europa League Contenders ──────────────────────────────────────────────
  { name:"Atalanta EL",           abbreviation:"ATA-EL",sport:"SOCCER",league:"UEL",        foundingYear:1907 },
  { name:"Roma EL",               abbreviation:"ROM-EL",sport:"SOCCER",league:"UEL",        foundingYear:1927 },
  { name:"Liverpool EL",          abbreviation:"LIV-EL",sport:"SOCCER",league:"UEL",        foundingYear:1892 },
  { name:"Marseille EL",          abbreviation:"OM-EL", sport:"SOCCER",league:"UEL",        foundingYear:1899 },
  { name:"Villarreal EL",         abbreviation:"VIL-EL",sport:"SOCCER",league:"UEL",        foundingYear:1923 },
  { name:"Real Sociedad EL",      abbreviation:"RSO-EL",sport:"SOCCER",league:"UEL",        foundingYear:1909 },

  // ── Conference League ─────────────────────────────────────────────────────
  { name:"Fiorentina ECL",        abbreviation:"FIO-CL",sport:"SOCCER",league:"UECL",       foundingYear:1926 },
  { name:"Club Brugge ECL",       abbreviation:"CLB-CL",sport:"SOCCER",league:"UECL",       foundingYear:1891 },

  // ── National Teams ────────────────────────────────────────────────────────
  { name:"Brazil",                abbreviation:"BRA",  sport:"SOCCER", league:"International",foundingYear:1914 },
  { name:"Argentina",             abbreviation:"ARG",  sport:"SOCCER", league:"International",foundingYear:1893 },
  { name:"France",                abbreviation:"FRA",  sport:"SOCCER", league:"International",foundingYear:1904 },
  { name:"England",               abbreviation:"ENG",  sport:"SOCCER", league:"International",foundingYear:1863 },
  { name:"Germany",               abbreviation:"GER",  sport:"SOCCER", league:"International",foundingYear:1900 },
  { name:"Spain",                 abbreviation:"ESP",  sport:"SOCCER", league:"International",foundingYear:1913 },
  { name:"Italy",                 abbreviation:"ITA",  sport:"SOCCER", league:"International",foundingYear:1898 },
  { name:"Portugal",              abbreviation:"POR",  sport:"SOCCER", league:"International",foundingYear:1914 },
  { name:"Netherlands",           abbreviation:"NED",  sport:"SOCCER", league:"International",foundingYear:1889 },
  { name:"Belgium",               abbreviation:"BEL",  sport:"SOCCER", league:"International",foundingYear:1895 },
  { name:"Croatia",               abbreviation:"CRO",  sport:"SOCCER", league:"International",foundingYear:1912 },
  { name:"Senegal",               abbreviation:"SEN",  sport:"SOCCER", league:"International",foundingYear:1960 },
  { name:"Morocco",               abbreviation:"MAR",  sport:"SOCCER", league:"International",foundingYear:1955 },
  { name:"Mexico",                abbreviation:"MEX",  sport:"SOCCER", league:"International",foundingYear:1927 },
  { name:"USA",                   abbreviation:"USA",  sport:"SOCCER", league:"International",foundingYear:1913 },
  { name:"Colombia",              abbreviation:"COL",  sport:"SOCCER", league:"International",foundingYear:1924 },
  { name:"Uruguay",               abbreviation:"URU",  sport:"SOCCER", league:"International",foundingYear:1900 },
  { name:"Japan",                 abbreviation:"JPN",  sport:"SOCCER", league:"International",foundingYear:1921 },
  { name:"South Korea",           abbreviation:"KOR",  sport:"SOCCER", league:"International",foundingYear:1928 },
  { name:"Australia",             abbreviation:"AUS",  sport:"SOCCER", league:"International",foundingYear:1961 },
  { name:"Ghana",                 abbreviation:"GHA",  sport:"SOCCER", league:"International",foundingYear:1957 },
  { name:"Nigeria",               abbreviation:"NGA",  sport:"SOCCER", league:"International",foundingYear:1945 },
  { name:"Ecuador",               abbreviation:"ECU",  sport:"SOCCER", league:"International",foundingYear:1925 },
  { name:"Canada",                abbreviation:"CAN",  sport:"SOCCER", league:"International",foundingYear:1912 },
];

export const SPORTS_TEAMS: SportsTeam[] = RAW_TEAMS.map(t => ({
  ...t, imprint: teamImprint(t.foundingYear),
}));

const LEAGUE_FALLBACKS: Record<string, string[]> = {
  NBA: ["Western", "Eastern"],
  MLB: ["AL East", "AL Central", "AL West", "NL East", "NL Central", "NL West"],
  NHL: ["Pacific", "Central", "Atlantic", "Metropolitan"],
  MLS: ["MLS"],
  "Premier League": ["Premier League"],
  "La Liga": ["La Liga"],
  Bundesliga: ["Bundesliga"],
  "Serie A": ["Serie A"],
  "Ligue 1": ["Ligue 1"],
  Eredivisie: ["Eredivisie"],
  "Liga MX": ["Liga MX"],
  "Scottish Prem": ["Scottish Prem"],
  "Primeira Liga": ["Primeira Liga"],
  International: ["International"],
  UCL: ["UCL"],
  UEL: ["UEL"],
  UECL: ["UECL"],
  NFL: ["NFC East", "NFC North", "NFC South", "NFC West", "AFC East", "AFC North", "AFC South", "AFC West"],
};

// ── Season status ────────────────────────────────────────────────────────────
export const LEAGUE_SEASONS: Record<string, { active: boolean; phase: string; emoji: string }> = {
  "NBA":          { active:true,  phase:"Playoffs",        emoji:"🏀" },
  "MLB":          { active:true,  phase:"Regular Season",  emoji:"⚾" },
  "NHL":          { active:true,  phase:"Playoffs",        emoji:"🏒" },
  "NFL":          { active:false, phase:"Offseason",       emoji:"🏈" },
  "MLS":          { active:true,  phase:"Regular Season",  emoji:"⚽" },
  "Premier League":{ active:true, phase:"Late Season",     emoji:"🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "La Liga":      { active:true,  phase:"Late Season",     emoji:"🇪🇸" },
  "Bundesliga":   { active:true,  phase:"Late Season",     emoji:"🇩🇪" },
  "Serie A":      { active:true,  phase:"Late Season",     emoji:"🇮🇹" },
  "Ligue 1":      { active:true,  phase:"Late Season",     emoji:"🇫🇷" },
  "Eredivisie":   { active:true,  phase:"Late Season",     emoji:"🇳🇱" },
  "Liga MX":      { active:true,  phase:"Clausura",        emoji:"🇲🇽" },
  "UCL":          { active:true,  phase:"Semifinal Stage", emoji:"🏆" },
  "UEL":          { active:true,  phase:"Quarterfinals",   emoji:"🥈" },
  "UECL":         { active:true,  phase:"Quarterfinals",   emoji:"🥉" },
  "Scottish Prem":{ active:true,  phase:"Late Season",     emoji:"🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  "Primeira Liga":{ active:true,  phase:"Late Season",     emoji:"🇵🇹" },
  "International":{ active:true,  phase:"World Cup Quals", emoji:"🌍" },
};

// ── Matchup analysis ─────────────────────────────────────────────────────────
export interface MatchupResult {
  team: SportsTeam;
  dateEnergy: number;
  dateCompound: number;
  teamImprint: number;
  harmony: "CHEAT CODE" | "STRONG CODE" | "LEAN" | "AVOID" | "FADE";
  harmonyScore: number;
  explanation: string;
  betType: string;
}

function digSum(n: number): number {
  return [...String(Math.abs(n))].reduce((a, d) => a + +d, 0);
}

export function analyzeMatchup(
  team: SportsTeam,
  month: number, day: number, year: number
): MatchupResult {
  const dateFull = [...`${String(month).padStart(2,"0")}${String(day).padStart(2,"0")}${year}`].reduce((a,d)=>a+(+d),0);
  const dateEnergy = reduce(dateFull);
  const imp = team.imprint ?? 1;

  const diff = Math.abs(dateEnergy - imp);
  const dateCompounds: number[] = [];
  let tmp = dateFull;
  while (tmp > 9) { dateCompounds.push(tmp); tmp = digSum(tmp); }
  dateCompounds.push(tmp);

  const exactMatch = dateEnergy === imp || dateFull === team.foundingYear % 100;
  const compoundSupport = dateCompounds.includes(imp) || dateCompounds.some(c => reduce(c) === imp);
  const complementary = (dateEnergy + imp) === 10 || (dateEnergy + imp) === 11;
  const masterMatch = (imp === 11 || imp === 22) && (dateEnergy === 2 || dateEnergy === 4 || dateEnergy === 11 || dateEnergy === 22);

  let harmony: MatchupResult["harmony"];
  let harmonyScore: number;

  if (exactMatch || masterMatch) {
    harmony = "CHEAT CODE"; harmonyScore = 95;
  } else if (compoundSupport || diff === 0) {
    harmony = "STRONG CODE"; harmonyScore = 82;
  } else if (complementary || diff <= 2) {
    harmony = "LEAN"; harmonyScore = 68;
  } else if (diff >= 5 && dateEnergy > imp) {
    harmony = "FADE"; harmonyScore = 30;
  } else {
    harmony = "AVOID"; harmonyScore = 45;
  }

  const explanation = exactMatch
    ? `Date ${dateFull}→${dateEnergy} MATCHES imprint ${imp} — Cheat Code activated`
    : masterMatch
    ? `Master number alignment — ${imp} resonates with today's date energy`
    : compoundSupport
    ? `Date compound chain supports imprint ${imp}`
    : complementary
    ? `Complementary pair — date ${dateEnergy} + imprint ${imp} = ${dateEnergy+imp}`
    : `Date energy ${dateEnergy} vs imprint ${imp} — diff ${diff} — tension`;

  const betType = harmony === "CHEAT CODE" ? "ML + Spread"
    : harmony === "STRONG CODE" ? "ML"
    : harmony === "LEAN" ? "Small ML"
    : "Fade or Skip";

  return { team, dateEnergy, dateCompound: dateFull, teamImprint: imp, harmony, harmonyScore, explanation, betType };
}

// ── Generate smart matchups from a league ────────────────────────────────────
export interface SmartMatchup {
  home: MatchupResult;
  away: MatchupResult;
  predictedWinner: MatchupResult;
  confidence: number;
  bestPlay: string;
  overUnder: string;
  parlayWorthy: boolean;
}

export function generateLeagueMatchups(
  league: string,
  month: number, day: number, year: number,
  count = 4
): SmartMatchup[] {
  const exactLeague = SPORTS_TEAMS.filter(t => t.league === league);
  const fallbackGroups = LEAGUE_FALLBACKS[league] ?? [];
  const fallbackTeams = fallbackGroups.flatMap(group => SPORTS_TEAMS.filter(t => t.league === group));
  const teams = Array.from(new Map([...exactLeague, ...fallbackTeams].map(t => [t.name, t])).values());
  if (teams.length < 2) return [];

  const analyzed = teams
    .map(t => analyzeMatchup(t, month, day, year))
    .sort((a, b) => b.harmonyScore - a.harmonyScore);

  const matchups: SmartMatchup[] = [];
  const used = new Set<string>();

  for (let i = 0; i < analyzed.length && matchups.length < count; i++) {
    if (used.has(analyzed[i].team.name)) continue;
    const home = analyzed[i];
    const awayIdx = analyzed.findIndex((a, idx) => idx !== i && !used.has(a.team.name));
    if (awayIdx === -1) continue;
    const away = analyzed[awayIdx];
    used.add(home.team.name);
    used.add(away.team.name);

    const winner = home.harmonyScore >= away.harmonyScore ? home : away;
    const confidence = Math.min(99, 50 + Math.abs(home.harmonyScore - away.harmonyScore));

    const bestPlay = winner.harmony === "CHEAT CODE"
      ? `${winner.team.abbreviation} ML + Spread`
      : winner.harmony === "STRONG CODE"
      ? `${winner.team.abbreviation} ML`
      : `${winner.team.abbreviation} Small ML`;

    const combinedEnergy = reduce(home.teamImprint + away.teamImprint);
    const overUnder = combinedEnergy >= 6 ? "OVER" : combinedEnergy === 5 ? "NEUTRAL" : "UNDER";

    matchups.push({
      home, away, predictedWinner: winner, confidence, bestPlay, overUnder,
      parlayWorthy: winner.harmony === "CHEAT CODE" || winner.harmony === "STRONG CODE",
    });
  }
  return matchups;
}

export function analyzeSlate(
  teams: SportsTeam[],
  month: number, day: number, year: number
): MatchupResult[] {
  const safeTeams = teams.length > 0 ? teams : SPORTS_TEAMS.filter(t => t.sport === "SOCCER");
  return safeTeams
    .map(t => analyzeMatchup(t, month, day, year))
    .sort((a, b) => b.harmonyScore - a.harmonyScore);
}
