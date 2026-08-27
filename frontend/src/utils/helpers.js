// Utility helpers for generating mock data

export const uid = (prefix = 'id') => `${prefix}_${Math.random().toString(36).slice(2, 11)}`

export const todayAt = (hour, minute = 0) => {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const tomorrowAt = (hour, minute = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const daysFromNow = (days, hour = 10, minute = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export const seededRandom = (seed) => {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export const formatDate = (iso) => {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export const formatTime = (iso) => {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export const timeUntil = (iso) => {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'Now'
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  if (hours < 24) return `${hours}h ${remMins}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}
