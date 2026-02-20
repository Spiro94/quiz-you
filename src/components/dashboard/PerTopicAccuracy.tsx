// src/components/dashboard/PerTopicAccuracy.tsx
// DASH-04: per-topic accuracy bar chart using Recharts.
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import { useTopicAccuracy } from '../../hooks/useTopicAccuracy'

// Token hex values for Recharts (CSS classes don't work on chart element props)
// success: #10B981 | accent: #06B6D4 | warning: #F59E0B | error: #EF4444
function scoreToColor(score: number): string {
  if (score >= 85) return '#10B981'  // success
  if (score >= 70) return '#06B6D4'  // accent (cyan)
  if (score >= 50) return '#F59E0B'  // warning
  return '#EF4444'                   // error
}

export function PerTopicAccuracy() {
  const { data: topics = [], isLoading } = useTopicAccuracy()

  if (isLoading) {
    return <div className="h-64 bg-subtle rounded-lg animate-pulse" />
  }

  if (topics.length === 0) {
    return (
      <div className="bg-surface rounded-lg border border-border p-6 text-center">
        <p className="text-muted-foreground text-sm">Complete a quiz to see topic accuracy.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <h2 className="text-base font-semibold text-foreground mb-4">Accuracy by Topic</h2>
      <div
        role="img"
        aria-label="Bar chart showing average score per topic"
      >
        <ResponsiveContainer width="100%" height={Math.max(200, topics.length * 40)}>
          <BarChart
            data={topics}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2E2E3F" strokeOpacity={0.5} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={v => `${v}`}
              tick={{ fill: '#A1A1B5', fontSize: 11 }}
              axisLine={{ stroke: '#2E2E3F' }}
              tickLine={{ stroke: '#2E2E3F' }}
            />
            <YAxis
              type="category"
              dataKey="topic"
              width={100}
              tick={{ fill: '#A1A1B5', fontSize: 12 }}
              axisLine={{ stroke: '#2E2E3F' }}
              tickLine={{ stroke: '#2E2E3F' }}
            />
            <Tooltip
              formatter={(value: number | undefined, _name: string | undefined, props) => [
                `${value ?? 0} avg (${props.payload.count} questions)`,
                'Score'
              ]}
              contentStyle={{ backgroundColor: '#1C1C27', border: '1px solid #2E2E3F', borderRadius: '6px', color: '#F4F4F6' }}
            />
            <Bar dataKey="avgScore" radius={[0, 4, 4, 0]}>
              {topics.map((entry, index) => (
                <Cell key={index} fill={scoreToColor(entry.avgScore)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
