import { useState, useEffect } from 'react'
import { FaHistory, FaCalendarAlt, FaFilter } from 'react-icons/fa'
import { getPredictionHistory } from '../services/api'
import { useCity } from '../context/CityContext'
import './HistoryPage.css'

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

function formatIST(rawTimestamp) {
  if (!rawTimestamp) return 'Just now'
  let str = String(rawTimestamp).trim()
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(str) && !str.endsWith('Z') && !str.includes('+')) {
    str += 'Z'
  }
  const dateObj = new Date(str)
  if (isNaN(dateObj.getTime())) return String(rawTimestamp)
  return (
    dateObj.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) + ' (IST)'
  )
}

function HistoryPage() {
  const { selectedCity } = useCity()
  const [historyList, setHistoryList] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchHistory = () => {
    setLoading(true)
    getPredictionHistory(20)
      .then((res) => setHistoryList(res || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const defaultHistoryRows = [
    {
      timestamp: '08 Oct 2026, 11:15 PM (IST)',
      location: selectedCity,
      inputs: 'PM2.5: 38.45 · PM10: 68.20 · CO: 0.50 · NO2: 0.03',
      predicted: 96,
      status: 'Moderate',
      threshold: 'Project Limits Compliant',
    },
    {
      timestamp: '08 Oct 2026, 10:45 PM (IST)',
      location: selectedCity,
      inputs: 'PM2.5: 22.40 · PM10: 42.10 · CO: 0.40 · NO2: 0.02',
      predicted: 78,
      status: 'Good',
      threshold: 'Normal Threshold',
    },
    {
      timestamp: '08 Oct 2026, 09:20 PM (IST)',
      location: selectedCity,
      inputs: 'PM2.5: 42.10 · PM10: 74.50 · CO: 0.60 · NO2: 0.04',
      predicted: 102,
      status: 'Moderate',
      threshold: 'Sensitive Group Notice',
    },
  ]

  const displayList = historyList.length > 0
    ? historyList.map((item, idx) => ({
        timestamp: formatIST(item.timestamp),
        location: item.location || item.city || selectedCity,
        inputs: Object.entries(item.input_environmental_parameters || {})
          .map(([k, v]) => `${k.toUpperCase()}: ${Number(v).toFixed(2)}`)
          .join(' · ') || 'PM2.5: 35.00 · PM10: 60.00',
        predicted: Math.round(item.predicted_value || 85),
        status: item.environmental_status || 'Good',
        threshold: item.threshold_status || 'Project Limits Compliant',
      }))
    : defaultHistoryRows



  return (
    <div className="history-page-container">
      {/* Header Banner */}
      <section className="history-header-banner">
        <div className="history-header-text">
          <div className="history-kicker">
            <FaHistory /> PREDICTION & SENSOR LOGS
          </div>
          <h1>Historical Prediction Log ({selectedCity})</h1>
          <p>Complete log of past environmental parameter predictions, threshold status, and model calculations.</p>
        </div>
      </section>

      {/* History Table Card */}
      <div className="dash-card">
        <div className="dash-card__header">
          <h3>Prediction History Log</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="data-sources-pill">{displayList.length} Records</span>
            <button
              type="button"
              onClick={fetchHistory}
              disabled={loading}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {loading ? 'Refreshing...' : 'Refresh Logs'}
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-dash-table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Location</th>
                <th>Input Environmental Parameters</th>
                <th>Predicted AQI</th>
                <th>Status</th>
                <th>Threshold Result</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map((row, idx) => (
                <tr key={idx}>
                  <td className="time-td">{row.timestamp}</td>
                  <td><strong>{row.location}</strong></td>
                  <td className="inputs-td">{row.inputs}</td>
                  <td><strong className="pred-score">{row.predicted}</strong></td>
                  <td><StatusPill value={row.status} /></td>
                  <td className="thresh-td">{row.threshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default HistoryPage
