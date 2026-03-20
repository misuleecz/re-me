export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBriefingByDate, formatDisplayDate, getIssueNumber } from '@/lib/content'
import { COLORS, SECTION_COLORS } from '@/lib/colors'
import Header from '@/components/Header'
import { isAuthed } from '@/lib/auth'
import { redis } from '@/lib/redis'
import SectionCard from '@/components/SectionCard'

interface PageProps {
  params: Promise<{ date: string }>
}

export default async function DayPage({ params }: PageProps) {
  const { date } = await params
  const briefing = getBriefingByDate(date)

  if (!briefing) notFound()

  const displayDate = formatDisplayDate(date)
  const issueNumber = getIssueNumber(date)

  // Personal features — only for authed user
  const authed = await isAuthed()
  const sectionReads: Record<string, boolean> = {}
  const ratings: Record<string, { rating: string; note: string | null }> = {}

  if (authed) {
    try {
      const readKeys = await redis.keys(`card_read:${date}:*`)
      for (const k of readKeys) {
        sectionReads[k.replace(`card_read:${date}:`, '')] = true
      }
      const ratingKeys = await redis.keys(`rate:${date}:*`)
      for (const k of ratingKeys) {
        const val = await redis.get(k)
        if (val) ratings[k.replace(`rate:${date}:`, '')] = typeof val === 'string' ? JSON.parse(val) : val
      }
    } catch (e) {
      console.error('Redis error:', e)
    }
  }

  return (
    <>
      <Header bgColor="#0D1117" textColor="#FFFFFF" />

      <main className="bg-cream">

        {/* ── Hero ── */}
        <div className="bg-cream">
          <div className="mx-auto px-5 py-6 md:py-8" style={{ maxWidth: '1075px' }}>

            {/* Back + Issue row */}
            <div className="flex items-center justify-between mb-10">
              <Link
                href="/"
                className="font-display font-bold text-xs uppercase tracking-widest text-ink/40 hover:text-ink transition-colors"
              >
                ← Back
              </Link>
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-xs uppercase tracking-[0.25em] text-ink/30">
                  {displayDate}
                </span>
                <span className="font-display font-bold text-xs uppercase tracking-[0.25em] border border-ink/20 px-3 py-1 text-ink/40">
                  Issue #{String(issueNumber).padStart(3, '0')}
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1
              className="font-display font-black tracking-tight text-ink mb-6"
              style={{ fontSize: 'clamp(36px, 7vw, 100px)', lineHeight: 1.05 }}
            >
              {briefing.headline}
            </h1>

            {/* Subheadline */}
            <p className="font-body text-base md:text-lg leading-relaxed text-ink/60 mb-10 max-w-2xl">
              {briefing.subheadline}
            </p>

            {/* Takeaways — 4 cols, linked to source, max 16 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
              {briefing.sections.slice(0, 16).map((s) => {
                const bubbleColor = COLORS[SECTION_COLORS[s.type]]
                const inner = (
                  <div className="group/item flex flex-col gap-2">
                    <span
                      className="text-[10px] font-display font-bold uppercase tracking-widest px-2.5 py-1 rounded-full self-start"
                      style={{ backgroundColor: bubbleColor.bg, color: bubbleColor.text }}
                    >
                      {s.emoji} {s.label}
                    </span>
                    <p className="font-body text-sm leading-relaxed text-ink/55 group-hover/item:text-ink transition-colors">
                      {s.description.split('.')[0]}.
                    </p>
                  </div>
                )
                return s.link
                  ? <a key={s.type} href={s.link} target="_blank" rel="noopener noreferrer">{inner}</a>
                  : <div key={s.type}>{inner}</div>
              })}
            </div>
          </div>
        </div>

        {/* ── Section cards ── */}
        <div className="mx-auto px-5 py-6 md:py-8 flex flex-col gap-6" style={{ maxWidth: '1075px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {briefing.sections.map((s, i) => {
              const bubbleColor = COLORS[SECTION_COLORS[s.type]]
              return (
                <SectionCard
                  key={s.type}
                  date={date}
                  section={s}
                  cardIndex={i}
                  bgColor={bubbleColor.bg}
                  textColor={bubbleColor.text}
                  authed={authed}
                  initialRead={sectionReads[s.type] ?? false}
                  initialRating={ratings[s.type]?.rating ?? null}
                  initialNote={ratings[s.type]?.note ?? null}
                />
              )
            })}
          </div>

          {/* Back */}
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/"
              className="font-display font-bold text-sm uppercase tracking-widest border-2 border-ink px-5 py-2.5 hover:opacity-60 transition-opacity text-ink"
            >
              ← Back to archive
            </Link>
            <span className="font-display font-black text-lg opacity-15 text-ink">Re:Me</span>
          </div>
        </div>
      </main>
    </>
  )
}
