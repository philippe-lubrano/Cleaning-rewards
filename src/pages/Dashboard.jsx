import { useApp } from '../context/useApp'

export default function Dashboard() {
  const { currentUser, users, tasks, history } = useApp()

  const partner = users.find((u) => u.id !== currentUser.id)

  const todayStr = new Date().toDateString()
  const todayTasks = history.filter(
    (h) => h.type === 'task' && new Date(h.created_at).toDateString() === todayStr
  )
  const myTodayTasks = todayTasks.filter((h) => h.user_id === currentUser.id)
  const myTodayPoints = myTodayTasks.reduce((sum, h) => sum + h.points, 0)

  const dueTasks = tasks.filter((t) => new Date(t.next_due) <= new Date())

  return (
    <div className="space-y-6">
      {/* Points card */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-teal-100 text-sm mb-1">Ton solde</p>
        <p className="text-4xl font-bold mb-3">⭐ {currentUser.points}</p>
        <p className="text-teal-200 text-xs">
          +{myTodayPoints} points aujourd'hui
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-stone-200 text-center">
          <p className="text-2xl font-bold text-teal-600">{myTodayTasks.length}</p>
          <p className="text-xs text-stone-400 mt-1">Tâches aujourd'hui</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200 text-center">
          <p className="text-2xl font-bold text-amber-500">{dueTasks.length}</p>
          <p className="text-xs text-stone-400 mt-1">Tâches à faire</p>
        </div>
      </div>

      {/* Partner card */}
      {partner && (
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-sm font-semibold text-rose-600">
                {partner.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-stone-700">{partner.name}</p>
                <p className="text-xs text-stone-400">Partenaire</p>
              </div>
            </div>
            <span className="text-sm font-medium text-amber-500">
              ⭐ {partner.points} pts
            </span>
          </div>
        </div>
      )}

      {/* Due tasks preview */}
      {dueTasks.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
            À faire maintenant
          </h2>
          <div className="space-y-2">
            {dueTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl px-4 py-3 border border-stone-200 flex items-center justify-between"
              >
                <span className="text-sm text-stone-600">{task.name}</span>
                <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                  +{task.points} pts
                </span>
              </div>
            ))}
            {dueTasks.length > 3 && (
              <p className="text-xs text-stone-400 text-center">
                et {dueTasks.length - 3} autre(s)...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
