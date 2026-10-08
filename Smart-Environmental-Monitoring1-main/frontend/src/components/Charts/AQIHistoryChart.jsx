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

function AQIHistoryChart({ data = [] }) {
  return (
    <div className="chart-card">
      <div className="chart-card__chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#e6eef7" strokeDasharray="3 3" />
            <XAxis dataKey="label" interval="preserveStartEnd" angle={-18} textAnchor="end" height={48} tick={{ fill: '#58708f', fontSize: 11 }} />
            <YAxis tick={{ fill: '#58708f', fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke="#0f4c81"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#0f4c81' }}
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

export default AQIHistoryChart
