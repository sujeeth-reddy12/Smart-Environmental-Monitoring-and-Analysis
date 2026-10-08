function PredictionForm({ fields, values, onChange, onSubmit, busy = false }) {
  return (
    <form className="prediction-form" onSubmit={onSubmit}>
      <div className="prediction-fields">
        {fields.map(({ name, label }) => (
          <label key={name}>
            {label}
            <input
              name={name}
              type="number"
              min="0"
              step="any"
              value={values[name] ?? ''}
              onChange={(event) => onChange(name, event.target.value)}
              required
            />
          </label>
        ))}
      </div>
      <button className="primary-button" type="submit" disabled={busy}>
        {busy ? 'Analyzing...' : 'Predict AQI'}
      </button>
    </form>
  )
}

export default PredictionForm
