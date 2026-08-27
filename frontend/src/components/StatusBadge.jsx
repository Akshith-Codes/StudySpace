import { AVAILABILITY_LEVELS } from '../types/constants'

const STYLES = {
  Available: 'badge-success',
  Moderate: 'badge-warning',
  Crowded: 'badge-error',
  Full: 'badge-neutral',
  Upcoming: 'badge-primary',
  Active: 'badge-success',
  Completed: 'badge-neutral',
  Cancelled: 'badge-neutral',
  'No-show': 'badge-error',
  Reported: 'badge-warning',
  'In Progress': 'badge-primary',
  Resolved: 'badge-success',
  waiting: 'badge-warning',
  notified: 'badge-primary',
}

export default function StatusBadge({ status, label }) {
  const style = STYLES[status] || 'badge-neutral'
  const text = label || status
  return <span className={style}>{text}</span>
}

export function getAvailabilityBadge(availability) {
  return STYLES[availability] || 'badge-neutral'
}
