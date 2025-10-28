# NBA Storylines

## Problem Statement

Casual fans want quick context behind NBA games - recent meetings, margins, and what fans/media are talking about - without scrolling for 20 minutes.

## Solution

Pick two teams and get bite-size storylines:

- Recent meetings, average margin, and blowouts using ESPN's public JSON schedule endpoints.
- Top r/nba threads from the past week that mention both teams, with simple tags for drama/quotes/trades.

## APIs Used

- **ESPN public JSON**: team schedule and recent meetings.
- Team schedule: https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/{teamId}/schedule
- **Reddit public JSON**: search r/nba for posts mentioning both teams (no auth required).
- Search: https://www.reddit.com/r/nba/search.json?q=<teamA> <teamB>&restrict_sr=1&t=week&sort=top

## Features

- Team vs team selector
- Auto-generated storylines (record, margins, blowouts, upcoming game)
- Top r/nba posts with basic tags (fight, ejection, trade, injury, rivalry, quote)
- Loading and error states

## Setup

1. `npm install`
2. `npm run dev`
3. Open the local URL (Vite usually shows it in your terminal)

## AI Assistance

I used ChatGPT to design the app structure, write API helpers for ESPN/Reddit, and implement simple summarization logic (record, margins, tags). I customized team defaults, styles, and keywords for detecting drama or trade talk. The structure (React hooks, useEffect, loading/error states, README with AI Assistance) follows the project requirements.

## Notes

- These ESPN and Reddit endpoints typically work from the browser. If your network blocks them, try a different network. If needed, a small proxy can be added later.
- No API keys required.
