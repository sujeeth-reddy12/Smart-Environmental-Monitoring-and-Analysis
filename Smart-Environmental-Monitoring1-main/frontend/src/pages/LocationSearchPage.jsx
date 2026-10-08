import { useState } from 'react'
import { FaMapMarkerAlt, FaSearch, FaCrosshairs, FaCheck, FaThermometerHalf, FaTint, FaWind } from 'react-icons/fa'
import { useCity } from '../context/CityContext'
import { getCityDetails, findClosestCity, CITY_DATA_MAP } from '../utils/cityHelper'
import { searchLocations } from '../services/api'
import './LocationSearchPage.css'

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

function LocationSearchPage() {
  const { selectedCity, setSelectedCity } = useCity()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const cityList = Object.keys(CITY_DATA_MAP)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    try {
      const results = await searchLocations(query.trim())
      setSearchResults(results)
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  const handleSelectCity = (cityName) => {
    setSelectedCity(cityName)
    setSearchResults([])
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
      },
      (err) => {
        console.warn('Geolocation error:', err)
        setSelectedCity('Hyderabad')
      }
    )
  }

  return (
    <div className="location-page-container">
      {/* Header Banner */}
      <section className="location-header-banner">
        <div className="location-header-text">
          <div className="location-kicker">LOCATION SEARCH</div>
          <h1>Explore & Select Indian Cities</h1>
          <p>Real-time environmental monitoring across locations in India.</p>
        </div>

        <form onSubmit={handleSearch} className="location-search-form">
          <FaSearch className="loc-search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city or state (e.g. Hyderabad, Delhi, Mumbai, Gujarat...)"
          />
          <button type="button" className="loc-gps-btn" onClick={handleUseMyLocation} title="Use GPS Location">
            <FaCrosshairs /> Use My Location
          </button>
          <button type="submit" className="loc-search-btn" disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </section>

      {/* Dynamic Search Results */}
      {searchResults.length > 0 && (
        <section className="dash-card loc-results-section">
          <h3 className="section-title">Search Results</h3>
          <div className="loc-results-grid">
            {searchResults.map((loc) => (
              <button
                key={`${loc.name}-${loc.latitude}`}
                type="button"
                className="loc-result-card"
                onClick={() => handleSelectCity(loc.name)}
              >
                <div className="loc-result-header">
                  <FaMapMarkerAlt className="loc-pin" />
                  <strong>{loc.name}</strong>
                </div>
                <span>{loc.state || 'India'}</span>
                <small>{loc.latitude?.toFixed(2)}° N, {loc.longitude?.toFixed(2)}° E</small>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Indian Cities Grid */}
      <section className="dash-card">
        <div className="dash-card__header">
          <h3>Popular Locations in India</h3>
          <span className="data-sources-pill">Active Viewing: {selectedCity}</span>
        </div>

        <div className="city-cards-grid">
          {cityList.map((cityName) => {
            const details = getCityDetails(cityName)
            const isSelected = selectedCity === cityName

            return (
              <div
                key={cityName}
                className={`city-card ${isSelected ? 'city-card--active' : ''}`}
                onClick={() => handleSelectCity(cityName)}
              >
                <div className="city-card__header">
                  <div className="city-name-box">
                    <FaMapMarkerAlt className={isSelected ? 'pin-active' : 'pin-idle'} />
                    <div>
                      <h4>{cityName}</h4>
                      <small>{details.state}</small>
                    </div>
                  </div>
                  {isSelected && <span className="selected-badge"><FaCheck /> Viewing</span>}
                </div>

                <div className="city-card__metrics">
                  <div className="metric-box">
                    <span>AQI</span>
                    <strong>{details.aqi}</strong>
                    <StatusPill value={details.status} />
                  </div>
                  <div className="metric-box">
                    <span>Temp</span>
                    <strong>{details.temp}°C</strong>
                  </div>
                  <div className="metric-box">
                    <span>Humidity</span>
                    <strong>{details.humidity}%</strong>
                  </div>
                </div>

                <div className="city-card__footer">
                  <small>{details.lat}° N, {details.lon}° E</small>
                  <button type="button" className="select-city-btn">
                    {isSelected ? 'Active' : 'Select Location'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default LocationSearchPage
