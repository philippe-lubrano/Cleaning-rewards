import { useApp } from '../context/useApp'

export default function History() {
  const { history, users } = useApp()

  const getUserName = (userId) =>
    users.find((u) => u.id === userId)?.name || 'Inconnu'

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })

  // Group by date
  const grouped = history.reduce((acc, entry) => {
    const day = new Date(entry.created_at).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    if (!acc[day]) acc[day] = []
    acc[day].push(entry)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-stone-700">📋 Historique</h2>

      {history.length === 0 && (
        <div className="text-center py-8">
          <span className="text-4xl block mb-3">📭</span>
          <p className="text-stone-400">Aucune activité pour le moment</p>
          <p className="text-stone-300 text-sm">Complète des tâches pour voir ton historique</p>
        </div>
      )}

      {Object.entries(grouped).map(([day, entries]) => (
        <div key={day}>
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2 capitalize">
            {day}
          </h3>
          <div className="space-y-1.5">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl border border-stone-200 px-4 py-3 flex items-center gap-3"
              >
                <span className="text-lg">
                  {entry.type === 'task' ? '✅' : '🎁'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-700 truncate">{entry.description}</p>
                  <p className="text-xs text-stone-400">
                    {getUserName(entry.user_id)} · {formatDate(entry.created_at)}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium whitespace-nowrap ${
                    entry.points > 0 ? 'text-green-500' : 'text-rose-500'
                  }`}
                >
                  {entry.points > 0 ? '+' : ''}
                  {entry.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
