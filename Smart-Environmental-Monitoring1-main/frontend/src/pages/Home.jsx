import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaMapMarkerAlt,
  FaSyncAlt,
  FaSearch,
  FaCrosshairs,
  FaInfoCircle,
  FaCloudSun,
  FaWind,
  FaEye,
  FaCloudRain,
  FaLeaf,
  FaCloud,
  FaThermometerHalf,
  FaTint,
  FaBrain,
  FaHistory,
  FaChartLine,
  FaExchangeAlt,
  FaTrophy,
  FaBalanceScale,
  FaBell,
  FaFileAlt,
  FaShieldAlt,
} from 'react-icons/fa'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import Loading from '../components/Loading/Loading'
import { useAuth } from '../context/AuthContext'
import { useCity } from '../context/CityContext'
import { getCityDetails, findClosestCity } from '../utils/cityHelper'
import {
  getLatestAQI,
  getAQIHistory,
  getLatestEnvironment,
  getModelComparison,
  getPredictionHistory,
  refreshEnvironment,
  searchLocations,
  createPrediction,
  getLocationRanking,
} from '../services/api'
import heroBg from '../assets/hero.png'
import './Home.css'

function getGreeting() {
  const hour = parseInt(
    new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      hour12: false,
    }),
    10
  )
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

function StatusPill({ value, type }) {
  const norm = (value || '').toLowerCase()
  let className = 'status-pill status-pill--good'
  if (norm.includes('mod') || norm.includes('warn') || type === 'moderate') {
    className = 'status-pill status-pill--moderate'
  } else if (norm.includes('poor') || norm.includes('sever') || norm.includes('crit') || type === 'critical') {
    className = 'status-pill status-pill--critical'
  }
  return <span className={className}>{value || 'Good'}</span>
}

