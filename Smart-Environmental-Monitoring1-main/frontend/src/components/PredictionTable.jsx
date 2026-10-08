function PredictionTable({ predictions = [] }) {
  return (
    <div className="history-table-wrap">
      <table className="history-table">
        <thead><tr><th>Date/time</th><th>Predicted AQI</th><th>Status</th><th>Threshold</th></tr></thead>
        <tbody>
          {predictions.map((item, index) => (
            <tr key={item._id || `${item.timestamp}-${index}`}>
              <td>{new Date(item.timestamp).toLocaleString()}</td>
              <td>{Number(item.predicted_value).toFixed(1)}</td>
              <td>{item.environmental_status}</td>
              <td>{item.threshold_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PredictionTable
