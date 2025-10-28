// API utility functions for fetching NBA data and storylines

const ESPN_NBA_SCOREBOARD =
  "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";
const CORS_PROXY = "https://corsproxy.io/?";
const REDDIT_BASE_URL = "https://www.reddit.com";

/**
 * Fetch NBA games from ESPN API for a given date
 */
export async function fetchNBAGames(dateOffset = 0) {
  try {
    const today = new Date();
    const targetDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + dateOffset
    );

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    const dateString = `${year}${month}${day}`;

    console.log(`📅 Fetching games for: ${dateString}`);

    const response = await fetch(`${ESPN_NBA_SCOREBOARD}?dates=${dateString}`);

    if (!response.ok) {
      throw new Error("Failed to fetch NBA games from ESPN");
    }

    const data = await response.json();

    const games =
      data.events?.map((event) => {
        const competition = event.competitions[0];
        const homeTeam = competition.competitors.find(
          (team) => team.homeAway === "home"
        );
        const awayTeam = competition.competitors.find(
          (team) => team.homeAway === "away"
        );

        return {
          id: event.id,
          homeTeam: homeTeam.team.displayName,
          awayTeam: awayTeam.team.displayName,
          homeTeamAbbr: homeTeam.team.abbreviation,
          awayTeamAbbr: awayTeam.team.abbreviation,
          homeScore: parseInt(homeTeam.score) || null,
          awayScore: parseInt(awayTeam.score) || null,
          homeRecord: homeTeam.records?.[0]?.summary || "N/A",
          awayRecord: awayTeam.records?.[0]?.summary || "N/A",
          status: competition.status.type.description,
          statusState: competition.status.type.state,
          time: event.date
            ? new Date(event.date).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            : null,
          venue: competition.venue?.fullName,
          broadcast: event.competitions[0].broadcasts?.[0]?.names?.[0] || null,
        };
      }) || [];

    // Calculate drama scores
    const gamesWithDrama = games.map((game) => ({
      ...game,
      dramaScore: calculateDramaScore(game),
    }));

    return gamesWithDrama;
  } catch (error) {
    console.error("Error fetching NBA games:", error);
    throw error;
  }
}

/**
 * Calculate drama score for a game (1-10)
 */
function calculateDramaScore(game) {
  let score = 5; // Base score

  const { homeTeam, awayTeam, homeRecord, awayRecord } = game;

  // High-profile teams boost drama
  const bigMarketTeams = [
    "Lakers",
    "Celtics",
    "Warriors",
    "Heat",
    "Knicks",
    "Bulls",
    "Nets",
  ];
  const superstarTeams = [
    "Lakers",
    "Celtics",
    "Warriors",
    "Mavericks",
    "Bucks",
    "Suns",
    "Nuggets",
    "76ers",
  ];

  if (
    bigMarketTeams.some(
      (team) => homeTeam.includes(team) || awayTeam.includes(team)
    )
  ) {
    score += 1;
  }

  if (
    superstarTeams.some(
      (team) => homeTeam.includes(team) || awayTeam.includes(team)
    )
  ) {
    score += 1;
  }

  // Historic rivalries
  const rivalries = [
    ["Lakers", "Celtics"],
    ["Lakers", "Clippers"],
    ["Knicks", "Nets"],
    ["Warriors", "Cavaliers"],
    ["Heat", "Celtics"],
    ["76ers", "Celtics"],
  ];

  const isRivalry = rivalries.some(
    ([team1, team2]) =>
      (homeTeam.includes(team1) && awayTeam.includes(team2)) ||
      (homeTeam.includes(team2) && awayTeam.includes(team1))
  );

  if (isRivalry) {
    score += 2;
  }

  // Both teams good record = playoff implications
  const parseRecord = (record) => {
    if (record === "N/A") return 0;
    const wins = parseInt(record.split("-")[0]);
    return wins;
  };

  const homeWins = parseRecord(homeRecord);
  const awayWins = parseRecord(awayRecord);

  if (homeWins >= 30 && awayWins >= 30) {
    score += 1.5;
  }

  return Math.min(Math.round(score), 10);
}

/**
 * Fetch storylines from Reddit with synthesis
 */
export async function fetchRedditStorylines(homeTeam, awayTeam) {
  try {
    console.log(`🔍 Searching Reddit for: ${homeTeam} vs ${awayTeam}`);

    const homeKeywords = extractTeamKeywords(homeTeam);
    const awayKeywords = extractTeamKeywords(awayTeam);

    let allPosts = [];

    // Fetch hot posts
    try {
      const hotUrl = `${REDDIT_BASE_URL}/r/nba/hot.json?limit=100`;
      const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(hotUrl)}`;
      const hotResponse = await fetch(proxiedUrl);

      if (hotResponse.ok) {
        const hotData = await hotResponse.json();
        allPosts = [...allPosts, ...(hotData.data?.children || [])];
      }
    } catch (err) {
      console.error("Error fetching hot posts:", err);
    }

    // Fetch new posts
    try {
      const newUrl = `${REDDIT_BASE_URL}/r/nba/new.json?limit=100`;
      const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(newUrl)}`;
      const newResponse = await fetch(proxiedUrl);

      if (newResponse.ok) {
        const newData = await newResponse.json();
        allPosts = [...allPosts, ...(newData.data?.children || [])];
      }
    } catch (err) {
      console.error("Error fetching new posts:", err);
    }

    // Remove duplicates
    const uniquePosts = Array.from(
      new Map(allPosts.map((post) => [post.data.id, post])).values()
    );

    // Categorize and filter posts
    const categorizedPosts = categorizePosts(
      uniquePosts,
      homeKeywords,
      awayKeywords
    );

    return categorizedPosts;
  } catch (error) {
    console.error("Error fetching Reddit storylines:", error);
    return {
      drama: [],
      matchup: [],
      news: [],
      buzz: [],
    };
  }
}