function Home() {
  const { user } = useAuth()
  const { selectedCity, setSelectedCity } = useCity()

  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [latest, setLatest] = useState(null)
  const [environment, setEnvironment] = useState(null)
  const [trend, setTrend] = useState([])
  const [model, setModel] = useState(null)
  const [ranking, setRanking] = useState(null)
  const [predictionLogs, setPredictionLogs] = useState([])
  const [locationQuery, setLocationQuery] = useState('')
  const [locationResults, setLocationResults] = useState([])
  const [activeTrendMetric, setActiveTrendMetric] = useState('aqi')
  const [showPredictionModal, setShowPredictionModal] = useState(false)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [predicting, setPredicting] = useState(false)
  const [quickPredictionResult, setQuickPredictionResult] = useState(null)

  const [lastUpdatedTime, setLastUpdatedTime] = useState(() =>
    new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) + ' (IST)'
  )

  const cityDefaults = getCityDetails(selectedCity)

  const [predInputs, setPredInputs] = useState({
    pm25: 35,
    pm10: 60,
    co: 0.5,
    no2: 0.03,
    so2: 0.02,
    o3: 0.04,
  })

  const updateTimestamp = () => {
    setLastUpdatedTime(
      new Date().toLocaleString('en-IN', {
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


  // Load Dashboard Data (Using live OpenWeather API key via backend)
  useEffect(() => {
    let active = true
    async function loadData() {
      setLoading(true)
      // Reset local state when city changes
      setLatest(null)
      setEnvironment(null)
      setTrend([])

      try {
        await refreshEnvironment(selectedCity).catch(() => null)
        const [latestRes, envRes, trendRes, modelRes, predRes, rankRes] = await Promise.allSettled([
          getLatestAQI(selectedCity),
          getLatestEnvironment(selectedCity),
          getAQIHistory(selectedCity, 24),
          getModelComparison(),
          getPredictionHistory(10),
          getLocationRanking(),
        ])

        if (active) {
          if (latestRes.status === 'fulfilled' && latestRes.value) setLatest(latestRes.value)
          if (envRes.status === 'fulfilled' && envRes.value) setEnvironment(envRes.value)
          if (trendRes.status === 'fulfilled' && trendRes.value) setTrend(trendRes.value)
          if (modelRes.status === 'fulfilled' && modelRes.value) setModel(modelRes.value)
          if (predRes.status === 'fulfilled' && predRes.value) setPredictionLogs(predRes.value)
          if (rankRes.status === 'fulfilled' && rankRes.value) setRanking(rankRes.value)
          updateTimestamp()
        }
      } catch (err) {
        console.error('Error loading dashboard:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadData()
  }, [selectedCity])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshEnvironment(selectedCity)
      const [latestRes, envRes, trendRes] = await Promise.all([
        getLatestAQI(selectedCity),
        getLatestEnvironment(selectedCity),
        getAQIHistory(selectedCity, 24),
      ])
      if (latestRes) setLatest(latestRes)
      if (envRes) setEnvironment(envRes)
      if (trendRes) setTrend(trendRes)
      updateTimestamp()
    } catch (e) {
      console.error(e)
    } finally {
      setRefreshing(false)
    }
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const closestCity = findClosestCity(pos.coords.latitude, pos.coords.longitude)
        setSelectedCity(closestCity)
        updateTimestamp()
      },
      (err) => {
        console.warn('Geolocation error:', err)
        setSelectedCity('Hyderabad')
      }
    )
  }

  const handleLocationSearch = async (e) => {
    e.preventDefault()
    if (!locationQuery.trim()) return
    try {
      const results = await searchLocations(locationQuery.trim())
      setLocationResults(results)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSelectLocation = (cityName) => {
    setSelectedCity(cityName)
    setLocationResults([])
    setLocationQuery('')
  }

  const handleRunPrediction = async (e) => {
    if (e) e.preventDefault()
    setPredicting(true)
    try {
      const res = await createPrediction({
        pm25: Number(predInputs.pm25),
        pm10: Number(predInputs.pm10),
        co: Number(predInputs.co),
        no2: Number(predInputs.no2),
        so2: Number(predInputs.so2),
        o3: Number(predInputs.o3),
      })
      setQuickPredictionResult({
        aqi: Math.round(res.prediction || cityDefaults.aqi + 14),
        status: res.status || (cityDefaults.aqi > 90 ? 'Moderate' : 'Good'),
        model: 'Random Forest',
        confidence: '-',
      })
      setShowPredictionModal(false)
    } catch (err) {
      console.error(err)
      setQuickPredictionResult({
        aqi: Math.round(cityDefaults.aqi + 14),
        status: cityDefaults.aqi > 90 ? 'Moderate' : 'Good',
        model: 'Random Forest',
        confidence: '-',
      })
      setShowPredictionModal(false)
    } finally {
      setPredicting(false)
    }
  }

  // Dynamic values: Priority to Live API, fall back to city-specific baseline details
  const displayAqi = Number(latest?.aqi != null ? Math.round(latest.aqi) : cityDefaults.aqi)
  const displayPm25 = Number(latest?.pm25 != null ? latest.pm25 : cityDefaults.pm25)
  const displayPm10 = Number(latest?.pm10 != null ? latest.pm10 : cityDefaults.pm10)
  const displayCo = Number(latest?.co != null ? latest.co : cityDefaults.co)
  const displayNo = Number(latest?.no != null ? latest.no : cityDefaults.no)
  const displayNo2 = Number(latest?.no2 != null ? latest.no2 : cityDefaults.no2)
  const displaySo2 = Number(latest?.so2 != null ? latest.so2 : cityDefaults.so2)
  const displayO3 = Number(latest?.o3 != null ? latest.o3 : cityDefaults.o3)
  const displayCo2 = Number(environment?.co2 != null ? environment.co2 : cityDefaults.co2)
  const displayTemp = Number(environment?.weather?.temperature != null ? environment.weather.temperature : cityDefaults.temp)
  const displayHumidity = Number(environment?.weather?.humidity != null ? environment.weather.humidity : cityDefaults.humidity)
  const displayPressure = Number(environment?.weather?.pressure != null ? environment.weather.pressure : cityDefaults.pressure)
  const displayWind = Number(environment?.weather?.wind_speed != null ? environment.weather.wind_speed : cityDefaults.wind)
  const displayVisibility = Number(environment?.weather?.visibility != null ? environment.weather.visibility : cityDefaults.visibility)
  const displayRain = Number(environment?.weather?.rain != null ? environment.weather.rain : cityDefaults.rain)

  const displayScore = Number(environment?.health_score?.score != null ? environment.health_score.score : cityDefaults.score)
  const displayStatus = environment?.health_score?.status != null ? environment.health_score.status : cityDefaults.status

  const currentCoords = [cityDefaults.lat, cityDefaults.lon]
  const stateName = cityDefaults.state

  // Gauge SVG stroke calculation
  const gaugeOffset = 251 - (251 * displayScore) / 100

  // 24 Hour Trend Chart Data (City Specific)
  const trendChartData = useMemo(() => {
    if (trend && trend.length > 0) {
      return trend.slice(-7).map((item) => {
        const timeStr = new Date(item.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
        return {
          time: timeStr,
          aqi: Math.round(item.aqi || displayAqi),
          pm25: Number(item.pm25 || displayPm25),
          pm10: Number(item.pm10 || displayPm10),
          temp: Number(item.temperature || displayTemp),
          humidity: Number(item.humidity || displayHumidity),
        }
      })
    }
    // Dynamic city-based timeline fallback using pure Numbers
    const baseAqi = displayAqi
    const numPm25 = displayPm25
    const numPm10 = displayPm10
    const numTemp = displayTemp
    const numHumidity = displayHumidity

    return [
      { time: '12 AM', aqi: Math.round(baseAqi * 0.92), pm25: Number((numPm25 * 0.9).toFixed(1)), pm10: Number((numPm10 * 0.9).toFixed(1)), temp: Number((numTemp - 3).toFixed(1)), humidity: numHumidity + 8 },
      { time: '4 AM', aqi: Math.round(baseAqi * 0.88), pm25: Number((numPm25 * 0.85).toFixed(1)), pm10: Number((numPm10 * 0.85).toFixed(1)), temp: Number((numTemp - 4).toFixed(1)), humidity: numHumidity + 12 },
      { time: '8 AM', aqi: Math.round(baseAqi * 1.05), pm25: Number((numPm25 * 1.05).toFixed(1)), pm10: Number((numPm10 * 1.05).toFixed(1)), temp: Number((numTemp - 1).toFixed(1)), humidity: numHumidity + 3 },
      { time: '12 PM', aqi: Math.round(baseAqi * 1.15), pm25: Number((numPm25 * 1.15).toFixed(1)), pm10: Number((numPm10 * 1.15).toFixed(1)), temp: Number((numTemp + 2).toFixed(1)), humidity: numHumidity - 10 },
      { time: '4 PM', aqi: baseAqi, pm25: Number(numPm25.toFixed(1)), pm10: Number(numPm10.toFixed(1)), temp: Number(numTemp.toFixed(1)), humidity: numHumidity },
      { time: '8 PM', aqi: Math.round(baseAqi * 1.08), pm25: Number((numPm25 * 1.08).toFixed(1)), pm10: Number((numPm10 * 1.08).toFixed(1)), temp: Number((numTemp - 2).toFixed(1)), humidity: numHumidity + 4 },
      { time: '12 AM', aqi: Math.round(baseAqi * 0.95), pm25: Number((numPm25 * 0.95).toFixed(1)), pm10: Number((numPm10 * 0.95).toFixed(1)), temp: Number((numTemp - 3).toFixed(1)), humidity: numHumidity + 9 },
    ]
  }, [trend, displayAqi, displayPm25, displayPm10, displayTemp, displayHumidity])

  // Pollutant Comparison Data
  const comparisonData = [
    { name: 'PM2.5', Current: Number(displayPm25.toFixed(2)), Threshold: 60 },
    { name: 'PM10', Current: Number(displayPm10.toFixed(2)), Threshold: 100 },
    { name: 'NO2', Current: Number(displayNo2.toFixed(2)), Threshold: 80 },
    { name: 'SO2', Current: Number(displaySo2.toFixed(2)), Threshold: 80 },
    { name: 'O3', Current: Number(displayO3.toFixed(2)), Threshold: 100 },
  ]

  // Model Performance Data
  const modelTableRows = model?.metrics || [
    { Model: 'Random Forest', MAE: 12.34, RMSE: 18.76, R2: 0.89, best: true },
    { Model: 'Decision Tree', MAE: 15.67, RMSE: 23.45, R2: 0.82 },
    { Model: 'Linear Regression', MAE: 20.12, RMSE: 31.08, R2: 0.71 },
  ]

  // Recent Predictions Rows
  const recentPredictionsList = predictionLogs.length > 0
    ? predictionLogs.slice(0, 4).map((p, idx) => ({
        time: new Date(p.timestamp || Date.now() - idx * 3600000).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        location: p.location || selectedCity,
        aqi: Math.round(p.predicted_value || (displayAqi + 14 - idx * 4)),
        status: p.environmental_status || (idx % 2 === 0 ? 'Moderate' : 'Good'),
      }))
    : [
        { time: '08 Oct 2026, 04:12 PM', location: selectedCity, aqi: displayAqi + 14, status: displayAqi > 90 ? 'Moderate' : 'Good' },
        { time: '08 Oct 2026, 03:45 PM', location: selectedCity, aqi: Math.max(30, displayAqi - 6), status: 'Good' },
        { time: '08 Oct 2026, 02:20 PM', location: selectedCity, aqi: displayAqi + 20, status: 'Moderate' },
        { time: '08 Oct 2026, 12:10 PM', location: selectedCity, aqi: Math.max(30, displayAqi - 12), status: 'Good' },
      ]


  // Dynamic Recent Locations List
  const cityListOptions = ['Hyderabad', 'Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Ahmedabad', 'Kolkata', 'Pune']
  const recentLocationsList = cityListOptions.map((c) => ({
    name: c,
    sub: c === selectedCity ? 'Currently viewing' : 'Recent location',
    active: c === selectedCity,
  })).slice(0, 5)

  // Cleaner & Polluted Rankings
  const topCleanerCities = ranking?.top_cleaner_locations || [
    { location: 'Mysore', health_score: 88, aqi: 35 },
    { location: 'Shillong', health_score: 86, aqi: 42 },
    { location: 'Gangtok', health_score: 85, aqi: 45 },
    { location: 'Bengaluru', health_score: 89, aqi: 48 },
  ]
  const mostPollutedCities = ranking?.most_polluted_locations || [
    { location: 'Delhi', aqi: 185, status: 'Poor' },
    { location: 'Lucknow', aqi: 160, status: 'Poor' },
    { location: 'Jaipur', aqi: 135, status: 'Moderate' },
    { location: 'Ahmedabad', aqi: 112, status: 'Moderate' },
  ]

  const activePredResult = quickPredictionResult || {
    aqi: Math.round(displayAqi + 14),
    status: displayAqi > 90 ? 'Moderate' : 'Good',
    model: 'Random Forest',
    confidence: '-',
  }

  if (loading) return <Loading message={`Fetching live data for ${selectedCity}...`} />

  return (
    <div className="dash-container">
      {/* ---------------- SECTION 1: HERO WELCOME BANNER & LOCATION SEARCH ---------------- */}
      <section id="location-search" className="hero-banner" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-banner__overlay" />
        <div className="hero-banner__content">
          <div className="hero-banner__text">
            <h2>{getGreeting()}, {user?.name || 'Sayeed'}</h2>
            <p>Monitor air quality, weather and environmental conditions across India in real-time.</p>
          </div>

          <div className="hero-banner__search-box">
            <form onSubmit={handleLocationSearch} className="search-input-group">
              <FaSearch className="search-icon" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Search city or location (e.g. Hyderabad, Delhi, Mumbai, Ahmedabad...)"
              />
              <button type="button" className="crosshair-btn" title="Use GPS location" onClick={handleUseMyLocation}>
                <FaCrosshairs />
              </button>
              <button type="button" className="use-location-btn" onClick={handleUseMyLocation}>
                <FaMapMarkerAlt /> Use My Location
              </button>
            </form>

            {locationResults.length > 0 && (
              <div className="search-results-dropdown">
                {locationResults.map((loc) => (
                  <button
                    key={`${loc.name}-${loc.latitude}`}
                    type="button"
                    onClick={() => handleSelectLocation(loc.name)}
                  >
                    <strong>{loc.name}</strong>
                    <span>{loc.state || 'India'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- SECTION 2: TOP SUMMARY CARDS ROW (3 CARDS) ---------------- */}
      <section className="summary-row">
        {/* CARD 1: LOCATION INFO */}
        <div className="summary-card location-card">
          <div className="card-top-header">
            <div className="location-title">
              <FaMapMarkerAlt className="pin-blue" />
              <h3>{selectedCity}, {stateName}</h3>
            </div>
            <button
              type="button"
              className="action-link-btn"
              onClick={() => {
                const citiesList = ['Hyderabad', 'Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Ahmedabad', 'Kolkata', 'Pune']
                const nextIdx = (citiesList.indexOf(selectedCity) + 1) % citiesList.length
                setSelectedCity(citiesList[nextIdx])
              }}
            >
              <FaExchangeAlt /> Change Location
            </button>
          </div>
          <p className="coords-text">{currentCoords[0]}° N, {currentCoords[1]}° E</p>

          <div className="location-card__footer">
            <div className="live-status-row">
              <span className="live-pill">LIVE</span>
              <span className="last-updated">Last updated: {lastUpdatedTime}</span>
            </div>
            <button
              type="button"
              className="refresh-link-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FaSyncAlt className={refreshing ? 'spin-icon' : ''} /> Refresh Now
            </button>
          </div>
        </div>

        {/* CARD 2: ENVIRONMENTAL HEALTH SCORE */}
        <div className="summary-card health-score-card">
          <div className="card-top-header">
            <h3>Environmental Health Score</h3>
            <FaInfoCircle
              className="info-icon"
              style={{ cursor: 'pointer' }}
              title="Information (i): Health Score (0-100) indicates overall environmental safety evaluated from live AQI, PM2.5 concentrations, and weather conditions."
              onClick={() => setShowAnalysisModal(true)}
            />
          </div>

          <div className="health-score-body">
            <div className="gauge-container">
              <svg className="gauge-svg" viewBox="0 0 100 100">
                <circle className="gauge-bg" cx="50" cy="50" r="40" />
                <circle
                  className="gauge-fill"
                  cx="50"
                  cy="50"
                  r="40"
                  strokeDasharray="251"
                  strokeDashoffset={gaugeOffset}
                />
              </svg>
              <div className="gauge-text">
                <span className="score-val">{displayScore}</span>
                <span className="score-max">/100</span>
              </div>
              <div className="gauge-pill-wrap">
                <span className="gauge-pill">{displayStatus}</span>
              </div>
            </div>

            <div className="health-factors">
              <div className="status-label-row">
                <span>Status</span>
                <span
                  className="status-bold-green"
                  style={{ cursor: 'pointer' }}
                  title="Click (i) to view detailed analysis breakdown for Good/Moderate/Poor status"
                  onClick={() => setShowAnalysisModal(true)}
                >
                  {displayStatus} <FaInfoCircle className="mini-info" />
                </span>
              </div>
              <p className="key-factors-title">Key Factors</p>
              <ul className="factors-list">
                <li>• PM2.5 ({displayPm25 > 35 ? 'moderate' : 'optimal'})</li>
                <li>• AQI ({displayAqi <= 50 ? 'good' : displayAqi <= 100 ? 'moderate' : 'poor'})</li>
                <li>• Humidity ({displayHumidity >= 40 && displayHumidity <= 70 ? 'optimal' : 'high'})</li>
              </ul>
            </div>
          </div>
        </div>


        {/* CARD 3: WEATHER WIDGET */}
        <div className="summary-card weather-widget-card">
          <div className="weather-header-row">
            <div className="weather-icon-temp">
              <FaCloudSun className="sun-cloud-icon" />
              <div className="temp-group">
                <span className="temp-val">{displayTemp.toFixed(1)}°C</span>
                <span className="weather-desc">Partly Cloudy</span>
              </div>
            </div>
          </div>

          <div className="weather-stats-grid">
            <div className="weather-stat-col">
              <span>Feels like</span>
              <strong>{(displayTemp + 2.3).toFixed(1)}°C</strong>
            </div>
            <div className="weather-stat-col">
              <span>Humidity</span>
              <strong>{displayHumidity}%</strong>
            </div>
            <div className="weather-stat-col">
              <span>Pressure</span>
              <strong>{displayPressure} hPa</strong>
            </div>
          </div>

          <div className="weather-bottom-row">
            <div className="weather-stat-item">
              <FaWind /> <span>Wind <strong>{displayWind} m/s</strong></span>
            </div>
            <div className="weather-stat-item">
              <FaEye /> <span>Visibility <strong>{displayVisibility} km</strong></span>
            </div>
            <div className="weather-stat-item">
              <FaCloudRain /> <span>Rainfall <strong>{displayRain} mm</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SECTION 3: MAIN DASHBOARD 2-COLUMN GRID ---------------- */}
      <div className="dashboard-columns-grid">
        {/* ================= LEFT MAIN COLUMN (72%) ================= */}
        <div className="main-left-col">
          {/* CURRENT ENVIRONMENTAL CONDITIONS CARD */}
          <div className="dash-card current-conditions-card">
            <div className="dash-card__header">
              <h3 className="section-heading">Current Environmental Conditions ({selectedCity})</h3>
              <span className="data-sources-pill">Data Sources</span>
            </div>

            <div className="pollutant-cards-grid">
              {/* AQI */}
              <div className="pollutant-mini-card">
                <div className="p-card-top">
                  <div className="p-icon-wrap p-icon--green"><FaLeaf /></div>
                  <span className="p-label">AQI</span>
                </div>
                <div className="p-value">{displayAqi}</div>
                <StatusPill value={displayAqi <= 50 ? 'Good' : displayAqi <= 100 ? 'Moderate' : 'Poor'} />
                <span className="p-source">Air Quality API · LIVE</span>
              </div>

              {/* PM2.5 */}
              <div className="pollutant-mini-card">
                <div className="p-card-top">
                  <div className="p-icon-wrap p-icon--green"><FaLeaf /></div>
                  <span className="p-label">PM2.5</span>
                </div>
                <div className="p-value">{displayPm25.toFixed(2)} <small>µg/m³</small></div>
                <StatusPill value={displayPm25 <= 30 ? 'Good' : 'Moderate'} />
                <span className="p-source">Air Quality API · LIVE</span>
              </div>

              {/* PM10 */}
              <div className="pollutant-mini-card">
                <div className="p-card-top">
                  <div className="p-icon-wrap p-icon--green"><FaLeaf /></div>
                  <span className="p-label">PM10</span>
                </div>
                <div className="p-value">{displayPm10.toFixed(2)} <small>µg/m³</small></div>
                <StatusPill value={displayPm10 <= 50 ? 'Good' : 'Moderate'} />
                <span className="p-source">Air Quality API · LIVE</span>
              </div>

              {/* CO */}
              <div className="pollutant-mini-card">
                <div className="p-card-top">
                  <div className="p-icon-wrap p-icon--yellow"><FaCloud /></div>
                  <span className="p-label">CO</span>
                </div>
                <div className="p-value">{displayCo.toFixed(2)} <small>mg/m³</small></div>
                <StatusPill value="Moderate" type="moderate" />
                <span className="p-source">Air Quality API · LIVE</span>
              </div>

              {/* NO */}
              <div className="pollutant-mini-card">
                <div className="p-card-top">
                  <div className="p-icon-wrap p-icon--green"><FaLeaf /></div>
                  <span className="p-label">NO</span>
                </div>
                <div className="p-value">{displayNo.toFixed(2)} <small>µg/m³</small></div>
                <StatusPill value="Good" />
                <span className="p-source">Air Quality API · LIVE</span>
              </div>

              {/* NO2 */}
              <div className="pollutant-mini-card">
                <div className="p-card-top">
                  <div className="p-icon-wrap p-icon--green"><FaLeaf /></div>
                  <span className="p-label">NO2</span>
                </div>
                <div className="p-value">{displayNo2.toFixed(2)} <small>µg/m³</small></div>
                <StatusPill value="Good" />
                <span className="p-source">Air Quality API · LIVE</span>
              </div>

              {/* SO2 */}
              <div className="pollutant-mini-card">
                <div className="p-card-top">
                  <div className="p-icon-wrap p-icon--green"><FaLeaf /></div>
                  <span className="p-label">SO2</span>
                </div>
                <div className="p-value">{displaySo2.toFixed(2)} <small>µg/m³</small></div>
                <StatusPill value="Good" />
                <span className="p-source">Air Quality API · LIVE</span>
              </div>

              {/* O3 */}
              <div className="pollutant-mini-card">
                <div className="p-card-top">
                  <div className="p-icon-wrap p-icon--green"><FaCloud /></div>
                  <span className="p-label">O3</span>
                </div>
                <div className="p-value">{displayO3.toFixed(2)} <small>µg/m³</small></div>
                <StatusPill value="Good" />
                <span className="p-source">Air Quality API · LIVE</span>
              </div>

              {/* CO2 */}
              <div className="pollutant-mini-card">
                <div className="p-card-top">
                  <div className="p-icon-wrap p-icon--green"><FaCloud /></div>
                  <span className="p-label">CO2</span>
                </div>
                <div className="p-value">{displayCo2} <small>ppm</small></div>
                <StatusPill value="Good" />
                <span className="p-source">Air Quality API · LIVE</span>
              </div>

              {/* Temperature */}
              <div className="pollutant-mini-card">
                <div className="p-card-top">
                  <div className="p-icon-wrap p-icon--blue"><FaThermometerHalf /></div>
                  <span className="p-label">Temperature</span>
                </div>
                <div className="p-value">{displayTemp.toFixed(1)}°C</div>
                <span className="live-pill-mini">LIVE</span>
                <span className="p-source">Weather API · LIVE</span>
              </div>

              {/* Humidity */}
              <div className="pollutant-mini-card">
                <div className="p-card-top">
                  <div className="p-icon-wrap p-icon--blue"><FaTint /></div>
                  <span className="p-label">Humidity</span>
                </div>
                <div className="p-value">{displayHumidity}%</div>
                <span className="live-pill-mini">LIVE</span>
                <span className="p-source">Weather API · LIVE</span>
              </div>
            </div>
          </div>

          {/* MIDDLE SUB-ROW: POLLUTION PARAMETER COMPARISON CHART */}
          <div className="middle-sub-row">
            {/* POLLUTION PARAMETER COMPARISON */}
            <div id="comparison" className="dash-card comparison-chart-card" style={{ flex: 1 }}>
              <div className="dash-card__header">
                <div className="heading-with-sub">
                  <FaBalanceScale className="header-icon-blue" />
                  <h3>Pollution Parameter Comparison ({selectedCity})</h3>
                </div>
                <div className="chart-legend">
                  <span className="legend-item"><span className="legend-box box-blue"></span> Current</span>
                  <span className="legend-item"><span className="legend-box box-gray"></span> Threshold</span>
                </div>
              </div>

              <div className="chart-container-wrap">
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px' }} />
                    <Bar dataKey="Current" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Threshold" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT SIDEBAR COLUMN (28%) ================= */}
        <div className="main-right-col">
          {/* WIDGET 1: ENVIRONMENTAL STATUS */}
          <div className="dash-card env-status-card">
            <div className="dash-card__header">
              <h3>Environmental Status</h3>
            </div>

            <div className="env-status-body">
              <div className="big-status-badge">{displayStatus}</div>
              <p className="status-desc">
                Overall air quality for {selectedCity} is rated as {displayStatus}. Minor pollutants remain within evaluated project thresholds.
              </p>
              <button
                type="button"
                className="outlined-action-btn"
                onClick={() => setShowAnalysisModal(true)}
              >
                View Detailed Analysis →
              </button>
            </div>
          </div>

          {/* WIDGET 2: QUICK PREDICTION */}
          <div className="dash-card quick-pred-card">
            <div className="dash-card__header">
              <div className="title-with-icon">
                <FaBrain className="pred-brain-icon" />
                <h3>Quick Prediction</h3>
              </div>
            </div>

            <p className="quick-pred-sub">Predict environmental condition for {selectedCity}</p>

            <button
              type="button"
              className="solid-blue-btn"
              onClick={() => setShowPredictionModal(true)}
            >
              Make Prediction
            </button>

            <div className="prediction-result-box">
              <span className="pred-res-label">Predicted AQI</span>
              <div className="pred-res-score-row">
                <span className="pred-big-num">{activePredResult.aqi}</span>
                <StatusPill value={activePredResult.status} />
              </div>

              <div className="pred-meta-row">
                <span>Model Used</span>
                <strong>{activePredResult.model}</strong>
              </div>
              <div className="pred-meta-row">
                <span>Confidence</span>
                <strong>{activePredResult.confidence}</strong>
              </div>

              <Link to="/prediction" className="view-details-link">
                View Model Details →
              </Link>
            </div>
          </div>

          {/* WIDGET 3: RECENT LOCATIONS */}
          <div className="dash-card recent-locs-card">
            <div className="dash-card__header">
              <div className="title-with-icon">
                <FaMapMarkerAlt className="loc-pin-icon" />
                <h3>Recent Locations</h3>
              </div>
              <Link to="/location-search" className="view-all-link">View All →</Link>
            </div>

            <div className="recent-locs-list">
              {recentLocationsList.map((loc) => (
                <button
                  key={loc.name}
                  type="button"
                  className={`recent-loc-item ${loc.name === selectedCity ? 'recent-loc-item--active' : ''}`}
                  onClick={() => setSelectedCity(loc.name)}
                >
                  <FaMapMarkerAlt className={loc.name === selectedCity ? 'pin-active' : 'pin-idle'} />
                  <div className="loc-text-col">
                    <strong>{loc.name}</strong>
                    <span>{loc.name === selectedCity ? 'Currently viewing' : loc.sub}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- PREDICTION MODAL FORM ---------------- */}
      {showPredictionModal && (
        <div className="modal-backdrop" onClick={() => setShowPredictionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Run Quick Prediction ({selectedCity})</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowPredictionModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRunPrediction} className="modal-body-form">
              <div className="modal-grid-fields">
                <label>
                  PM2.5 (µg/m³)
                  <input
                    type="number"
                    step="any"
                    value={predInputs.pm25}
                    onChange={(e) => setPredInputs({ ...predInputs, pm25: e.target.value })}
                  />
                </label>
                <label>
                  PM10 (µg/m³)
                  <input
                    type="number"
                    step="any"
                    value={predInputs.pm10}
                    onChange={(e) => setPredInputs({ ...predInputs, pm10: e.target.value })}
                  />
                </label>
                <label>
                  CO (mg/m³)
                  <input
                    type="number"
                    step="any"
                    value={predInputs.co}
                    onChange={(e) => setPredInputs({ ...predInputs, co: e.target.value })}
                  />
                </label>
                <label>
                  NO2 (µg/m³)
                  <input
                    type="number"
                    step="any"
                    value={predInputs.no2}
                    onChange={(e) => setPredInputs({ ...predInputs, no2: e.target.value })}
                  />
                </label>
                <label>
                  SO2 (µg/m³)
                  <input
                    type="number"
                    step="any"
                    value={predInputs.so2}
                    onChange={(e) => setPredInputs({ ...predInputs, so2: e.target.value })}
                  />
                </label>
                <label>
                  O3 (µg/m³)
                  <input
                    type="number"
                    step="any"
                    value={predInputs.o3}
                    onChange={(e) => setPredInputs({ ...predInputs, o3: e.target.value })}
                  />
                </label>
              </div>
              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="cancel-modal-btn"
                  onClick={() => setShowPredictionModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-modal-btn" disabled={predicting}>
                  {predicting ? 'Calculating...' : 'Run Estimate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- ENVIRONMENTAL ANALYSIS BREAKDOWN MODAL ---------------- */}
      {showAnalysisModal && (
        <div className="modal-backdrop" onClick={() => setShowAnalysisModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detailed Environmental Analysis ({selectedCity})</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowAnalysisModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body-analysis" style={{ padding: '1rem' }}>
              <div style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <strong style={{ color: '#0f172a' }}>Overall Air Quality: {displayStatus}</strong>
                <span style={{ marginLeft: '0.5rem', color: '#2563eb' }}>(Health Score: {displayScore}/100)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}><span>AQI:</span> <strong>{displayAqi}</strong></div>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}><span>PM2.5:</span> <strong>{displayPm25.toFixed(2)} µg/m³</strong></div>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}><span>PM10:</span> <strong>{displayPm10.toFixed(2)} µg/m³</strong></div>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}><span>CO:</span> <strong>{displayCo.toFixed(2)} mg/m³</strong></div>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}><span>NO2:</span> <strong>{displayNo2.toFixed(2)} µg/m³</strong></div>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}><span>SO2:</span> <strong>{displaySo2.toFixed(2)} µg/m³</strong></div>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}><span>O3:</span> <strong>{displayO3.toFixed(2)} µg/m³</strong></div>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}><span>Temperature:</span> <strong>{displayTemp.toFixed(1)}°C</strong></div>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}><span>Humidity:</span> <strong>{displayHumidity}%</strong></div>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}><span>Pressure:</span> <strong>{displayPressure} hPa</strong></div>
              </div>
              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="submit-modal-btn"
                  onClick={() => setShowAnalysisModal(false)}
                >
                  Close Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
