import Link from 'next/link'
import { DayBriefing } from '@/lib/types'
import { COLORS, getDayColor } from '@/lib/colors'

interface DayCardProps {
  day: number
  dateStr: string
  briefing?: DayBriefing
  isToday: boolean
  isFuture: boolean
}

export default function DayCard({ day, dateStr, briefing, isToday, isFuture }: DayCardProps) {
  // Empty future day
  if (isFuture || !briefing) {
    return (
      <div
        className="border border-ink/10 p-3 md:p-4 flex flex-col min-h-[120px] md:min-h-[160px]"
        style={{ opacity: isFuture ? 0.2 : 0.4 }}
      >
        <span className="font-display font-bold text-xl md:text-2xl text-ink/30">{day}</span>
        {!isFuture && (
          <span className="font-body text-xs text-ink/30 mt-auto">no entry</span>
        )}
      </div>
    )
  }

  const colorKey = briefing.color || getDayColor(day)
  const color = COLORS[colorKey]

  return (
    <Link href={`/${dateStr}`} className="group block">
      <div
        className="border-2 border-ink p-3 md:p-4 flex flex-col min-h-[120px] md:min-h-[160px] justify-between
          transition-transform duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#0D0D0D] cursor-pointer"
        style={{
          backgroundColor: color.bg,
          color: color.text,
          boxShadow: isToday ? `0 0 0 3px #0D0D0D, 0 0 0 5px ${color.bg}` : undefined,
        }}
      >
        {/* Day number + today badge */}
        <div className="flex items-start justify-between">
          <span className="font-display font-black text-2xl md:text-3xl leading-none">{day}</span>
          {isToday && (
            <span
              className="font-display font-bold text-[9px] uppercase tracking-widest px-1.5 py-0.5 border"
              style={{ borderColor: color.text, color: color.text }}
            >
              Today
            </span>
          )}
        </div>

        {/* Headline */}
        <div>
          <p className="font-display font-bold text-xs md:text-sm leading-tight line-clamp-3 mt-2">
            {briefing.headline}
          </p>
          {/* Emoji tags */}
          <div className="flex gap-0.5 mt-2 text-sm">
            {briefing.sections.map((s) => (
              <span key={s.type}>{s.emoji}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
