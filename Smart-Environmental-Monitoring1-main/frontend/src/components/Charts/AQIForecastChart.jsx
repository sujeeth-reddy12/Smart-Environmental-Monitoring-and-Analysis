import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './Charts.css'

function AQIForecastChart({ data = [] }) {
  return (
    <div className="chart-card">
      <h3 className="chart-card__title">AI Forecast Timeline</h3>
      <div className="chart-card__chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#e6eef7" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: '#58708f', fontSize: 12 }} />
            <YAxis tick={{ fill: '#58708f', fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke="#2f7dbb"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#2f7dbb' }}
              activeDot={{ r: 5 }}
              animationDuration={900}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AQIForecastChart
