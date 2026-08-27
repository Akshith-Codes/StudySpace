export default function LoadingState({ count = 3 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4">
          <div className="skeleton mb-3 h-4 w-3/4" />
          <div className="skeleton mb-4 h-3 w-1/2" />
          <div className="skeleton mb-3 h-2 w-full" />
          <div className="skeleton h-8 w-full" />
        </div>
      ))}
    </div>
  )
}
