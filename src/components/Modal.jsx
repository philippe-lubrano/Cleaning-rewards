import { useRef } from 'react'

export default function Modal({ isOpen, onClose, title, children }) {
  const overlayRef = useRef(null)

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="bg-white w-full max-w-lg rounded-t-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-700">{title}</h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-xl"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
