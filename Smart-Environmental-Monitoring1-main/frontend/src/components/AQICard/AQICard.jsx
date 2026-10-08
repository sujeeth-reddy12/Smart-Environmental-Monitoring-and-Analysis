import './AQICard.css'

const categoryToneMap = {
  Good: 'good',
  Moderate: 'moderate',
  Poor: 'poor',
  'Very Poor': 'very-poor',
  Severe: 'severe',
}

function AQICard({ city, aqi, category = 'Moderate', title = 'Current AQI' }) {
  const tone = categoryToneMap[category] || 'moderate'

  return (
    <article className={`aqi-card aqi-card--${tone}`}>
      <div className="aqi-card__header">
        <div>
          <p className="aqi-card__label">{title}</p>
          <h3 className="aqi-card__city">{city}</h3>
        </div>
        <span className="aqi-card__badge">{category}</span>
      </div>
      <div className="aqi-card__value">{aqi}</div>
      <p className="aqi-card__meta">Air quality index</p>
    </article>
  )
}

export default AQICard
