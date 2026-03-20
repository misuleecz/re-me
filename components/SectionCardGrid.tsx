'use client'

import { useState } from 'react'
import SectionCard from './SectionCard'
import type { Section } from '@/lib/types'
import { COLORS, SECTION_COLORS } from '@/lib/colors'

interface SectionData {
  section: Section
  originalIndex: number
  bgColor: string
  textColor: string
  initialRead: boolean
  initialRating: string | null
  initialNote: string | null
}

interface Props {
  date: string
  authed: boolean
  sections: SectionData[]
}

export default function SectionCardGrid({ date, authed, sections }: Props) {
  const [skipped, setSkipped] = useState<Set<number>>(
    new Set(sections.filter(s => s.initialRating === 'down').map(s => s.originalIndex))
  )
  const [notes, setNotes] = useState<Record<number, string>>(() =>
    Object.fromEntries(
      sections.filter(s => s.initialNote).map(s => [s.originalIndex, s.initialNote!])
    )
  )
  const [extraSections, setExtraSections] = useState<SectionData[]>([])
  const [loadingMore, setLoadingMore] = useState(false)

  async function loadMore() {
    setLoadingMore(true)
    try {
      const payload = sections.map(s => ({
        title: s.section.title,
        type: s.section.type,
        description: s.section.description,
        rating: (s.initialRating as 'up' | 'down' | null) ?? null,
        note: s.initialNote ?? null,
      }))
      const res = await fetch('/api/more-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: payload }),
      })
      const data = await res.json()
      const newSections: SectionData[] = (data.sections as Section[]).map((s, i) => {
        const bubbleColor = COLORS[SECTION_COLORS[s.type]] ?? COLORS['violet']
        return {
          section: s,
          originalIndex: sections.length + extraSections.length + i,
          bgColor: bubbleColor.bg,
          textColor: bubbleColor.text,
          initialRead: false,
          initialRating: null,
          initialNote: null,
        }
      })
      setExtraSections(prev => [...prev, ...newSections])
    } finally {
      setLoadingMore(false)
    }
  }

  function handleSkipped(index: number, isSkipped: boolean, note?: string) {
    setSkipped(prev => {
      const next = new Set(prev)
      if (isSkipped) next.add(index)
      else next.delete(index)
      return next
    })
    if (note) setNotes(prev => ({ ...prev, [index]: note }))
  }

  const regular = sections.filter(s => !skipped.has(s.originalIndex))
  const skippedList = sections.filter(s => skipped.has(s.originalIndex))

  // All cards in one grid so React never unmounts/remounts when moving between sections
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {regular.map(s => (
        <SectionCard
          key={s.originalIndex}
          date={date}
          section={s.section}
          cardIndex={s.originalIndex}
          bgColor={s.bgColor}
          textColor={s.textColor}
          authed={authed}
          initialRead={s.initialRead}
          initialRating={s.initialRating}
          initialNote={s.initialNote}
          isInSkipped={false}
          displayNote={notes[s.originalIndex]}
          onSkipped={(isSkipped, note) => handleSkipped(s.originalIndex, isSkipped, note)}
        />
      ))}

      {/* Extra AI-generated sections */}
      {extraSections.length > 0 && (
        <div className="col-span-1 md:col-span-2 flex items-center gap-4 mt-4">
          <div className="flex-1 h-px bg-ink/15" />
          <span className="font-display font-bold text-[10px] uppercase tracking-[0.3em] text-ink/30">
            Picked for you
          </span>
          <div className="flex-1 h-px bg-ink/15" />
        </div>
      )}

      {extraSections.map(s => (
        <SectionCard
          key={s.originalIndex}
          date={date}
          section={s.section}
          cardIndex={s.originalIndex}
          bgColor={s.bgColor}
          textColor={s.textColor}
          authed={authed}
          initialRead={false}
          initialRating={null}
          initialNote={null}
          isInSkipped={false}
          onSkipped={(isSkipped, note) => handleSkipped(s.originalIndex, isSkipped, note)}
        />
      ))}

      {/* Load more button */}
      {authed && (
        <div className="col-span-1 md:col-span-2 flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="font-display font-bold text-xs uppercase tracking-widest border-2 border-ink px-6 py-3 hover:opacity-60 transition-opacity disabled:opacity-30 text-ink cursor-pointer disabled:cursor-not-allowed"
          >
            {loadingMore ? 'Finding more for you…' : '+ Load 4 more'}
          </button>
        </div>
      )}

      {skippedList.length > 0 && (
        <div className="col-span-1 md:col-span-2 flex items-center gap-4 mt-4">
          <div className="flex-1 h-px bg-ink/15" />
          <span className="font-display font-bold text-[10px] uppercase tracking-[0.3em] text-ink/30">
            Not a good match
          </span>
          <div className="flex-1 h-px bg-ink/15" />
        </div>
      )}

      {skippedList.map(s => (
        <SectionCard
          key={s.originalIndex}
          date={date}
          section={s.section}
          cardIndex={s.originalIndex}
          bgColor={s.bgColor}
          textColor={s.textColor}
          authed={authed}
          initialRead={s.initialRead}
          initialRating={s.initialRating}
          initialNote={s.initialNote}
          isInSkipped={true}
          displayNote={notes[s.originalIndex]}
          onSkipped={(isSkipped, note) => handleSkipped(s.originalIndex, isSkipped, note)}
        />
      ))}
    </div>
  )
}
