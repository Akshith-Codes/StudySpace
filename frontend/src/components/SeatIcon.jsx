import { Plug, Eye, Volume2, Accessibility, Box, Armchair } from 'lucide-react'

const ICONS = {
  Standard: Armchair,
  Window: Eye,
  Charging: Plug,
  Silent: Volume2,
  Accessible: Accessibility,
  Cabin: Box,
}

function SeatIcon({ type, size = 16 }) {
  const Icon = ICONS[type] || ICONS.Standard
  return <Icon size={size} />
}

export { SeatIcon }
export default SeatIcon

export const SEAT_TYPE_ICONS = ICONS
