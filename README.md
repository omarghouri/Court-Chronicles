# Court Chronicles

## Problem Statement
As an NBA fan, it’s hard to keep up with the storylines, rivalries, and off-court drama that make each game exciting. Casual fans often don’t know the background behind matchups — like past trades, playoff rivalries, or things players said in the media. I wanted a way to quickly understand the narratives behind NBA games without scrolling through Reddit or X for hours.

## Solution
Court Chronicles gives fans context behind NBA games. It combines live game data from ESPN’s API with real fan discussions from Reddit to tell the story behind each matchup. Users can pick a team, view upcoming or ongoing games, and see recent posts that reveal what’s being talked about - from player rivalries to trade rumors and viral moments.

## APIs Used
- **ESPN API**  
  - **Documentation:** [https://site.api.espn.com/apis/site/v2/sports/basketball/nba](https://site.api.espn.com/apis/site/v2/sports/basketball/nba)  
  - **Usage:** Fetches live and upcoming NBA games, team details, and match summaries.  
- **Reddit API**  
  - **Documentation:** [https://www.reddit.com/dev/api](https://www.reddit.com/dev/api)  
  - **Usage:** Fetches posts from basketball subreddits (like r/nba) filtered by team name to show trending storylines and fan discussions.

## Features
1. **Drama Scores (1-10)** assigned to every game based on factors like:
   - Historic rivalries (Lakers-Celtics gets bonus points)
   - Star player matchups (LeBron vs. anyone is more interesting)
   - Playoff implications and stakes
   - National TV broadcasts (ESPN/TNT games are highlighted)
   - Team records and competitiveness

2. **Organizes Storylines into Categories**:
   - Beef, trash talk, controversies
   - Head-to-head discussions
   - Key player availability
   - Playoff positioning, streaks
   - General fan excitement

3. **Full Game Briefings**:
   - Visual drama ratings with flame emojis
   - Team records and venue information
   - Curated Reddit posts specifically about the matchup
   - Watchlist functionality to save interesting games
   - Smart filtering that only shows highly relevant content

## Setup

1. `npm install`
2. `npm run dev`
3. Open the local URL (Vite usually shows it in your terminal)

## AI Assistance

I used ChatGPT and Claude to design the app structure, write API helpers for ESPN/Reddit, and implement simple summarization logic (record, margins, tags). I customized team defaults, styles, and keywords for detecting drama or trade talk.

What I Asked AI to Help With:

"How do I fetch NBA game data and Reddit posts without backend authentication?"

What I learned:
- ESPN provides a public scoreboard API that doesn't require keys
- Reddit's JSON API can be accessed by adding `.json` to any subreddit URL
- CORS issues can be resolved using a proxy service like corsproxy.io in development

Modifications I made:
- Debugging & Optimization: ChatGPT helped debug small logic issues when connecting both APIs and suggested ways to simplify the data rendering. This was really helpful with the Reddit API as I kept running into CORS issues.

Why it was helpful:
- Instead of struggling with API documentation and React patterns separately, Claude explained the complete pattern and why each piece works together, saving hours of trial-and-error debugging
- Claude provided the foundation for the filtering logic, then I customized it by adding NBA-specific keywords and adjusting score thresholds based on testing with real data

## Screenshot
<img width="1728" height="899" alt="Screenshot 2025-10-27 at 9 14 42 PM" src="https://github.com/user-attachments/assets/6fa3ebc3-6fcf-4afb-98a4-d0bfe24a06cb" />


## Future Improvements
- Improve data filtration so that only Reddit posts directly related to the specific game or matchup are shown (right now, some off-topic posts still appear).
- Integrate Twitter/X data for verified media quotes and player comments.
