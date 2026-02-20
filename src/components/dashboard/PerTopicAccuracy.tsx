// src/components/dashboard/PerTopicAccuracy.tsx
// DASH-04: per-topic accuracy bar chart using Recharts.
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import { useTopicAccuracy } from '../../hooks/useTopicAccuracy'

function scoreToColor(score: number): string {
  if (score >= 85) return '#16a34a'  // green-600
  if (score >= 70) return '#2563eb'  // blue-600
  if (score >= 50) return '#ca8a04'  // yellow-600
  return '#dc2626'                   // red-600
}

export function PerTopicAccuracy() {
  const { data: topics = [], isLoading } = useTopicAccuracy()

  if (isLoading) {
    return <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
  }

  if (topics.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-400 text-sm">Complete a quiz to see topic accuracy.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Accuracy by Topic</h2>
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
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}`} />
            <YAxis
              type="category"
              dataKey="topic"
              width={100}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number | undefined, _name: string | undefined, props) => [
                `${value ?? 0} avg (${props.payload.count} questions)`,
                'Score'
              ]}
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
