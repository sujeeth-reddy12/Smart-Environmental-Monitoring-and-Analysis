import { useState, useMemo } from 'react'
import { FaChartLine, FaInfoCircle } from 'react-icons/fa'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useCity } from '../context/CityContext'
import { getCityDetails } from '../utils/cityHelper'
import './TrendsPage.css'

function TrendsPage() {
  const { selectedCity } = useCity()
  const [activeMetric, setActiveMetric] = useState('aqi')

  const cityDetails = getCityDetails(selectedCity)

  // 24 Hour Trend Timeline Data
  const trendData = useMemo(() => {
    const baseAqi = cityDetails.aqi
    const numPm25 = cityDetails.pm25
    const numPm10 = cityDetails.pm10
    const numTemp = cityDetails.temp
    const numHumidity = cityDetails.humidity

    return [
      { time: '12 AM', aqi: Math.round(baseAqi * 0.92), pm25: Number((numPm25 * 0.9).toFixed(1)), pm10: Number((numPm10 * 0.9).toFixed(1)), temp: Number((numTemp - 3).toFixed(1)), humidity: numHumidity + 8 },
      { time: '4 AM', aqi: Math.round(baseAqi * 0.88), pm25: Number((numPm25 * 0.85).toFixed(1)), pm10: Number((numPm10 * 0.85).toFixed(1)), temp: Number((numTemp - 4).toFixed(1)), humidity: numHumidity + 12 },
      { time: '8 AM', aqi: Math.round(baseAqi * 1.05), pm25: Number((numPm25 * 1.05).toFixed(1)), pm10: Number((numPm10 * 1.05).toFixed(1)), temp: Number((numTemp - 1).toFixed(1)), humidity: numHumidity + 3 },
      { time: '12 PM', aqi: Math.round(baseAqi * 1.15), pm25: Number((numPm25 * 1.15).toFixed(1)), pm10: Number((numPm10 * 1.15).toFixed(1)), temp: Number((numTemp + 2).toFixed(1)), humidity: numHumidity - 10 },
      { time: '4 PM', aqi: baseAqi, pm25: Number(numPm25.toFixed(1)), pm10: Number(numPm10.toFixed(1)), temp: Number(numTemp.toFixed(1)), humidity: numHumidity },
      { time: '8 PM', aqi: Math.round(baseAqi * 1.08), pm25: Number((numPm25 * 1.08).toFixed(1)), pm10: Number((numPm10 * 1.08).toFixed(1)), temp: Number((numTemp - 2).toFixed(1)), humidity: numHumidity + 4 },
      { time: '12 AM', aqi: Math.round(baseAqi * 0.95), pm25: Number((numPm25 * 0.95).toFixed(1)), pm10: Number((numPm10 * 0.95).toFixed(1)), temp: Number((numTemp - 3).toFixed(1)), humidity: numHumidity + 9 },
    ]
  }, [cityDetails])

  return (
    <div className="trends-page-container">
      {/* Header Banner */}
      <section className="trends-header-banner">
        <div className="trends-header-text">
          <div className="trends-kicker">
            <FaChartLine /> ENVIRONMENTAL TRENDS & ANALYTICS
          </div>
          <h1>24-Hour Environmental Trends ({selectedCity})</h1>
          <p>Continuous parameter monitoring and hourly trend analysis for {selectedCity}, {cityDetails.state}.</p>
        </div>
      </section>

      {/* Main Chart Card */}
      <div className="dash-card">
        <div className="dash-card__header">
          <div className="heading-with-sub">
            <FaChartLine className="header-icon-blue" />
            <h3>24-Hour Hourly Curve</h3>
            <span className="sub-tag">({selectedCity})</span>
          </div>

          <div className="metric-tabs">
            {['aqi', 'pm25', 'pm10', 'temp', 'humidity'].map((m) => (
              <button
                key={m}
                type="button"
                className={`metric-tab ${activeMetric === m ? 'metric-tab--active' : ''}`}
                onClick={() => setActiveMetric(m)}
              >
                {m === 'temp' ? 'Temperature' : m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-container-wrap">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="trendsPageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                formatter={(val) => [`${val}`, activeMetric.toUpperCase()]}
              />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke="#2563eb"
                strokeWidth={3}
                fill="url(#trendsPageGradient)"
                dot={{ r: 4, fill: '#2563eb' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="trends-stats-grid">
        <div className="dash-card">
          <span className="stat-label">Peak AQI (24h)</span>
          <strong className="stat-val">{Math.round(cityDetails.aqi * 1.15)}</strong>
          <small>Recorded around 12:00 PM</small>
        </div>
        <div className="dash-card">
          <span className="stat-label">Minimum AQI (24h)</span>
          <strong className="stat-val text-green">{Math.round(cityDetails.aqi * 0.88)}</strong>
          <small>Recorded around 4:00 AM</small>
        </div>
        <div className="dash-card">
          <span className="stat-label">24-Hour Average</span>
          <strong className="stat-val">{cityDetails.aqi}</strong>
          <small>Overall status: {cityDetails.status}</small>
        </div>
      </div>
    </div>
  )
}

export default TrendsPage
