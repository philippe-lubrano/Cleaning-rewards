import { useApp } from '../context/useApp'

export default function Tasks() {
  const { tasks, history, completeTask, undoTaskCompletion } = useApp()

  const now = new Date()
  const dueTasks = tasks.filter((t) => new Date(t.next_due) <= now)
  const upcomingTasks = tasks.filter((t) => new Date(t.next_due) > now)

  const latestUndoEntryByTaskId = history.reduce((acc, entry) => {
    if (entry.type !== 'task') return acc

    const existing = acc[entry.reference_id]
    if (!existing || new Date(entry.created_at) > new Date(existing.created_at)) {
      acc[entry.reference_id] = entry
    }
    return acc
  }, {})

  const handleComplete = async (taskId) => {
    await completeTask(taskId)
  }

  const handleUndo = async (entryId) => {
    await undoTaskCompletion(entryId)
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
                className="w-full bg-white rounded-xl border px-4 py-4 flex items-center justify-between text-left transition-all border-amber-200"
              >
                <div>
                  <p className="font-medium text-stone-700">{task.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Tous les {task.recurrence_days} jour{task.recurrence_days > 1 ? 's' : ''}
                  </p>
                </div>
                <span className="rounded-xl px-4 py-2 text-sm font-medium transition-all bg-teal-500 text-white">
                  +{task.points} pts
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
                className="relative bg-white/60 rounded-xl border border-stone-100 px-4 py-3 flex items-center justify-between"
              >
                {latestUndoEntryByTaskId[task.id] && (
                  <button
                    type="button"
                    onClick={() => handleUndo(latestUndoEntryByTaskId[task.id].id)}
                    className="absolute -top-2 -right-2 z-10 h-7 w-7 rounded-full bg-rose-500 text-white text-sm font-bold hover:bg-rose-600"
                    title="Annuler"
                  >
                    ✕
                  </button>
                )}
                <div>
                  <p className="text-sm text-stone-500">{task.name}</p>
                  <p className="text-xs text-stone-300 mt-0.5">{formatDue(task.next_due)}</p>
                </div>
                <div className="flex items-center gap-2 pr-8">
                  <span className="text-xs text-stone-300 bg-stone-100 px-2 py-1 rounded-full">
                    {task.points} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
