export default function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="card p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
      <Skeleton className="mt-4 h-2 w-full" />
      <Skeleton className="mt-3 h-6 w-full" />
      <Skeleton className="mt-3 h-6 w-full" />
    </div>
  )
}
