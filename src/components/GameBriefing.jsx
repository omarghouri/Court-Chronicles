import React from 'react'
import './GameBriefing.css'

function GameBriefing({ game, storylines, loading }) {
  const { homeTeam, awayTeam, dramaScore, homeRecord, awayRecord, statusState } = game
  const { drama, matchup, news, buzz } = storylines

  const isPostGame = statusState === 'post'
  const allStories = [...drama, ...matchup, ...news, ...buzz]

  if (loading) {
    return (
      <div className="game-briefing">
        <h3>🎬 Analyzing the drama...</h3>
        <div className="briefing-loading">
          <div className="pulse"></div>
          <p>Searching through r/nba for the best storylines...</p>
        </div>
      </div>
    )
  }

  const getDramaDescription = (score) => {
    if (score >= 9) return "This is appointment television. Clear your schedule."
    if (score >= 7) return "High stakes. Big names. Don't miss this one."
    if (score >= 5) return "Solid matchup with interesting storylines."
    return "A good game if you're a fan of these teams."
  }

  return (
    <div className="game-briefing">
      <div className="briefing-header">
        <h3>🎬 {awayTeam} @ {homeTeam}</h3>
        <div className="drama-rating">
          <span className="rating-flames">{'🔥'.repeat(Math.ceil(dramaScore / 2))}</span>
          <span className="rating-score">{dramaScore}/10 Drama Score</span>
        </div>
      </div>

      <div className="the-story">
        <h4>📖 The Story</h4>
        <p className="story-description">{getDramaDescription(dramaScore)}</p>
        <div className="quick-stats">
          <div className="stat">
            <span className="stat-label">Away</span>
            <span className="stat-value">{awayRecord}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Home</span>
            <span className="stat-value">{homeRecord}</span>
          </div>
        </div>
      </div>

      {drama.length > 0 && (
        <div className="storyline-category">
          <h4>🎭 The Drama</h4>
          <p className="category-desc">Beef, trash talk, and controversies</p>
          <div className="storylines-list">
            {drama.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      )}

      {matchup.length > 0 && (
        <div className="storyline-category">
          <h4>⚔️ The Matchup</h4>
          <p className="category-desc">Head-to-head battles and rivalry moments</p>
          <div className="storylines-list">
            {matchup.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      )}

      {news.length > 0 && (
        <div className="storyline-category">
          <h4>📰 Team News</h4>
          <p className="category-desc">Latest updates and breaking news</p>
          <div className="storylines-list">
            {news.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      )}

      {buzz.length > 0 && (
        <div className="storyline-category">
          <h4>🗣️ The Buzz</h4>
          <p className="category-desc">What r/nba is talking about</p>
          <div className="storylines-list">
            {buzz.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      )}

      {allStories.length === 0 && (
        <div className="no-storylines">
          <p>🤔 No major storylines found for this matchup yet.</p>
          <p className="hint">
            {isPostGame
              ? "The post-game discussion might not be active yet. Check back soon!"
              : "This might be a under-the-radar game. Check back closer to tip-off!"}
          </p>
        </div>
      )}

      <div className="watch-guide">
        <h4>💡 What to Watch For</h4>
        <ul>
          <li>Key player matchups and individual battles</li>
          <li>Playoff positioning and seeding implications</li>
          <li>Stat chases and milestone watch</li>
          <li>Coaching adjustments and strategy</li>
        </ul>
      </div>
    </div>
  )
}

function StoryCard({ story }) {
  return (
    <div className="story-card">
      <div className="story-header">
        <h5>{story.title}</h5>
        <div className="story-meta">
          <span className="upvotes">⬆️ {story.upvotes}</span>
          <span className="comments">💬 {story.comments}</span>
        </div>
      </div>

      {story.selftext && story.selftext.length > 0 && (
        <p className="story-preview">
          {story.selftext.length > 150
            ? story.selftext.substring(0, 150) + '...'
            : story.selftext}
        </p>
      )}

      <div className="story-footer">
        <span className="story-author">u/{story.author}</span>
        <span className="story-time">{story.created}</span>
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="read-more"
          onClick={(e) => e.stopPropagation()}
        >
          Read on Reddit →
        </a>
      </div>
    </div>
  )
}

export default GameBriefing