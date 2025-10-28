import React from 'react'
import './GameCard.css'

function GameCard({ game, isSelected, isInWatchlist, onClick, onToggleWatchlist }) {
  const {
    homeTeam,
    awayTeam,
    time,
    status,
    statusState,
    homeScore,
    awayScore,
    homeRecord,
    awayRecord,
    dramaScore,
    broadcast
  } = game

  const getDramaFlames = (score) => {
    const flames = '🔥'.repeat(Math.ceil(score / 2))
    return flames
  }

  const getDramaLabel = (score) => {
    if (score >= 9) return 'MUST WATCH'
    if (score >= 7) return 'HIGH DRAMA'
    if (score >= 5) return 'Worth Watching'
    return 'Casual Game'
  }

  const isLive = statusState === 'in'
  const isCompleted = statusState === 'post'

  return (
    <div
      className={`game-card ${isSelected ? 'selected' : ''} ${isLive ? 'live' : ''}`}
      onClick={onClick}
    >
      <div className="drama-header">
        <div className="drama-flames">{getDramaFlames(dramaScore)}</div>
        <div className="drama-info">
          <span className="drama-score">{dramaScore}/10</span>
          <span className="drama-label">{getDramaLabel(dramaScore)}</span>
        </div>
        <button
          className={`watchlist-btn ${isInWatchlist ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleWatchlist()
          }}
          title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {isInWatchlist ? '★' : '☆'}
        </button>
      </div>

      <div className="game-status">
        <span className={`status-badge ${status.toLowerCase().replace(/\s/g, '-')}`}>
          {isLive && '🔴 '}{status}
        </span>
        {time && !isCompleted && <span className="game-time">{time}</span>}
        {broadcast && <span className="broadcast">📺 {broadcast}</span>}
      </div>

      <div className="matchup">
        <div className="team away-team">
          <div className="team-info">
            <span className="team-name">{awayTeam}</span>
            <span className="team-record">{awayRecord}</span>
          </div>
          {awayScore !== null && (
            <span className="score">{awayScore}</span>
          )}
        </div>

        <div className="vs-divider">@</div>

        <div className="team home-team">
          <div className="team-info">
            <span className="team-name">{homeTeam}</span>
            <span className="team-record">{homeRecord}</span>
          </div>
          {homeScore !== null && (
            <span className="score">{homeScore}</span>
          )}
        </div>
      </div>

      {isSelected && (
        <div className="selected-indicator">
          📖 Reading the story...
        </div>
      )}
    </div>
  )
}

export default GameCard