export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBriefingByDate, formatDisplayDate, getIssueNumber } from '@/lib/content'
import { COLORS, SECTION_COLORS } from '@/lib/colors'
import Header from '@/components/Header'
import { isAuthed } from '@/lib/auth'
import { redis } from '@/lib/redis'
import SectionCardGrid from '@/components/SectionCardGrid'

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
  const sectionReads: Record<number, boolean> = {}
  const ratings: Record<number, { rating: string; note: string | null }> = {}

  if (authed) {
    try {
      // Keys are indexed by position (0, 1, 2...) to avoid duplicate section.type collisions
      for (let i = 0; i < briefing.sections.length; i++) {
        const readVal = await redis.get(`card_read:${date}:${i}`)
        if (readVal) sectionReads[i] = true
        const rateVal = await redis.get(`rate:${date}:${i}`)
        if (rateVal) ratings[i] = typeof rateVal === 'string' ? JSON.parse(rateVal) : rateVal
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

            {/* Issue row */}
            <div className="flex items-center justify-end mb-10">
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
            <p className="font-body text-base leading-relaxed text-ink/50 mb-6 max-w-2xl">
              {briefing.subheadline}
            </p>

            {/* Letter-style summary */}
            {briefing.summary && (
              <div className="mb-10 max-w-3xl columns-2 gap-8">
                {briefing.summary.split('\n\n').map((para, i) => (
                  <p key={i} className="font-body text-sm leading-relaxed text-ink/65 mb-4 break-inside-avoid">
                    {para.split(/(\*\*[^*]+\*\*)/).map((chunk, j) =>
                      chunk.startsWith('**') && chunk.endsWith('**')
                        ? <strong key={j} className="font-bold text-ink/90">{chunk.slice(2, -2)}</strong>
                        : chunk
                    )}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Section cards ── */}
        <div className="mx-auto px-5 py-6 md:py-8 flex flex-col gap-6" style={{ maxWidth: '1075px' }}>
          <SectionCardGrid
            date={date}
            authed={authed}
            sections={briefing.sections.map((s, i) => {
              const bubbleColor = COLORS[SECTION_COLORS[s.type]]
              return {
                section: s,
                originalIndex: i,
                bgColor: bubbleColor.bg,
                textColor: bubbleColor.text,
                initialRead: sectionReads[i] ?? false,
                initialRating: ratings[i]?.rating ?? null,
                initialNote: ratings[i]?.note ?? null,
              }
            })}
          />

        </div>
      </main>
    </>
  )
}
