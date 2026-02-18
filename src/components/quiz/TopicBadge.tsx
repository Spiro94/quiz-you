// src/components/quiz/TopicBadge.tsx
// Displays a single topic as a small pill badge. Used in session header (QUIZ-06).
interface TopicBadgeProps {
  topic: string
}

export function TopicBadge({ topic }: TopicBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-700">
      {topic}
    </span>
  )
}
