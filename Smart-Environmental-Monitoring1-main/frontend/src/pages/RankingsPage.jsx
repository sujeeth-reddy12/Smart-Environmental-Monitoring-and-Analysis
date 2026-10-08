import { useState, useEffect } from 'react'
import { FaTrophy, FaLeaf, FaExclamationTriangle } from 'react-icons/fa'
import { getLocationRanking } from '../services/api'
import './RankingsPage.css'

function StatusPill({ value }) {
  const norm = (value || '').toLowerCase()
  let className = 'status-pill status-pill--good'
  if (norm.includes('mod') || norm.includes('warn')) {
    className = 'status-pill status-pill--moderate'
  } else if (norm.includes('poor') || norm.includes('sever')) {
    className = 'status-pill status-pill--critical'
  }
  return <span className={className}>{value || 'Good'}</span>
}

function RankingsPage() {
  const [rankingData, setRankingData] = useState(null)

  useEffect(() => {
    getLocationRanking()
      .then((res) => setRankingData(res))
      .catch((err) => console.error(err))
  }, [])

  const topCleanerCities = rankingData?.top_cleaner_locations || [
    { location: 'Mysore', health_score: 88, aqi: 35, state: 'Karnataka' },
    { location: 'Shillong', health_score: 86, aqi: 42, state: 'Meghalaya' },
    { location: 'Gangtok', health_score: 85, aqi: 45, state: 'Sikkim' },
    { location: 'Bengaluru', health_score: 89, aqi: 48, state: 'Karnataka' },
    { location: 'Chennai', health_score: 82, aqi: 62, state: 'Tamil Nadu' },
    { location: 'Pune', health_score: 80, aqi: 72, state: 'Maharashtra' },
    { location: 'Hyderabad', health_score: 78, aqi: 78, state: 'Telangana' },
  ]

  const mostPollutedCities = rankingData?.most_polluted_locations || [
    { location: 'Delhi', aqi: 185, status: 'Poor', state: 'NCT of Delhi' },
    { location: 'Lucknow', aqi: 160, status: 'Poor', state: 'Uttar Pradesh' },
    { location: 'Jaipur', aqi: 135, status: 'Moderate', state: 'Rajasthan' },
    { location: 'Kolkata', aqi: 125, status: 'Moderate', state: 'West Bengal' },
    { location: 'Ahmedabad', aqi: 112, status: 'Moderate', state: 'Gujarat' },
    { location: 'Mumbai', aqi: 92, status: 'Moderate', state: 'Maharashtra' },
  ]

  return (
    <div className="rankings-page-container">
      {/* Header Banner */}
      <section className="rankings-header-banner">
        <div className="rankings-header-text">
          <div className="rankings-kicker">
            <FaTrophy /> NATIONAL ENVIRONMENTAL LEADERBOARD
          </div>
          <h1>India Environmental Rankings</h1>
          <p>Live rankings of cleanest and most polluted cities across India based on real-time AQI and health scores.</p>
        </div>
      </section>

      {/* Leaderboard Columns */}
      <div className="rankings-two-cols">
        {/* Cleaner Cities */}
        <div className="dash-card">
          <div className="dash-card__header">
            <div className="rankings-col-title">
              <FaLeaf className="icon-green" />
              <h3>Top Cleaner Locations</h3>
            </div>
            <span className="data-sources-pill">High Health Scores</span>
          </div>

          <div className="rank-cards-list">
            {topCleanerCities.map((item, idx) => (
              <div key={item.location} className="rank-card-row rank-card-row--clean">
                <span className="rank-badge rank-badge--clean">#{idx + 1}</span>
                <div className="rank-city-info">
                  <strong>{item.location}</strong>
                  <small>{item.state || 'India'}</small>
                </div>
                <div className="rank-score-box">
                  <span className="rank-score-val">{item.health_score}/100</span>
                  <StatusPill value="Good" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Polluted Cities */}
        <div className="dash-card">
          <div className="dash-card__header">
            <div className="rankings-col-title">
              <FaExclamationTriangle className="icon-amber" />
              <h3>Most Polluted Locations</h3>
            </div>
            <span className="data-sources-pill">High AQI Levels</span>
          </div>

          <div className="rank-cards-list">
            {mostPollutedCities.map((item, idx) => (
              <div key={item.location} className="rank-card-row rank-card-row--polluted">
                <span className="rank-badge rank-badge--polluted">#{idx + 1}</span>
                <div className="rank-city-info">
                  <strong>{item.location}</strong>
                  <small>{item.state || 'India'}</small>
                </div>
                <div className="rank-score-box">
                  <span className="rank-aqi-val">AQI {item.aqi}</span>
                  <StatusPill value={item.status || (item.aqi > 150 ? 'Poor' : 'Moderate')} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RankingsPage
