export default function StatCard({ icon: Icon, label, value, sublabel, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    error: 'bg-error-50 text-error-600',
    neutral: 'bg-neutral-100 text-neutral-600',
  }
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}>
          {Icon && <Icon size={20} />}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
          <p className="text-xl font-semibold text-neutral-900">{value}</p>
          {sublabel && <p className="text-xs text-neutral-400">{sublabel}</p>}
        </div>
      </div>
    </div>
  )
}