/**
 * Categorize posts into drama, matchup, news, buzz
 */
function categorizePosts(posts, homeKeywords, awayKeywords) {
  const categories = {
    drama: [], // Beef, trash talk, controversies
    matchup: [], // Both teams mentioned
    news: [], // Team-specific news
    buzz: [], // General relevant posts
  };

  posts.forEach((post) => {
    const title = post.data.title.toLowerCase();
    const selftext = (post.data.selftext || "").toLowerCase();
    const content = title + " " + selftext;

    let homeMatches = 0;
    let awayMatches = 0;

    homeKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, "gi");
      const matches = content.match(regex);
      if (matches) homeMatches += matches.length;
    });

    awayKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, "gi");
      const matches = content.match(regex);
      if (matches) awayMatches += matches.length;
    });

    const storyline = {
      id: post.data.id,
      title: post.data.title,
      author: post.data.author,
      upvotes: post.data.ups,
      comments: post.data.num_comments,
      url: `https://reddit.com${post.data.permalink}`,
      selftext: post.data.selftext,
      created: getTimeAgo(post.data.created_utc),
    };

    // Categorize based on content
    const dramaKeywords = [
      "beef",
      "trash talk",
      "fight",
      "ejected",
      "technical",
      "suspended",
      "fined",
      "flagrant",
      "controversy",
    ];
    const hasDrama = dramaKeywords.some((keyword) => content.includes(keyword));

    if (hasDrama && (homeMatches > 0 || awayMatches > 0)) {
      categories.drama.push(storyline);
    } else if (homeMatches > 0 && awayMatches > 0) {
      categories.matchup.push(storyline);
    } else if (homeMatches >= 2 || awayMatches >= 2) {
      categories.news.push(storyline);
    } else if (homeMatches > 0 || awayMatches > 0) {
      categories.buzz.push(storyline);
    }
  });

  // Sort each category by upvotes and limit
  Object.keys(categories).forEach((key) => {
    categories[key] = categories[key]
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 5);
  });

  return categories;
}

/**
 * Extract team keywords
 */
function extractTeamKeywords(teamName) {
  const teamMappings = {
    Lakers: ["Lakers", "LAL", "LeBron", "Anthony Davis", "AD"],
    Celtics: ["Celtics", "BOS", "Tatum", "Brown", "Jayson", "Jaylen"],
    Warriors: ["Warriors", "GSW", "Curry", "Steph", "Dubs", "Klay"],
    Heat: ["Heat", "MIA", "Butler", "Jimmy", "Bam"],
    Knicks: ["Knicks", "NYK", "Brunson", "Randle"],
    Bulls: ["Bulls", "CHI", "DeRozan", "LaVine"],
    Nets: ["Nets", "BKN", "Brooklyn", "Mikal"],
    Sixers: ["76ers", "Sixers", "PHI", "Embiid", "Maxey"],
    Clippers: ["Clippers", "LAC", "Kawhi", "PG", "Harden"],
    Mavericks: ["Mavericks", "Mavs", "DAL", "Luka", "Doncic", "Kyrie"],
    Rockets: ["Rockets", "HOU", "Houston"],
    Bucks: ["Bucks", "MIL", "Giannis", "Dame", "Lillard"],
    Raptors: ["Raptors", "TOR", "Toronto", "Scottie"],
    Suns: ["Suns", "PHX", "Booker", "Durant", "KD", "Beal"],
    Nuggets: ["Nuggets", "DEN", "Jokic", "Murray", "Jamal"],
    Cavaliers: ["Cavaliers", "Cavs", "CLE", "Mitchell", "Garland"],
    "Trail Blazers": ["Blazers", "POR", "Portland"],
    Spurs: ["Spurs", "SAS", "Wembanyama", "Wemby"],
    Grizzlies: ["Grizzlies", "MEM", "Morant", "Ja"],
    Pelicans: ["Pelicans", "NOP", "Zion", "Ingram"],
    Thunder: ["Thunder", "OKC", "SGA", "Shai"],
    Jazz: ["Jazz", "UTA", "Utah"],
    Kings: ["Kings", "SAC", "Fox", "Sabonis"],
    Hawks: ["Hawks", "ATL", "Trae", "Young"],
    Hornets: ["Hornets", "CHA", "LaMelo", "Ball"],
    Magic: ["Magic", "ORL", "Banchero", "Paolo"],
    Pistons: ["Pistons", "DET", "Cade", "Cunningham"],
    Pacers: ["Pacers", "IND", "Haliburton"],
    Wizards: ["Wizards", "WAS", "Poole", "Kuzma"],
    Timberwolves: ["Timberwolves", "Wolves", "MIN", "Edwards", "Ant", "Towns"],
  };

  for (const [key, values] of Object.entries(teamMappings)) {
    if (teamName.includes(key)) {
      return values;
    }
  }

  const words = teamName.split(" ");
  return [words[words.length - 1]];
}

/**
 * Convert Unix timestamp to relative time
 */
function getTimeAgo(timestamp) {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}m ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diff / 86400);
    return `${days}d ago`;
  }
}
