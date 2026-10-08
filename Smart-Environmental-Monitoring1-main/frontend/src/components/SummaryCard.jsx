function SummaryCard({ label, value, unit, status }) {
  return (
    <article className="summary-card">
      <span>{label}</span>
      <strong>{value ?? '--'}</strong>
      {status || unit ? <small>{status || unit}</small> : null}
    </article>
  )
}

export default SummaryCard
