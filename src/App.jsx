import { useState, useEffect } from 'react'
import './App.css'
import GameCard from './components/GameCard'
import GameBriefing from './components/GameBriefing'
import { fetchNBAGames, fetchRedditStorylines } from './utils/api'

function App() {
  const [games, setGames] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)
  const [storylines, setStorylines] = useState({ drama: [], matchup: [], news: [], buzz: [] })
  const [loading, setLoading] = useState(true)
  const [loadingStorylines, setLoadingStorylines] = useState(false)
  const [error, setError] = useState(null)
  const [dateOffset, setDateOffset] = useState(0)
  const [watchlist, setWatchlist] = useState([])

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nba-watchlist')
    if (saved) {
      setWatchlist(JSON.parse(saved))
    }
  }, [])

  // Fetch games
  useEffect(() => {
    const loadGames = async () => {
      setLoading(true)
      setError(null)
      try {
        const gamesData = await fetchNBAGames(dateOffset)
        // Sort by drama score
        const sorted = gamesData.sort((a, b) => b.dramaScore - a.dramaScore)
        setGames(sorted)
      } catch (err) {
        setError(`Failed to fetch games: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [dateOffset])

  // Fetch storylines
  useEffect(() => {
    if (selectedGame) {
      const loadStorylines = async () => {
        setLoadingStorylines(true)
        try {
          const storylinesData = await fetchRedditStorylines(
            selectedGame.homeTeam,
            selectedGame.awayTeam
          )
          setStorylines(storylinesData)
        } catch (err) {
          console.error('Failed to fetch storylines:', err)
          setStorylines({ drama: [], matchup: [], news: [], buzz: [] })
        } finally {
          setLoadingStorylines(false)
        }
      }

      loadStorylines()
    }
  }, [selectedGame])

  const handleGameClick = (game) => {
    setSelectedGame(game)
    setStorylines({ drama: [], matchup: [], news: [], buzz: [] })
  }

  const toggleWatchlist = (gameId) => {
    const newWatchlist = watchlist.includes(gameId)
      ? watchlist.filter(id => id !== gameId)
      : [...watchlist, gameId]

    setWatchlist(newWatchlist)
    localStorage.setItem('nba-watchlist', JSON.stringify(newWatchlist))
  }

  const getDateString = () => {
    const today = new Date()
    const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dateOffset)

    return targetDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="basketball-spinner"></div>
          <p>Loading the drama...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>😞 Oops!</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🎬 Court Chronicles</h1>
          <p className="tagline">Every game is a story worth watching</p>
        </div>
      </header>

      <div className="date-navigation">
        <button onClick={() => setDateOffset(dateOffset - 1)} className="nav-button">
          ← Previous Day
        </button>
        <div className="date-display">
          <h2>{getDateString()}</h2>
          {dateOffset === 0 && <span className="today-badge">Today</span>}
        </div>
        <button onClick={() => setDateOffset(dateOffset + 1)} className="nav-button">
          Next Day →
        </button>
      </div>

      <div className="content">
        <div className="games-section">
          <div className="section-header">
            <h3>🔥 Today's Matchups</h3>
            <p className="section-subtitle">Sorted by drama level</p>
          </div>

          {games.length === 0 ? (
            <div className="no-games">
              <p>No games scheduled for this day</p>
              <p className="hint">Try checking another date</p>
            </div>
          ) : (
            <div className="games-grid">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isSelected={selectedGame?.id === game.id}
                  isInWatchlist={watchlist.includes(game.id)}
                  onClick={() => handleGameClick(game)}
                  onToggleWatchlist={() => toggleWatchlist(game.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="briefing-section">
          {selectedGame ? (
            <GameBriefing
              game={selectedGame}
              storylines={storylines}
              loading={loadingStorylines}
            />
          ) : (
            <div className="no-selection">
              <div className="empty-state">
                <h3>👈 Select a game</h3>
                <p>Click any matchup to get the full story:</p>
                <ul className="features-list">
                  <li>🎭 Drama & storylines</li>
                  <li>⚔️ Key player matchups</li>
                  <li>📊 What's at stake</li>
                  <li>🗣️ What fans are saying</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="app-footer">
        <p>🏀 Powered by ESPN & Reddit r/nba</p>
        <p className="footer-tagline">Making every NBA game feel like must-watch cinema</p>
      </footer>
    </div>
  )
}

export default App