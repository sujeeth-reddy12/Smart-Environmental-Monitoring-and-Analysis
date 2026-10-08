import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaHeartbeat,
  FaInfoCircle,
} from 'react-icons/fa'
import './HealthRecommendation.css'

function getHealthStatus(text = '') {
  const lowerText = text.toLowerCase()

  if (lowerText.includes('very poor') || lowerText.includes('hazardous')) {
    return {
      level: 'Very Poor',
      tone: 'red',
      Icon: FaExclamationCircle,
    }
  }

  if (lowerText.includes('poor')) {
    return {
      level: 'Poor',
      tone: 'orange',
      Icon: FaExclamationTriangle,
    }
  }

  if (lowerText.includes('moderate') || lowerText.includes('sensitive')) {
    return {
      level: 'Moderate',
      tone: 'yellow',
      Icon: FaInfoCircle,
    }
  }

  if (lowerText.includes('good') || lowerText.includes('perfect')) {
    return {
      level: 'Good',
      tone: 'green',
      Icon: FaCheckCircle,
    }
  }

  return {
    level: 'Notice',
    tone: 'yellow',
    Icon: FaHeartbeat,
  }
}

function HealthRecommendation({ text }) {
  const { level, tone, Icon } = getHealthStatus(text)

  return (
    <article className={`health-card health-card--${tone}`}>
      <div className="health-card__header">
        <div className="health-card__title-group">
          <span className="health-card__icon" aria-hidden="true">
            <Icon />
          </span>
          <h3 className="health-card__title">Health Recommendation</h3>
        </div>
        <span className={`health-card__badge health-card__badge--${tone}`}>{level}</span>
      </div>
      <p className="health-card__text">{text}</p>
    </article>
  )
}

export default HealthRecommendation

