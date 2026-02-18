// src/components/dashboard/EmptyState.tsx
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-24">
      <div className="max-w-md">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          No sessions yet
        </h2>
        <p className="text-gray-500 mb-8">
          Start a quiz session to practice interview questions. Your sessions,
          scores, and progress will appear here after you complete your first quiz.
        </p>
        {/* Button becomes functional in Phase 2 */}
        <button
          disabled
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium opacity-50 cursor-not-allowed"
          title="Coming soon — available after Phase 2"
        >
          Start a quiz session
        </button>
        <p className="mt-3 text-xs text-gray-400">
          Quiz session setup is coming in the next update.
        </p>
      </div>
    </div>
  )
}
