// src/components/quiz/TopicBadge.tsx
// Displays a single topic as a small pill badge. Used in session header (QUIZ-06).
interface TopicBadgeProps {
  topic: string
}

export function TopicBadge({ topic }: TopicBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary-muted border border-primary px-2.5 py-0.5 text-xs font-medium text-primary">
      {topic}
    </span>
  )
}
