import './ForecastCard.css'

function ForecastCard({ label, aqi, category = 'Moderate' }) {
  return (
    <article className="forecast-card">
      <p className="forecast-card__label">{label}</p>
      <div className="forecast-card__value">{aqi}</div>
      <span className="forecast-card__badge">{category}</span>
    </article>
  )
}

export default ForecastCard
