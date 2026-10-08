import './PollutantCard.css'

function PollutantCard({ name, value }) {
  return (
    <article className="pollutant-card">
      <p className="pollutant-card__name">{name}</p>
      <strong className="pollutant-card__value">{value}</strong>
    </article>
  )
}

export default PollutantCard
