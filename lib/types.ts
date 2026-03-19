export type ColorKey = 'yellow' | 'pink' | 'lime' | 'violet' | 'orange' | 'cyan'

export type SectionType = 'podcast' | 'video' | 'article' | 'concept' | 'thought'

export interface Section {
  type: SectionType
  emoji: string
  label: string
  title: string
  source?: string | null
  description: string
  link?: string | null
  duration?: string | null
  tags?: string[]
}

export interface DayBriefing {
  date: string // YYYY-MM-DD
  headline: string
  subheadline: string
  emoji: string
  color: ColorKey
  sections: Section[]
}
