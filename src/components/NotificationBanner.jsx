import { useApp } from '../context/useApp'

export default function NotificationBanner() {
  const { notifications, dismissNotification, clearNotifications } = useApp()

  if (notifications.length === 0) return null

  return (
    <div className="max-w-lg mx-auto w-full px-4 pt-3">
      <div className="space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-start gap-3 animate-fade-in"
          >
            <span className="text-2xl mt-0.5">🎉</span>
            <div className="flex-1">
              <p className="text-sm text-rose-700">{notif.message}</p>
              <p className="text-xs text-rose-400 mt-1">
                {new Date(notif.created_at).toLocaleString('fr-FR')}
              </p>
            </div>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-rose-300 hover:text-rose-500 text-lg"
            >
              ✕
            </button>
          </div>
        ))}
        {notifications.length > 1 && (
          <button
            onClick={clearNotifications}
            className="w-full text-center text-xs text-rose-400 hover:text-rose-600 py-1"
          >
            Tout effacer
          </button>
        )}
      </div>
    </div>
  )
}
