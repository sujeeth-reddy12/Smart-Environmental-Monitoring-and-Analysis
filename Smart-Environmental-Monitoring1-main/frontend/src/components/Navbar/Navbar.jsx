import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FaTachometerAlt,
  FaMapMarkerAlt,
  FaBalanceScale,
  FaTrophy,
  FaChartLine,
  FaBrain,
  FaBell,
  FaHistory,
  FaFileAlt,
  FaCog,
  FaLeaf,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { logout } from '../../services/api'
import './Navbar.css'

const navItems = [
  { to: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
  { to: '/location-search', label: 'Location Search', icon: <FaMapMarkerAlt /> },
  { to: '/comparison', label: 'Comparison', icon: <FaBalanceScale /> },
  { to: '/rankings', label: 'Rankings', icon: <FaTrophy /> },
  { to: '/trends', label: 'Trends & Analysis', icon: <FaChartLine /> },
  { to: '/prediction', label: 'Predictions', icon: <FaBrain /> },
  { to: '/alerts', label: 'Alerts', icon: <FaBell /> },
  { to: '/history', label: 'History', icon: <FaHistory /> },
  { to: '/reports', label: 'Reports', icon: <FaFileAlt /> },
  { to: '/profile', label: 'Profile & Settings', icon: <FaCog /> },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, signOut } = useAuth()
  const navigate = useNavigate()
  const closeMenu = () => setMenuOpen(false)

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      signOut()
      navigate('/login', { replace: true })
    }
  }

  return (
    <aside className={`sidebar-nav ${menuOpen ? 'sidebar-nav--open' : ''}`}>
      <button
        type="button"
        className="sidebar-nav__toggle"
        aria-label="Toggle navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <nav className="sidebar-nav__links">
        {navItems.map(({ to, label, icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-nav__link ${isActive ? 'sidebar-nav__link--active' : ''}`
            }
            onClick={closeMenu}
          >
            <span className="sidebar-nav__icon">{icon}</span>
            <span className="sidebar-nav__label">{label}</span>
            {badge && <span className="sidebar-nav__badge">{badge}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Sidebar Feature Card */}
      <div className="sidebar-nav__promo-card">
        <div className="promo-card__icon-wrap">
          <FaLeaf className="promo-card__icon" />
        </div>
        <div className="promo-card__text">
          <strong>Cleaner Air</strong>
          <strong>Healthier Tomorrow</strong>
        </div>
        <div className="promo-card__illustration">
          <svg
            viewBox="0 0 200 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="skyline-svg"
          >
            <path
              d="M10 60 V40 H25 V30 H35 V60 M40 60 V25 H55 V60 M60 60 V35 H70 V20 H85 V60 M90 60 V15 H105 V60 M110 60 V35 H125 V60 M130 60 V25 H145 V60 M150 60 V40 H165 V20 H180 V60 M185 60 V45 H195 V60"
              stroke="rgba(16, 185, 129, 0.4)"
              strokeWidth="2"
              fill="rgba(16, 185, 129, 0.1)"
            />
            <circle cx="47" cy="18" r="4" fill="rgba(16, 185, 129, 0.5)" />
            <circle cx="97" cy="10" r="5" fill="rgba(16, 185, 129, 0.6)" />
            <circle cx="172" cy="14" r="4" fill="rgba(16, 185, 129, 0.5)" />
          </svg>
        </div>
      </div>

      {isAuthenticated && (
        <button
          type="button"
          className="sidebar-nav__logout"
          onClick={handleLogout}
          title="Log out"
        >
          <FaSignOutAlt />
          <span>Log out</span>
        </button>
      )}
    </aside>
  )
}

export default Navbar
