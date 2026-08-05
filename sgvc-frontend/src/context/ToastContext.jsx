import { createContext, useContext, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200)
  }

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const styles = {
    success: { icon: CheckCircle2, cls: 'border-green-200 text-green-700 bg-white' },
    error: { icon: XCircle, cls: 'border-red-200 text-red-700 bg-white' },
    info: { icon: Info, cls: 'border-blue-200 text-blue-700 bg-white' },
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => {
          const { icon: Icon, cls } = styles[t.type] || styles.info
          return (
            <div
              key={t.id}
              className={`${cls} border rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 animate-[fadeInUp_0.2s_ease-out]`}
            >
              <Icon size={20} className="shrink-0" />
              <p className="text-sm font-medium flex-1">{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="text-on-surface-variant hover:text-on-surface">
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
