import { useApp } from '../context/useApp'

export default function NotificationBanner() {
  const { notifications, dismissNotification, clearNotifications } = useApp()

  const handleDismiss = async (notifId) => {
    await dismissNotification(notifId)
  }

  const handleClear = async () => {
    await clearNotifications()
  }

  if (notifications.length === 0) return null

  return (
    <div className="max-w-lg mx-auto w-full px-4 pt-3">
      <div className="space-y-2">
        {notifications.map((notif) => (
          (() => {
            const isDonation = notif.message.startsWith('💚')

            return (
              <div
                key={notif.id}
                className={`rounded-xl px-4 py-3 flex items-start gap-3 animate-fade-in border ${
                  isDonation ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                }`}
              >
                <span className="text-2xl mt-0.5">{isDonation ? '💚' : '🎉'}</span>
                <div className="flex-1">
                  <p className={`text-sm ${isDonation ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {notif.message}
                  </p>
                  <p className={`text-xs mt-1 ${isDonation ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {new Date(notif.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                <button
                  onClick={() => handleDismiss(notif.id)}
                  className={`text-lg ${isDonation ? 'text-emerald-300 hover:text-emerald-500' : 'text-rose-300 hover:text-rose-500'}`}
                >
                  ✕
                </button>
              </div>
            )
          })()
        ))}
        {notifications.length > 1 && (
          <button
            onClick={handleClear}
            className="w-full text-center text-xs text-rose-400 hover:text-rose-600 py-1"
          >
            Tout effacer
          </button>
        )}
      </div>
    </div>
  )
}
