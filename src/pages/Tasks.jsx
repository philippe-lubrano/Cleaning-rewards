import { useState } from 'react'
import { useApp } from '../context/useApp'

export default function Tasks() {
  const { tasks, completeTask } = useApp()
  const [completedId, setCompletedId] = useState(null)

  const now = new Date()
  const dueTasks = tasks.filter((t) => new Date(t.next_due) <= now)
  const upcomingTasks = tasks.filter((t) => new Date(t.next_due) > now)

  const handleComplete = (taskId) => {
    const result = completeTask(taskId)
    if (result) {
      setCompletedId(taskId)
      setTimeout(() => setCompletedId(null), 1500)
    }
  }

  const formatDue = (dateStr) => {
    const date = new Date(dateStr)
    const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24))
    if (diff <= 0) return 'Maintenant'
    if (diff === 1) return 'Demain'
    return `Dans ${diff} jours`
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-stone-700">Mes Tâches</h2>

      {/* Due tasks */}
      {dueTasks.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-3">
            🔥 À faire
          </h3>
          <div className="space-y-2">
            {dueTasks.map((task) => (
              <button
                type="button"
                key={task.id}
                onClick={() => handleComplete(task.id)}
                disabled={completedId === task.id}
                className={`w-full bg-white rounded-xl border px-4 py-4 flex items-center justify-between text-left transition-all ${
                  completedId === task.id
                    ? 'border-green-300 bg-green-50 scale-[0.98]'
                    : 'border-amber-200'
                }`}
              >
                <div>
                  <p className="font-medium text-stone-700">{task.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Tous les {task.recurrence_days} jour{task.recurrence_days > 1 ? 's' : ''}
                  </p>
                </div>
                <span
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    completedId === task.id
                      ? 'bg-green-100 text-green-600'
                      : 'bg-teal-500 text-white'
                  }`}
                >
                  {completedId === task.id ? '✓ Fait !' : `+${task.points} pts`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {dueTasks.length === 0 && (
        <div className="text-center py-8">
          <span className="text-4xl block mb-3">🎉</span>
          <p className="text-stone-500 font-medium">Tout est fait !</p>
          <p className="text-stone-400 text-sm">Profite bien de ton temps libre</p>
        </div>
      )}

      {/* Upcoming tasks */}
      {upcomingTasks.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
            ⏰ À venir
          </h3>
          <div className="space-y-2">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/60 rounded-xl border border-stone-100 px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-stone-500">{task.name}</p>
                  <p className="text-xs text-stone-300 mt-0.5">{formatDue(task.next_due)}</p>
                </div>
                <span className="text-xs text-stone-300 bg-stone-100 px-2 py-1 rounded-full">
                  {task.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
