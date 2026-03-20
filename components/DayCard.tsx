'use client'

import Link from 'next/link'
import { DayBriefing } from '@/lib/types'
import { COLORS, SECTION_COLORS, DATE_COLOR } from '@/lib/colors'

interface DayCardProps {
  dateStr: string
  briefing: DayBriefing
  isToday: boolean
}

function getWeekday(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()
}

export default function DayCard({ dateStr, briefing, isToday }: DayCardProps) {
  const accentColor = COLORS[briefing.color]
  const day = new Date(dateStr + 'T00:00:00').getDate()
  const weekday = getWeekday(dateStr)

  return (
    <div
      className="group border-2 border-ink flex flex-col bg-cream
        transition-transform duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#0D0D0D]"
      style={{
        outline: isToday ? `3px solid #0D0D0D` : undefined,
        outlineOffset: isToday ? '3px' : undefined,
      }}
    >
      {/* Colored top accent strip — clicks go to detail */}
      <Link href={`/${dateStr}`} className="block">
        <div className="h-2" style={{ backgroundColor: DATE_COLOR }} />

        {/* Card header */}
        <div className="px-5 pt-4 pb-4 border-b border-ink/10">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black text-4xl leading-none" style={{ color: DATE_COLOR }}>
                {day}
              </span>
              <span className="font-body text-xs text-ink/40 tracking-widest uppercase">{weekday}</span>
            </div>
            {isToday && (
              <span className="font-display font-bold text-[9px] uppercase tracking-widest px-2 py-1 border border-ink text-ink">
                Today
              </span>
            )}
          </div>
          <h3 className="font-display font-black text-base leading-tight mt-2 text-ink">
            {briefing.headline}
          </h3>
        </div>
      </Link>

      {/* Section bubbles — each links to its source */}
      <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        {briefing.sections.map((s) => {
          const bubbleColor = COLORS[SECTION_COLORS[s.type]]
          const inner = (
            <div
              className="rounded-2xl px-4 py-3 h-full hover:opacity-85 transition-opacity"
              style={{ backgroundColor: bubbleColor.bg }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs">{s.emoji}</span>
                <span
                  className="font-display font-bold text-[9px] uppercase tracking-[0.2em] opacity-60"
                  style={{ color: bubbleColor.text }}
                >
                  {s.label}
                </span>
                {s.duration && (
                  <span className="font-body text-[9px] opacity-40 ml-auto" style={{ color: bubbleColor.text }}>
                    {s.duration}
                  </span>
                )}
              </div>
              <p className="font-display font-bold text-xs leading-snug" style={{ color: bubbleColor.text }}>
                {s.title}
              </p>
              <p className="font-body text-[11px] mt-1 leading-relaxed opacity-60 line-clamp-2" style={{ color: bubbleColor.text }}>
                {s.description}
              </p>
            </div>
          )

          return s.link
            ? <a key={s.type} href={s.link} target="_blank" rel="noopener noreferrer">{inner}</a>
            : <div key={s.type}>{inner}</div>
        })}
      </div>

      {/* Footer — clicks go to detail */}
      <Link href={`/${dateStr}`} className="px-5 py-3 mt-auto border-t border-ink/10 flex items-center justify-end">
        <span className="font-display font-bold text-[10px] uppercase tracking-widest text-ink/30 group-hover:text-ink transition-colors">
          Open →
        </span>
      </Link>
    </div>
  )
}
