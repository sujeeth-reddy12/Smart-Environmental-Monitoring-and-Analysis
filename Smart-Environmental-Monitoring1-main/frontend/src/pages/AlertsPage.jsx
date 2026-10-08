import { useState } from 'react'
import {
  FaBell,
  FaShieldAlt,
  FaInfoCircle,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaFilter,
  FaCheckCircle,
  FaCloudSun,
} from 'react-icons/fa'
import { useCity } from '../context/CityContext'
import { getCityDetails, CITY_DATA_MAP } from '../utils/cityHelper'
import './AlertsPage.css'

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

const MONITORED_CITIES = [
  'Delhi',
  'Lucknow',
  'Jaipur',
  'Kolkata',
  'Ahmedabad',
  'Mumbai',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Bengaluru',
]

function generateLocationAlerts() {
  const nowStr = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }) + ' (IST)'

  return MONITORED_CITIES.map((cityName) => {
    const details = getCityDetails(cityName)
    const aqi = details.aqi
    const pm25 = details.pm25
    const pm10 = details.pm10
    const temp = details.temp
    const humidity = details.humidity

    let severity = 'normal'
    let title = ''
    let description = ''
    let category = 'air_quality'

    if (aqi > 150) {
      severity = 'critical'
      title = `SEVERE AIR POLLUTION ALERT: ${details.status.toUpperCase()} LEVEL (${aqi} AQI)`
      description = `High pollutant concentration detected in ${cityName}, ${details.state}. PM2.5 is at ${pm25.toFixed(1)} µg/m³ (exceeding safe limit of 60 µg/m³) and PM10 is at ${pm10.toFixed(1)} µg/m³. Respiratory precautions recommended. Sensitive individuals and children should stay indoors.`
    } else if (aqi > 100) {
      severity = 'warning'
      title = `MODERATE POLLUTION WARNING: ${details.status.toUpperCase()} LEVEL (${aqi} AQI)`
      description = `Air quality in ${cityName}, ${details.state} is in the Moderate/Unhealthy category (${aqi} AQI). PM2.5 is at ${pm25.toFixed(1)} µg/m³. Prolonged outdoor exertion during afternoon hours should be minimized.`
    } else if (humidity > 70 || temp > 32) {
      severity = 'weather'
      category = 'weather'
      title = `WEATHER & HUMIDITY ADVISORY (${temp}°C, ${humidity}% Humidity)`
      description = `Elevated temperature of ${temp}°C and ${humidity}% humidity reported for ${cityName}, ${details.state}. AQI is ${aqi} (${details.status}). Stay hydrated and maintain adequate indoor ventilation.`
    } else {
      severity = 'normal'
      title = `OPTIMAL ENVIRONMENTAL STATUS (${aqi} AQI)`
      description = `Air quality in ${cityName}, ${details.state} remains satisfactory with ${aqi} AQI and PM2.5 at ${pm25.toFixed(1)} µg/m³. Environmental indicators adhere to project thresholds.`
    }

    return {
      city: cityName,
      state: details.state,
      aqi,
      pm25,
      pm10,
      temp,
      humidity,
      severity,
      category,
      title,
      description,
      status: details.status,
      timestamp: nowStr,
    }
  })
}

