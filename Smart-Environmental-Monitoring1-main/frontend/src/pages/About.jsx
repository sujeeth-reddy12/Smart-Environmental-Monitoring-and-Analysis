import {
  FaCloudSun,
  FaBrain,
  FaHeartbeat,
  FaChartLine,
  FaSearch,
  FaWind,
  FaTools,
} from 'react-icons/fa'
import { FiActivity, FiMonitor, FiGlobe, FiDatabase} from 'react-icons/fi'
import './About.css'

function About() {
  const overviewCards = [
    {
      title: 'Live AQI Monitoring',
      description: 'Track live air quality levels with a clear, actionable AQI view.',
      icon: <FiActivity />,
    },
    {
      title: 'Weather Monitoring',
      description: 'Understand environmental conditions through temperature, humidity, and wind insights.',
      icon: <FaCloudSun />,
    },
    {
      title: 'AI-based AQI Prediction',
      description: 'Use forecast models to anticipate future air conditions and potential risks.',
      icon: <FaBrain />,
    },
    {
      title: 'Health Recommendations',
      description: 'Receive actionable guidance that helps users make safer decisions.',
      icon: <FaHeartbeat />,
    },
    {
      title: 'Interactive Dashboard',
      description: 'Explore air quality information through intuitive, responsive visuals.',
      icon: <FaChartLine />,
    },
  ]

  const featureCards = [
    { title: 'Live Air Quality Monitoring', icon: <FiActivity /> },
    { title: 'Weather Monitoring', icon: <FaCloudSun /> },
    { title: 'AI Forecasting', icon: <FaBrain /> },
    { title: 'Historical AQI Trends', icon: <FaChartLine /> },
    { title: 'Pollutant Analysis', icon: <FaWind /> },
    { title: 'Health Advisory', icon: <FaHeartbeat /> },
    { title: 'Responsive Dashboard', icon: <FiMonitor /> },
    { title: 'Search by City', icon: <FaSearch /> },
  ]

  const techGroups = [
    {
      title: 'Frontend',
      items: ['React', 'React Router', 'Recharts', 'React Leaflet', 'Axios', 'React Icons'],
    },
    {
      title: 'Backend',
      items: ['FastAPI', 'Pydantic'],
    },
    {
      title: 'Database',
      items: ['MongoDB Atlas'],
    },
    {
      title: 'Machine Learning',
      items: ['Python', 'Scikit-learn', 'Joblib'],
    },
    {
      title: 'Deployment',
      items: ['Vercel', 'Render'],
    },
  ]

  const enhancements = [
    'Real-time AQI Notifications',
    'Multi-city Dashboard',
    'IoT Sensor Integration',
    'Satellite-based Pollution Monitoring',
    'AI Health Risk Assessment',
    'Mobile Application',
  ]

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero__content">
          <p className="about-hero__eyebrow">About EcoPulse</p>
          <h1 className="about-hero__title">EcoPulse</h1>
          <p className="about-hero__subtitle">
            EcoPulse combines live environmental monitoring, AI-powered forecasting, and personalized health recommendations to help citizens understand and respond to changing air quality in real time.
          </p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-section__header">
          <h2 className="about-section__title">Project Overview</h2>
          <p className="about-section__text">
            The platform integrates live environmental data, weather conditions, historical trends, and machine learning models to provide accurate air quality insights and proactive health guidance.
          </p>
        </div>
        <div className="about-grid">
          {overviewCards.map((card) => (
            <article className="about-card" key={card.title}>
              <div className="about-card__icon">{card.icon}</div>
              <h3 className="about-card__title">{card.title}</h3>
              <p className="about-card__description">{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="about-section__header">
          <h2 className="about-section__title">Features</h2>
          <p className="about-section__text">
            A feature-rich interface designed for clarity, speed, and insight.
          </p>
        </div>
        <div className="about-grid">
          {featureCards.map((feature) => (
            <article className="about-card" key={feature.title}>
              <div className="about-card__icon">{feature.icon}</div>
              <h3 className="about-card__title">{feature.title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="about-section__header">
          <h2 className="about-section__title">Technology Stack</h2>
          <p className="about-section__text">
            Built with a modern stack for monitoring, analysis, and deployment.
          </p>
        </div>
        <div className="about-grid">
          {techGroups.map((group) => (
            <div className="about-tech-group" key={group.title}>
              <h3 className="about-tech-group__title">{group.title}</h3>
              <div className="about-tech-group__list">
                {group.items.map((item) => (
                  <span className="about-pill" key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="about-section__header">
          <h2 className="about-section__title">Future Enhancements</h2>
          <p className="about-section__text">
            Planned upgrades to expand the platform’s reach and intelligence.
          </p>
        </div>
        <div className="about-grid">
          {enhancements.map((item) => (
            <article className="about-card" key={item}>
              <div className="about-card__icon"><FaTools /></div>
              <h3 className="about-card__title">{item}</h3>
            </article>
          ))}
        </div>
      </section>

    </div>
  )
}

export default About
