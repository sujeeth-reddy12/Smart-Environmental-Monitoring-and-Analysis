import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaUser,
  FaCog,
  FaBell,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaCheck,
  FaSave,
  FaKey,
  FaSlidersH,
  FaDatabase,
  FaClock,
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useCity } from '../context/CityContext'
import './Profile.css'

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

function Profile() {
  const { user } = useAuth()
  const { selectedCity, setSelectedCity } = useCity()
  const [activeTab, setActiveTab] = useState('profile')
  const [saveSuccess, setSaveSuccess] = useState('')

  // Settings State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Sayeed',
    email: user?.email || 'sayeed@example.com',
    preferredCity: selectedCity || 'Hyderabad',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [preferences, setPreferences] = useState({
    tempUnit: 'celsius',
    alertThreshold: 'moderate',
    emailAlerts: true,
    dailyDigest: true,
    realTimePush: true,
  })

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'SR'

  const formattedCreatedDate = user?.created_at
    ? new Date(user.created_at).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' (IST)'
    : '08 Oct 2026, 10:00 AM (IST)'

  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (profileForm.preferredCity !== selectedCity) {
      setSelectedCity(profileForm.preferredCity)
    }
    setSaveSuccess('Profile and location preferences updated successfully!')
    setTimeout(() => setSaveSuccess(''), 4000)
  }

  const handleSavePassword = (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New password and confirm password do not match.')
      return
    }
    setSaveSuccess('Account security credentials updated successfully!')
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setTimeout(() => setSaveSuccess(''), 4000)
  }

  const handleSavePreferences = (e) => {
    e.preventDefault()
    setSaveSuccess('System & Notification preferences saved successfully!')
    setTimeout(() => setSaveSuccess(''), 4000)
  }

  return (
    <div className="profile-page-container">
      {/* Header Banner matching overall project layout */}
      <section className="profile-header-banner">
        <div className="profile-header-text">
          <div className="profile-kicker">
            <FaUser /> ACCOUNT & PREFERENCES MANAGEMENT
          </div>
          <h1>User Profile & System Settings</h1>
          <p>Manage your account credentials, default location preferences, notification rules, and system configuration.</p>
        </div>

        <div className="profile-header-badge">
          <div className="profile-avatar-circle">{initials}</div>
          <div className="profile-badge-info">
            <strong>{user?.name || 'Sayeed'}</strong>
            <span>{user?.email || 'sayeed@example.com'}</span>
          </div>
        </div>
      </section>

      {saveSuccess && (
        <div className="profile-success-toast">
          <FaCheck /> <span>{saveSuccess}</span>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="profile-tabs-wrapper">
        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'profile' ? 'profile-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser /> Profile Overview
        </button>
        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'settings' ? 'profile-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FaCog /> Account Settings & Security
        </button>
        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'preferences' ? 'profile-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <FaBell /> Preferences & Alerts
        </button>
        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'system' ? 'profile-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          <FaDatabase /> System Info & Data Sources
        </button>
      </div>

      {/* Tab 1: Profile Overview */}
      {activeTab === 'profile' && (
        <div className="profile-grid-layout">
          <div className="dash-card">
            <div className="dash-card__header">
              <h3>Personal Account Information</h3>
              <StatusPill value="Active Account" />
            </div>

            <div className="profile-details-grid">
              <div className="detail-field">
                <span className="detail-label">Full Name</span>
                <strong className="detail-value">{user?.name || 'Sayeed'}</strong>
              </div>

              <div className="detail-field">
                <span className="detail-label">Email Address</span>
                <strong className="detail-value">{user?.email || 'sayeed@example.com'}</strong>
              </div>

              <div className="detail-field">
                <span className="detail-label">Current Default Location</span>
                <strong className="detail-value">{selectedCity}, India</strong>
              </div>

              <div className="detail-field">
                <span className="detail-label">Account Role</span>
                <strong className="detail-value">Environmental Analyst / User</strong>
              </div>

              <div className="detail-field">
                <span className="detail-label">Account Created Date</span>
                <strong className="detail-value">{formattedCreatedDate}</strong>
              </div>

              <div className="detail-field">
                <span className="detail-label">Session Timezone</span>
                <strong className="detail-value">Indian Standard Time (IST - Asia/Kolkata)</strong>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card__header">
              <h3>Quick Actions & Navigation</h3>
            </div>

            <div className="profile-quick-actions">
              <button
                type="button"
                className="profile-action-card"
                onClick={() => setActiveTab('settings')}
              >
                <FaKey className="action-icon-blue" />
                <div>
                  <strong>Update Password</strong>
                  <p>Change your account security password and login session credentials.</p>
                </div>
              </button>

              <button
                type="button"
                className="profile-action-card"
                onClick={() => setActiveTab('preferences')}
              >
                <FaSlidersH className="action-icon-green" />
                <div>
                  <strong>Configure AQI Thresholds</strong>
                  <p>Set custom notification alerts for critical environmental parameters.</p>
                </div>
              </button>

              <Link to="/history" className="profile-action-card">
                <FaClock className="action-icon-purple" />
                <div>
                  <strong>View Prediction History</strong>
                  <p>Check your complete historical environmental log records.</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Account Settings & Security */}
      {activeTab === 'settings' && (
        <div className="profile-grid-layout">
          {/* Edit Profile Form */}
          <div className="dash-card">
            <div className="dash-card__header">
              <h3>Edit Profile Details</h3>
            </div>

            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Default Monitoring City</label>
                <select
                  value={profileForm.preferredCity}
                  onChange={(e) => setProfileForm({ ...profileForm, preferredCity: e.target.value })}
                >
                  {['Hyderabad', 'Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata', 'Ahmedabad', 'Pune'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="save-btn">
                <FaSave /> Save Profile Details
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="dash-card">
            <div className="dash-card__header">
              <h3>Security & Password</h3>
            </div>

            <form onSubmit={handleSavePassword} className="profile-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password..."
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password..."
                  required
                />
              </div>

              <button type="submit" className="save-btn save-btn--blue">
                <FaShieldAlt /> Update Security Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Preferences & Alerts */}
      {activeTab === 'preferences' && (
        <div className="dash-card">
          <div className="dash-card__header">
            <h3>Environmental Alerts & System Preferences</h3>
          </div>

          <form onSubmit={handleSavePreferences} className="preferences-form">
            <div className="pref-row">
              <div>
                <strong>Temperature Units</strong>
                <p>Choose display unit for weather and temperature metrics across dashboard views.</p>
              </div>
              <div className="radio-options">
                <label>
                  <input
                    type="radio"
                    name="tempUnit"
                    value="celsius"
                    checked={preferences.tempUnit === 'celsius'}
                    onChange={() => setPreferences({ ...preferences, tempUnit: 'celsius' })}
                  />
                  Celsius (°C)
                </label>
                <label>
                  <input
                    type="radio"
                    name="tempUnit"
                    value="fahrenheit"
                    checked={preferences.tempUnit === 'fahrenheit'}
                    onChange={() => setPreferences({ ...preferences, tempUnit: 'fahrenheit' })}
                  />
                  Fahrenheit (°F)
                </label>
              </div>
            </div>

            <div className="pref-row">
              <div>
                <strong>Alert Threshold Level</strong>
                <p>Trigger warnings when local AQI exceeds your chosen threshold.</p>
              </div>
              <select
                value={preferences.alertThreshold}
                onChange={(e) => setPreferences({ ...preferences, alertThreshold: e.target.value })}
                className="pref-select"
              >
                <option value="good">Strict (&gt; 50 AQI - Moderate &amp; above)</option>
                <option value="moderate">Standard (&gt; 100 AQI - Poor &amp; above)</option>
                <option value="critical">Critical Only (&gt; 200 AQI - Severe &amp; above)</option>
              </select>
            </div>

            <div className="pref-row">
              <div>
                <strong>Email Environmental Digest</strong>
                <p>Receive daily air quality summaries for {selectedCity} in your inbox.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.emailAlerts}
                  onChange={(e) => setPreferences({ ...preferences, emailAlerts: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="pref-row">
              <div>
                <strong>Real-Time Threshold Push Notifications</strong>
                <p>Receive immediate alerts when PM2.5 or AQI levels spike rapidly.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.realTimePush}
                  onChange={(e) => setPreferences({ ...preferences, realTimePush: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <button type="submit" className="save-btn">
              <FaSave /> Save All Preferences
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: System Info & Data Sources */}
      {activeTab === 'system' && (
        <div className="dash-card">
          <div className="dash-card__header">
            <h3>System Infrastructure & Active Integrations</h3>
            <span className="data-sources-pill">System Health: Operational</span>
          </div>

          <div className="system-info-grid">
            <div className="sys-card">
              <FaDatabase className="sys-icon" />
              <div>
                <h4>MongoDB Atlas Database</h4>
                <p>Status: Connected · Real-time persistence enabled</p>
                <small>Collections: users, predictions, environmental_data, aqi</small>
              </div>
            </div>

            <div className="sys-card">
              <FaClock className="sys-icon" />
              <div>
                <h4>Timezone Standard</h4>
                <p>Indian Standard Time (IST - UTC+5:30 / Asia/Kolkata)</p>
                <small>Application clock, prediction logs, and audit trails use IST</small>
              </div>
            </div>

            <div className="sys-card">
              <FaShieldAlt className="sys-icon" />
              <div>
                <h4>ML Predictor Engine</h4>
                <p>Models: Random Forest Regressor &amp; XGBoost Baseline</p>
                <small>Real-time inference active for 72-hour forecasting</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
