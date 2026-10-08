import {
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import './Charts.css'

function PollutantTrendChart({ data = [] }) {
  return (
    <div className="chart-card">
      <div className="chart-card__chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#e6eef7" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: '#58708f', fontSize: 12 }} />
            <YAxis tick={{ fill: '#58708f', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #dbeafe",
                backgroundColor: "#ffffff",
              }}
              labelStyle={{
                fontWeight: "bold",
                color: "#1e3a5f",
              }}
            />
            <Legend />
            <Line
                type="monotone"
                dataKey="pm10"
                stroke="#0f4c81"
                strokeWidth={3}
                dot={{ r: 3 }}
            />

            <Line
                type="monotone"
                dataKey="pm25"
                stroke="#4f9bd9"
                strokeWidth={3}
                dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default PollutantTrendChart
