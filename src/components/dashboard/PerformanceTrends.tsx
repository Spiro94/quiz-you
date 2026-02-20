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
    return <div className="h-64 bg-subtle rounded-lg animate-pulse" />
  }

  if (trends.length === 0) {
    return (
      <div className="bg-surface rounded-lg border border-border p-6 text-center">
        <p className="text-muted-foreground text-sm">Complete sessions to see your progress over time.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <h2 className="text-base font-semibold text-foreground mb-4">Performance Over Time</h2>
      <div
        role="img"
        aria-label="Line chart showing quiz score trend over time"
      >
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={trends}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2E2E3F" strokeOpacity={0.5} />
            <XAxis
              dataKey="date"
              tickFormatter={d => {
                try { return format(new Date(d), 'MMM d') }
                catch { return '' }
              }}
              tick={{ fill: '#A1A1B5', fontSize: 11 }}
              axisLine={{ stroke: '#2E2E3F' }}
              tickLine={{ stroke: '#2E2E3F' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#A1A1B5', fontSize: 11 }}
              axisLine={{ stroke: '#2E2E3F' }}
              tickLine={{ stroke: '#2E2E3F' }}
            />
            <Tooltip
              labelFormatter={label => {
                try { return format(new Date(label as string), 'MMM d, yyyy') }
                catch { return label as string }
              }}
              formatter={(value: number | undefined) => [`${value ?? 0}`, 'Score']}
              contentStyle={{ backgroundColor: '#1C1C27', border: '1px solid #2E2E3F', borderRadius: '6px', color: '#F4F4F6' }}
            />
            <Line
              type="monotone"
              dataKey="avgScore"
              stroke="#7C3AED"
              strokeWidth={2}
              dot={{ fill: '#7C3AED', r: 3 }}
              activeDot={{ r: 5, fill: '#06B6D4' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
