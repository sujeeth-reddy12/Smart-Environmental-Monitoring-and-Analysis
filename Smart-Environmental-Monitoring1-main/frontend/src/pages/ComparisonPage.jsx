import { useState, useEffect } from 'react'
import {
  FaBalanceScale,
  FaPlus,
  FaTimes,
  FaTrash,
  FaTrophy,
  FaExclamationTriangle,
  FaChartBar,
  FaMapMarkerAlt,
  FaInfoCircle,
} from 'react-icons/fa'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useCity } from '../context/CityContext'
import { getCityDetails, CITY_DATA_MAP } from '../utils/cityHelper'
import { getLatestAQI } from '../services/api'
import './ComparisonPage.css'

function StatusPill({ value }) {
  const norm = (value || '').toLowerCase()
  let className = 'status-pill status-pill--good'
  if (norm.includes('mod') || norm.includes('warn')) {
    className = 'status-pill status-pill--moderate'
  } else if (norm.includes('poor') || norm.includes('sever') || norm.includes('crit')) {
    className = 'status-pill status-pill--critical'
  }
  return <span className={className}>{value || 'Good'}</span>
}

const PRESET_CITIES = [
  'Hyderabad',
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Pune',
  'Jaipur',
  'Lucknow',
]

const COLOR_PALETTE = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function ComparisonPage() {
  const { selectedCity } = useCity()
  const [cityInput, setCityInput] = useState('')
  const [comparedCities, setComparedCities] = useState([
    selectedCity || 'Hyderabad',
    'Delhi',
    'Mumbai',
    'Bengaluru',
  ])
  const [cityDetailsList, setCityDetailsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeChartMetric, setActiveChartMetric] = useState('aqi')

  // Fetch live or baseline details for compared cities
  useEffect(() => {
    let isMounted = true
    async function fetchAllDetails() {
      setLoading(true)
      const results = await Promise.all(
        comparedCities.map(async (cityName) => {
          const baseline = getCityDetails(cityName)
          try {
            const live = await getLatestAQI(cityName)
            if (live) {
              return {
                ...baseline,
                aqi: Math.round(live.aqi ?? baseline.aqi),
                pm25: Number((live.pm25 ?? baseline.pm25).toFixed(2)),
                pm10: Number((live.pm10 ?? baseline.pm10).toFixed(2)),
                co: Number((live.co ?? baseline.co).toFixed(2)),
                no2: Number((live.no2 ?? baseline.no2).toFixed(2)),
                so2: Number((live.so2 ?? baseline.so2).toFixed(2)),
                o3: Number((live.o3 ?? baseline.o3).toFixed(2)),
                temp: Number((live.temperature ?? baseline.temp).toFixed(1)),
                humidity: live.humidity ?? baseline.humidity,
                source: 'Live API',
              }
            }
          } catch (e) {
            // fallback to baseline
          }
          return { ...baseline, source: 'Calculated baseline' }
        })
      )
      if (isMounted) {
        setCityDetailsList(results)
        setLoading(false)
      }
    }
    fetchAllDetails()
    return () => {
      isMounted = false
    }
  }, [comparedCities])

  // Add location helper
  const handleAddCity = (cityName) => {
    const formatted = cityName.trim()
    if (!formatted) return
    const exists = comparedCities.some((c) => c.toLowerCase() === formatted.toLowerCase())
    if (exists) {
      alert(`${formatted} is already added to comparison!`)
      return
    }
    if (comparedCities.length >= 6) {
      alert('Maximum 6 locations can be compared at once for optimal readability.')
      return
    }
    setComparedCities([...comparedCities, formatted])
    setCityInput('')
  }

  // Remove location helper
  const handleRemoveCity = (cityName) => {
    if (comparedCities.length <= 1) {
      alert('Please keep at least 1 location in the comparison.')
      return
    }
    setComparedCities(comparedCities.filter((c) => c.toLowerCase() !== cityName.toLowerCase()))
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    handleAddCity(cityInput)
  }

  // Summary stats calculations
  const sortedByAQI = [...cityDetailsList].sort((a, b) => a.aqi - b.aqi)
  const bestLocation = sortedByAQI[0]
  const worstLocation = sortedByAQI[sortedByAQI.length - 1]
  const avgAQI = cityDetailsList.length
    ? Math.round(cityDetailsList.reduce((acc, c) => acc + c.aqi, 0) / cityDetailsList.length)
    : 0

  // Chart Data preparation
  const chartData = [
    {
      metric: activeChartMetric === 'aqi' ? 'AQI Score' : activeChartMetric.toUpperCase(),
      ...cityDetailsList.reduce((acc, c) => {
        let val = c[activeChartMetric] || c.aqi
        if (activeChartMetric === 'pm25') val = c.pm25
        if (activeChartMetric === 'pm10') val = c.pm10
        if (activeChartMetric === 'no2') val = c.no2
        if (activeChartMetric === 'so2') val = c.so2
        if (activeChartMetric === 'o3') val = c.o3
        acc[c.name] = val
        return acc
      }, {}),
    },
  ]

  return (
    <div className="comp-page-container">
      {/* Header Banner */}
      <section className="comp-header-banner">
        <div className="comp-header-text">
          <div className="comp-kicker">
            <FaBalanceScale /> DYNAMIC LOCATION COMPARISON
          </div>
          <h1>Multi-Location Environmental Comparison</h1>
          <p>
            Add or remove locations of interest to compare live air quality index, PM2.5, PM10, gas pollutants, and weather parameters side-by-side.
          </p>
        </div>

        {/* Add Location Form */}
        <form onSubmit={handleFormSubmit} className="comp-form-input">
          <FaMapMarkerAlt className="comp-input-icon" />
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Add location (e.g. Pune, Jaipur, Chennai)..."
          />
          <button type="submit" className="comp-submit-btn">
            <FaPlus /> Add Location
          </button>
        </form>
      </section>

      {/* Preset Quick-Add Pills */}
      <div className="preset-chips-container">
        <span className="preset-label">Quick Add Popular Cities:</span>
        <div className="preset-chips-list">
          {PRESET_CITIES.map((city) => {
            const isAdded = comparedCities.some((c) => c.toLowerCase() === city.toLowerCase())
            return (
              <button
                key={city}
                type="button"
                className={`preset-chip ${isAdded ? 'preset-chip--added' : ''}`}
                onClick={() => (isAdded ? handleRemoveCity(city) : handleAddCity(city))}
              >
                {isAdded ? <FaTimes /> : <FaPlus />}
                <span>{city}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Highlights & Quick Insights */}
      {cityDetailsList.length > 0 && (
        <div className="comp-summary-row">
          <div className="comp-summary-card comp-summary-card--best">
            <div className="summary-card-icon"><FaTrophy /></div>
            <div>
              <span className="summary-card-title">Cleanest Location</span>
              <h3>{bestLocation?.name}</h3>
              <p>AQI {bestLocation?.aqi} · {bestLocation?.status}</p>
            </div>
          </div>

          <div className="comp-summary-card comp-summary-card--worst">
            <div className="summary-card-icon"><FaExclamationTriangle /></div>
            <div>
              <span className="summary-card-title">Highest Pollution</span>
              <h3>{worstLocation?.name}</h3>
              <p>AQI {worstLocation?.aqi} · {worstLocation?.status}</p>
            </div>
          </div>

          <div className="comp-summary-card comp-summary-card--avg">
            <div className="summary-card-icon"><FaChartBar /></div>
            <div>
              <span className="summary-card-title">Average Group AQI</span>
              <h3>{avgAQI} AQI</h3>
              <p>{comparedCities.length} Locations Selected</p>
            </div>
          </div>
        </div>
      )}

      {/* Chart Card */}
      <div className="dash-card">
        <div className="dash-card__header">
          <div className="heading-with-sub">
            <FaChartBar className="header-icon-blue" />
            <h3>Comparative Parameter Chart</h3>
          </div>

          <div className="metric-tabs">
            {['aqi', 'pm25', 'pm10', 'no2', 'so2', 'o3'].map((m) => (
              <button
                key={m}
                type="button"
                className={`metric-tab ${activeChartMetric === m ? 'metric-tab--active' : ''}`}
                onClick={() => setActiveChartMetric(m)}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-container-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              {cityDetailsList.map((city, idx) => (
                <Bar
                  key={city.name}
                  dataKey={city.name}
                  fill={COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Location Breakdown Cards */}
      <div className="dash-card">
        <div className="dash-card__header">
          <h3>Selected Locations Breakdown ({comparedCities.length})</h3>
          <span className="data-sources-pill">User Selected Locations</span>
        </div>

        <div className="compared-cities-cards">
          {cityDetailsList.map((details, idx) => (
            <div
              key={details.name}
              className={`comp-city-card ${details.name === selectedCity ? 'comp-city-card--active' : ''}`}
            >
              <div className="comp-card-top">
                <div>
                  <h4>{details.name}</h4>
                  <small>{details.state || 'India'}</small>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <StatusPill value={details.status} />
                  <button
                    type="button"
                    className="remove-city-btn"
                    title={`Remove ${details.name}`}
                    onClick={() => handleRemoveCity(details.name)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="comp-stats-list">
                <div className="comp-stat-row">
                  <span>AQI Index</span>
                  <strong>{details.aqi}</strong>
                </div>
                <div className="comp-stat-row">
                  <span>Health Score</span>
                  <strong className="green-score">{details.score}/100</strong>
                </div>
                <div className="comp-stat-row">
                  <span>PM2.5</span>
                  <strong>{details.pm25} µg/m³</strong>
                </div>
                <div className="comp-stat-row">
                  <span>PM10</span>
                  <strong>{details.pm10} µg/m³</strong>
                </div>
                <div className="comp-stat-row">
                  <span>Temperature</span>
                  <strong>{details.temp}°C</strong>
                </div>
                <div className="comp-stat-row">
                  <span>Humidity</span>
                  <strong>{details.humidity}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Side-by-Side Parameter Matrix Table */}
      <div className="dash-card">
        <div className="dash-card__header">
          <h3>Detailed Parameter Comparison Matrix</h3>
          <span className="data-sources-pill">Comprehensive Metrics</span>
        </div>

        <div className="table-responsive">
          <table className="custom-dash-table comp-matrix-table">
            <thead>
              <tr>
                <th>Environmental Parameter</th>
                {cityDetailsList.map((c) => (
                  <th key={c.name} style={{ textAlign: 'center' }}>
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>AQI Index</strong></td>
                {cityDetailsList.map((c) => (
                  <td key={c.name} style={{ textAlign: 'center' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#2563eb' }}>{c.aqi}</strong>
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Air Quality Category</strong></td>
                {cityDetailsList.map((c) => (
                  <td key={c.name} style={{ textAlign: 'center' }}>
                    <StatusPill value={c.status} />
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Health Score</strong></td>
                {cityDetailsList.map((c) => (
                  <td key={c.name} style={{ textAlign: 'center' }}>
                    <strong style={{ color: '#10b981' }}>{c.score} / 100</strong>
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>PM2.5 Concentration</strong></td>
                {cityDetailsList.map((c) => (
                  <td key={c.name} style={{ textAlign: 'center' }}>{c.pm25} µg/m³</td>
                ))}
              </tr>
              <tr>
                <td><strong>PM10 Concentration</strong></td>
                {cityDetailsList.map((c) => (
                  <td key={c.name} style={{ textAlign: 'center' }}>{c.pm10} µg/m³</td>
                ))}
              </tr>
              <tr>
                <td><strong>Carbon Monoxide (CO)</strong></td>
                {cityDetailsList.map((c) => (
                  <td key={c.name} style={{ textAlign: 'center' }}>{c.co} mg/m³</td>
                ))}
              </tr>
              <tr>
                <td><strong>Nitrogen Dioxide (NO2)</strong></td>
                {cityDetailsList.map((c) => (
                  <td key={c.name} style={{ textAlign: 'center' }}>{c.no2} µg/m³</td>
                ))}
              </tr>
              <tr>
                <td><strong>Sulfur Dioxide (SO2)</strong></td>
                {cityDetailsList.map((c) => (
                  <td key={c.name} style={{ textAlign: 'center' }}>{c.so2} µg/m³</td>
                ))}
              </tr>
              <tr>
                <td><strong>Ozone (O3)</strong></td>
                {cityDetailsList.map((c) => (
                  <td key={c.name} style={{ textAlign: 'center' }}>{c.o3} µg/m³</td>
                ))}
              </tr>
              <tr>
                <td><strong>Temperature</strong></td>
                {cityDetailsList.map((c) => (
                  <td key={c.name} style={{ textAlign: 'center' }}>{c.temp}°C</td>
                ))}
              </tr>
              <tr>
                <td><strong>Relative Humidity</strong></td>
                {cityDetailsList.map((c) => (
                  <td key={c.name} style={{ textAlign: 'center' }}>{c.humidity}%</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ComparisonPage
