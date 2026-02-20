// src/components/dashboard/FilterBar.tsx
// Filter bar for session history: topic multi-select and date range inputs.
// Purely presentational — calls onFilterChange callback when filters change.
import { useState } from 'react'

// Matches Phase 2 QuizSetupForm topic list
const AVAILABLE_TOPICS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust',
  'Dart', 'Flutter', 'React', 'Node.js', 'SQL', 'System Design'
]

export interface FilterState {
  selectedTopics: string[]
  dateStart: string
  dateEnd: string
}

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  function toggleTopic(topic: string) {
    const next = selectedTopics.includes(topic)
      ? selectedTopics.filter(t => t !== topic)
      : [...selectedTopics, topic]
    setSelectedTopics(next)
    onFilterChange({ selectedTopics: next, dateStart, dateEnd })
  }

  function handleDateChange(field: 'start' | 'end', value: string) {
    const next = field === 'start'
      ? { selectedTopics, dateStart: value, dateEnd }
      : { selectedTopics, dateStart, dateEnd: value }
    if (field === 'start') setDateStart(value)
    else setDateEnd(value)
    onFilterChange(next)
  }

  function clearFilters() {
    setSelectedTopics([])
    setDateStart('')
    setDateEnd('')
    onFilterChange({ selectedTopics: [], dateStart: '', dateEnd: '' })
  }

  const hasFilters = selectedTopics.length > 0 || dateStart || dateEnd

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Filter Sessions</h3>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Date range */}
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={dateStart}
            onChange={e => handleDateChange('start', e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={dateEnd}
            onChange={e => handleDateChange('end', e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      {/* Topic chips */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Topics</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TOPICS.map(topic => (
            <button
              key={topic}
              onClick={() => toggleTopic(topic)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTopics.includes(topic)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
