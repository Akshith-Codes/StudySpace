import { AlertCircle } from 'lucide-react'

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-50">
        <AlertCircle size={24} className="text-error-500" />
      </div>
      <h3 className="text-sm font-semibold text-neutral-900">{message || 'Something went wrong'}</h3>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4">
          Try Again
        </button>
      )}
    </div>
  )
}
