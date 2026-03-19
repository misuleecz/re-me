import { ColorKey, SectionType } from './types'

export const COLORS: Record<ColorKey, { bg: string; text: string; muted: string }> = {
  yellow: { bg: '#FFE600', text: '#0D0D0D', muted: '#D4C000' },
  pink:   { bg: '#FF2D78', text: '#FFFFFF', muted: '#CC1F5E' },
  lime:   { bg: '#C8FF00', text: '#0D0D0D', muted: '#A3CC00' },
  violet: { bg: '#6B2FFF', text: '#FFFFFF', muted: '#5520CC' },
  orange: { bg: '#FF6B2B', text: '#0D0D0D', muted: '#CC5520' },
  cyan:   { bg: '#00E5F5', text: '#0D0D0D', muted: '#00B8C8' },
}

export const SECTION_COLORS: Record<SectionType, ColorKey> = {
  podcast: 'yellow',
  video:   'pink',
  article: 'lime',
  concept: 'violet',
  thought: 'orange',
}

const COLOR_CYCLE: ColorKey[] = ['lime', 'pink', 'yellow', 'cyan', 'violet', 'orange']

export function getDayColor(day: number): ColorKey {
  return COLOR_CYCLE[day % COLOR_CYCLE.length]
}
