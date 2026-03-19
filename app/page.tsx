import Link from 'next/link'
import { getAllBriefings } from '@/lib/content'
import { COLORS, getDayColor } from '@/lib/colors'
import { DayBriefing } from '@/lib/types'
import Header from '@/components/Header'
import DayCard from '@/components/DayCard'

function getTodayStr() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getMonthDays(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => i + 1)
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function HomePage() {
  const briefings = getAllBriefings()
  const byDate: Record<string, DayBriefing> = {}
  for (const b of briefings) byDate[b.date] = b

  const todayStr = getTodayStr()
  const todayBriefing = byDate[todayStr]
  const latestBriefing = briefings[0]
  const featured = todayBriefing || latestBriefing

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const days = getMonthDays(year, month)

  const monthName = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase()

  return (
    <>
      <Header />

      <main className="min-h-screen">

        {/* ── HERO — Today's featured entry ── */}
        {featured && (() => {
          const color = COLORS[featured.color]
          const isToday = featured.date === todayStr
          return (
            <Link href={`/${featured.date}`} className="block group">
              <div
                className="px-5 md:px-10 py-12 md:py-20 border-b-2 border-ink
                  hover:brightness-95 transition-all duration-200 cursor-pointer relative overflow-hidden"
                style={{ backgroundColor: color.bg, color: color.text }}
              >
                {/* Decorative big number */}
                <span
                  className="absolute right-6 bottom-0 font-display font-black leading-none select-none pointer-events-none hidden md:block"
                  style={{
                    fontSize: 'clamp(120px, 20vw, 280px)',
                    opacity: 0.07,
                    color: color.text,
                    lineHeight: 0.85,
                  }}
                >
                  {new Date(featured.date + 'T00:00:00').getDate()}
                </span>

                {/* Top meta */}
                <div className="flex items-center gap-4 mb-8">
                  <span
                    className="font-display font-bold text-xs uppercase tracking-[0.25em] border px-3 py-1"
                    style={{ borderColor: color.text, color: color.text, opacity: 0.6 }}
                  >
                    {isToday ? '✦ Today' : 'Latest'}
                  </span>
                  <span
                    className="font-body text-xs tracking-widest opacity-40"
                    style={{ color: color.text }}
                  >
                    {new Date(featured.date + 'T00:00:00').toLocaleDateString('en-GB', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    }).toUpperCase()}
                  </span>
                </div>

                {/* Emoji */}
                <div className="text-4xl mb-4">{featured.emoji}</div>

                {/* Headline */}
                <h1
                  className="font-display font-black leading-[0.9] tracking-tight relative z-10"
                  style={{
                    fontSize: 'clamp(42px, 8vw, 120px)',
                    color: color.text,
                    maxWidth: '80%',
                  }}
                >
                  {featured.headline}
                </h1>

                {/* Subheadline */}
                <p
                  className="font-body text-base md:text-xl mt-5 opacity-70 max-w-2xl leading-relaxed relative z-10"
                  style={{ color: color.text }}
                >
                  {featured.subheadline}
                </p>

                {/* Bottom bar */}
                <div className="flex items-center justify-between mt-10 relative z-10">
                  <div className="flex items-center gap-3">
                    {featured.sections.map((s) => (
                      <span
                        key={s.type}
                        className="text-xl opacity-80"
                        title={s.label}
                      >
                        {s.emoji}
                      </span>
                    ))}
                    <span
                      className="font-body text-xs opacity-40 ml-2"
                      style={{ color: color.text }}
                    >
                      {featured.sections.length} sections
                    </span>
                  </div>
                  <span
                    className="font-display font-bold text-sm uppercase tracking-widest border-2 px-5 py-2.5
                      group-hover:opacity-70 transition-opacity"
                    style={{ borderColor: color.text, color: color.text }}
                  >
                    Read →
                  </span>
                </div>
              </div>
            </Link>
          )
        })()}

        {/* ── No content yet ── */}
        {!featured && (
          <div className="px-5 md:px-10 py-20 border-b-2 border-ink text-center">
            <p className="font-display font-black text-4xl md:text-6xl opacity-10">
              First entry coming soon ✦
            </p>
          </div>
        )}

        {/* ── Calendar / Archive ── */}
        <div className="px-5 md:px-10 py-10">

          {/* Section header */}
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-display font-black text-xs uppercase tracking-[0.3em] text-ink">
              {monthName}
            </h2>
            <div className="flex-1 h-px bg-ink/15" />
            <span className="font-body text-xs text-ink/40">
              {briefings.length} {briefings.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2 md:gap-3">
            {days.map((day) => {
              const dateStr = toDateStr(year, month, day)
              const isToday = dateStr === todayStr
              const isFuture = dateStr > todayStr
              return (
                <DayCard
                  key={day}
                  day={day}
                  dateStr={dateStr}
                  briefing={byDate[dateStr]}
                  isToday={isToday}
                  isFuture={isFuture}
                />
              )
            })}
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="px-5 md:px-10 py-8 border-t-2 border-ink/10 flex items-center justify-between">
          <span className="font-display font-black text-lg opacity-20">Re:Me</span>
          <span className="font-body text-xs text-ink/30 tracking-wide">
            A personal AI + design digest ✦ Updated daily
          </span>
        </footer>
      </main>
    </>
  )
}
