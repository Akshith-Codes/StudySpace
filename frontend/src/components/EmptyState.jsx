export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <Icon size={24} className="text-neutral-400" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-neutral-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
