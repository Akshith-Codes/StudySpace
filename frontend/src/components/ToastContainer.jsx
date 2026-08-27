import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const ICONS = {
  success: { icon: CheckCircle2, color: 'text-success-600', bg: 'bg-success-50', border: 'border-success-200' },
  error: { icon: XCircle, color: 'text-error-600', bg: 'bg-error-50', border: 'border-error-200' },
  warning: { icon: AlertCircle, color: 'text-warning-600', bg: 'bg-warning-50', border: 'border-warning-200' },
  info: { icon: Info, color: 'text-primary-600', bg: 'bg-primary-50', border: 'border-primary-200' },
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp()
  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const config = ICONS[toast.type] || ICONS.info
        const Icon = config.icon
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-lg border ${config.border} ${config.bg} px-4 py-3 shadow-lg min-w-[280px] max-w-sm`}
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${config.color}`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900">{toast.title}</p>
              <p className="mt-0.5 text-xs text-neutral-600">{toast.message}</p>
            </div>
            <button onClick={() => dismissToast(toast.id)} className="text-neutral-400 hover:text-neutral-600">
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
