// src/components/dashboard/PerformanceTrends.tsx
// DASH-05: session score trend over time using Recharts LineChart.
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { format } from 'date-fns'
import { usePerformanceTrends } from '../../hooks/usePerformanceTrends'

export function PerformanceTrends() {
  const { data: trends = [], isLoading } = usePerformanceTrends()

  if (isLoading) {
    return <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
  }

  if (trends.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-400 text-sm">Complete sessions to see your progress over time.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Performance Over Time</h2>
      <div
        role="img"
        aria-label="Line chart showing quiz score trend over time"
      >
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={trends}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={d => {
                try { return format(new Date(d), 'MMM d') }
                catch { return '' }
              }}
              tick={{ fontSize: 11 }}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip
              labelFormatter={label => {
                try { return format(new Date(label as string), 'MMM d, yyyy') }
                catch { return label as string }
              }}
              formatter={(value: number | undefined) => [`${value ?? 0}`, 'Score']}
            />
            <Line
              type="monotone"
              dataKey="avgScore"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: '#2563eb', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