function AlertsPage() {
  const { selectedCity, setSelectedCity } = useCity()
  const [locationFilter, setLocationFilter] = useState('ALL')
  const [severityFilter, setSeverityFilter] = useState('ALL')

  const allAlerts = generateLocationAlerts()

  // Filtering
  const filteredAlerts = allAlerts.filter((alert) => {
    if (locationFilter !== 'ALL' && alert.city.toLowerCase() !== locationFilter.toLowerCase()) {
      return false
    }
    if (severityFilter !== 'ALL' && alert.severity !== severityFilter) {
      return false
    }
    return true
  })

  // Summary counts
  const criticalCount = allAlerts.filter((a) => a.severity === 'critical').length
  const warningCount = allAlerts.filter((a) => a.severity === 'warning').length
  const weatherCount = allAlerts.filter((a) => a.severity === 'weather').length
  const normalCount = allAlerts.filter((a) => a.severity === 'normal').length

  return (
    <div className="alerts-page-container">
      {/* Header Banner */}
      <section className="alerts-header-banner">
        <div className="alerts-header-text">
          <div className="alerts-kicker">
            <FaBell /> NATIONWIDE MONITORING & SAFETY ALERTS
          </div>
          <h1>Environmental Safety & Threshold Advisories</h1>
          <p>
            Real-time threshold monitoring, health advisories, and air quality alerts across all monitored locations in India.
          </p>
        </div>

        <div className="alerts-header-pills">
          <span className="alert-count-badge alert-count-badge--red">{criticalCount} Critical Alerts</span>
          <span className="alert-count-badge alert-count-badge--yellow">{warningCount} Warnings</span>
          <span className="alert-count-badge alert-count-badge--blue">{weatherCount} Weather Advisories</span>
        </div>
      </section>

      {/* Quick Summary Cards */}
      <div className="alerts-summary-grid">
        <div className="dash-card alert-sum-card alert-sum-card--red">
          <FaShieldAlt className="sum-icon red-icon" />
          <div>
            <span className="sum-title">Critical AQI Alerts</span>
            <h3>{criticalCount} Cities Affected</h3>
            <small>Delhi, Lucknow & High PM2.5 Zones</small>
          </div>
        </div>

        <div className="dash-card alert-sum-card alert-sum-card--yellow">
          <FaExclamationTriangle className="sum-icon yellow-icon" />
          <div>
            <span className="sum-title">Moderate Warnings</span>
            <h3>{warningCount} Cities Monitored</h3>
            <small>Jaipur, Ahmedabad, Kolkata</small>
          </div>
        </div>

        <div className="dash-card alert-sum-card alert-sum-card--blue">
          <FaCloudSun className="sum-icon blue-icon" />
          <div>
            <span className="sum-title">Weather Advisories</span>
            <h3>{weatherCount} Cities</h3>
            <small>Coastal & High Humidity Zones</small>
          </div>
        </div>

        <div className="dash-card alert-sum-card alert-sum-card--green">
          <FaCheckCircle className="sum-icon green-icon" />
          <div>
            <span className="sum-title">Satisfactory Air Quality</span>
            <h3>{normalCount} Cities</h3>
            <small>Bengaluru, Hyderabad, Pune, Chennai</small>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="alerts-filter-toolbar">
        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <span className="filter-label">Filter Location:</span>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="alert-select-input"
          >
            <option value="ALL">All Monitored Locations ({MONITORED_CITIES.length})</option>
            {MONITORED_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-label">Severity Level:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="alert-select-input"
          >
            <option value="ALL">All Alert Severities</option>
            <option value="critical">Critical / Severe AQI (&gt; 150)</option>
            <option value="warning">Moderate Warnings (100 - 150)</option>
            <option value="weather">Weather Advisories</option>
            <option value="normal">Normal Operational Status</option>
          </select>
        </div>

        <div className="filter-results-tag">
          Showing {filteredAlerts.length} Location Alert Records
        </div>
      </div>

      {/* Active Alerts List across ALL locations */}
      <div className="alerts-grid">
        {filteredAlerts.map((item) => {
          let cardModifier = 'alert-card-item--norm'
          let IconComp = FaCheckCircle
          let iconModifier = 'alert-card-icon--norm'
          let timePillModifier = 'alert-time-pill--green'
          let timePillText = 'NORMAL STATUS'

          if (item.severity === 'critical') {
            cardModifier = 'alert-card-item--critical'
            IconComp = FaShieldAlt
            iconModifier = 'alert-card-icon--critical'
            timePillModifier = 'alert-time-pill--red'
            timePillText = 'CRITICAL ALERT'
          } else if (item.severity === 'warning') {
            cardModifier = 'alert-card-item--warn'
            IconComp = FaExclamationTriangle
            iconModifier = 'alert-card-icon--warn'
            timePillModifier = 'alert-time-pill--yellow'
            timePillText = 'MODERATE WARNING'
          } else if (item.severity === 'weather') {
            cardModifier = 'alert-card-item--info'
            IconComp = FaInfoCircle
            iconModifier = 'alert-card-icon--info'
            timePillModifier = 'alert-time-pill--blue'
            timePillText = 'WEATHER NOTICE'
          }

          return (
            <div key={item.city} className={`dash-card alert-card-item ${cardModifier}`}>
              <IconComp className={`alert-card-icon ${iconModifier}`} />

              <div className="alert-card-content">
                <div className="alert-card-top">
                  <div className="alert-loc-title">
                    <span className="city-loc-pill">
                      <FaMapMarkerAlt /> {item.city}, {item.state}
                    </span>
                    <h3>{item.title}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <StatusPill value={item.status} />
                    <span className={`alert-time-pill ${timePillModifier}`}>{timePillText}</span>
                  </div>
                </div>

                <p className="alert-desc">{item.description}</p>

                <div className="alert-card-footer">
                  <div className="alert-meta-stats">
                    <span>AQI: <strong>{item.aqi}</strong></span>
                    <span>PM2.5: <strong>{item.pm25.toFixed(1)} µg/m³</strong></span>
                    <span>PM10: <strong>{item.pm10.toFixed(1)} µg/m³</strong></span>
                    <span>Temp: <strong>{item.temp}°C</strong></span>
                    <span>Humidity: <strong>{item.humidity}%</strong></span>
                  </div>

                  <div className="alert-action-side">
                    <small className="alert-timestamp">{item.timestamp}</small>
                    <button
                      type="button"
                      className="view-city-btn"
                      onClick={() => setSelectedCity(item.city)}
                    >
                      View {item.city} Dashboard →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {filteredAlerts.length === 0 && (
          <div className="dash-card no-alerts-card">
            <FaCheckCircle className="no-alerts-icon" />
            <h3>No Alerts Found for Selected Criteria</h3>
            <p>No active alerts match your current location or severity filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertsPage
