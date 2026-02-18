// src/components/quiz/ProgressIndicator.tsx
// Displays progress through the current quiz session.
// Shows "Question X of Y" text and a visual progress bar.
interface ProgressIndicatorProps {
  current: number   // 1-based current question number
  total: number     // Total questions in session
  percent: number   // 0-100 completion percentage
}

export function ProgressIndicator({ current, total, percent }: ProgressIndicatorProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Question {current} of {total}
        </span>
        <span className="text-xs text-gray-500">{percent}% complete</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Question ${current} of ${total}`}
        />
      </div>
    </div>
  )
}
