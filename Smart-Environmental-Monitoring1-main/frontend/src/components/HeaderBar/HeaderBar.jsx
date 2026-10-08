import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaClock, FaChevronDown, FaUser, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { useCity } from '../../context/CityContext'
import { getCityDetails } from '../../utils/cityHelper'
import { logout } from '../../services/api'
import './HeaderBar.css'

function HeaderBar() {
  const { user, signOut } = useAuth()
  const { selectedCity, setSelectedCity } = useCity()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState('')
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const headerRef = useRef(null)
  const cityDetails = getCityDetails(selectedCity)

  const cities = [
    'Hyderabad',
    'Delhi',
    'Mumbai',
    'Bengaluru',
    'Chennai',
    'Kolkata',
    'Ahmedabad',
    'Pune',
  ]

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const formatted =
        now.toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) +
        ', ' +
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }) +
        ' (IST)'
      setCurrentTime(formatted)
    }
    updateClock()
    const timer = setInterval(updateClock, 30000)
    return () => clearInterval(timer)
  }, [])


  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setLocationDropdownOpen(false)
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setUserDropdownOpen(false)
    try {
      await logout()
    } finally {
      signOut()
      navigate('/login', { replace: true })
    }
  }

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'SR'

  return (
    <header className="top-header-bar" ref={headerRef}>
      <div className="top-header-bar__brand">
        <h1 className="top-header-bar__title">
          AI-Based Smart Environmental Monitoring & Analysis
        </h1>
        <p className="top-header-bar__subtitle">
          Real-Time Environmental Intelligence for Locations Across India
        </p>
      </div>

      <div className="top-header-bar__actions">
        {/* City Dropdown */}
        <div className="top-header-bar__location-select">
          <button
            type="button"
            className="location-pill-btn"
            onClick={() => {
              setLocationDropdownOpen(!locationDropdownOpen)
              setUserDropdownOpen(false)
            }}
            aria-label="Select location"
          >
            <FaMapMarkerAlt className="location-pill-btn__icon" />
            <span>{selectedCity}, {cityDetails.state}</span>
            <FaChevronDown className="location-pill-btn__chevron" />
          </button>
          {locationDropdownOpen && (
            <div className="location-dropdown-menu">
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  className={`location-dropdown-item ${
                    city === selectedCity ? 'location-dropdown-item--active' : ''
                  }`}
                  onClick={() => {
                    setSelectedCity(city)
                    setLocationDropdownOpen(false)
                  }}
                >
                  <FaMapMarkerAlt />
                  <span>{city}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Data Badge */}
        <div className="top-header-bar__live-badge">
          <span className="live-dot"></span>
          <span>Live Data</span>
        </div>

        {/* Date / Time */}
        <div className="top-header-bar__time">
          <FaClock className="time-icon" />
          <span>{currentTime}</span>
        </div>

        {/* User Profile Dropdown */}
        <div className="top-header-bar__user-wrapper">
          <button
            type="button"
            className="top-header-bar__user-profile"
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen)
              setLocationDropdownOpen(false)
            }}
            aria-label="User menu"
          >
            <div className="user-avatar-circle">{userInitials}</div>
            <span className="user-name-text">{user?.name || 'Sayeed'}</span>
            <FaChevronDown className="user-chevron" />
          </button>

          {userDropdownOpen && (
            <div className="user-dropdown-menu">
              <div className="user-dropdown-header">
                <strong>{user?.name || 'Sayeed'}</strong>
                <small>{user?.email || 'sayeed@example.com'}</small>
              </div>

              <div className="user-dropdown-divider" />

              <Link
                to="/profile"
                className="user-dropdown-item"
                onClick={() => setUserDropdownOpen(false)}
              >
                <FaUser />
                <span>Profile & Settings</span>
              </Link>

              <Link
                to="/about"
                className="user-dropdown-item"
                onClick={() => setUserDropdownOpen(false)}
              >
                <FaInfoCircle />
                <span>About EcoPulse</span>
              </Link>

              <div className="user-dropdown-divider" />

              <button
                type="button"
                className="user-dropdown-item user-dropdown-item--logout"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default HeaderBar
