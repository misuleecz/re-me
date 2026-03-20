export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBriefingByDate, formatDisplayDate, getIssueNumber } from '@/lib/content'
import { COLORS, SECTION_COLORS } from '@/lib/colors'
import Header from '@/components/Header'
import { isAuthed } from '@/lib/auth'
import { redis } from '@/lib/redis'
import ReadButton from '@/components/ReadButton'
import RatingButtons from '@/components/RatingButtons'

interface PageProps {
  params: Promise<{ date: string }>
}

export default async function DayPage({ params }: PageProps) {
  const { date } = await params
  const briefing = getBriefingByDate(date)

  if (!briefing) notFound()

  const color = COLORS[briefing.color]
  const displayDate = formatDisplayDate(date)
  const issueNumber = getIssueNumber(date)

  // Personal features — only for authed user
  const authed = await isAuthed()
  let isRead = false
  const ratings: Record<string, { rating: string; note: string | null }> = {}
  if (authed) {
    try {
      isRead = !!(await redis.get(`read:${date}`))
      const ratingKeys = await redis.keys(`rate:${date}:*`)
      for (const k of ratingKeys) {
        const sectionType = k.replace(`rate:${date}:`, '')
        const val = await redis.get(k)
        if (val) ratings[sectionType] = typeof val === 'string' ? JSON.parse(val) : val
      }
    } catch (e) {
      console.error('Redis error (detail):', e)
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

            {/* Read button */}
            {authed && (
              <div className="mb-8">
                <ReadButton date={date} initialRead={isRead} />
              </div>
            )}

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

        {/* ── Centered content ── */}
        <div className="mx-auto px-5 py-6 md:py-8 flex flex-col gap-6" style={{ maxWidth: '1075px' }}>

          {/* Section cards — 2 col grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {briefing.sections.map((s, i) => {
            const bubbleColor = COLORS[SECTION_COLORS[s.type]]
            const CardWrapper = ({ children }: { children: React.ReactNode }) => s.link
              ? <a href={s.link} target="_blank" rel="noopener noreferrer" className="block group">{children}</a>
              : <div className="block">{children}</div>
            return (
              <CardWrapper key={s.type}>
              <div
                className="border-2 border-ink p-7 md:p-10 h-full transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0px_#0D0D0D]"
                style={{ backgroundColor: bubbleColor.bg, color: bubbleColor.text }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{s.emoji}</span>
                    <span
                      className="font-display font-bold text-[10px] uppercase tracking-[0.25em] opacity-60"
                      style={{ color: bubbleColor.text }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.duration && (
                      <span className="font-body text-xs opacity-50" style={{ color: bubbleColor.text }}>
                        {s.duration}
                      </span>
                    )}
                    <span className="font-display font-black text-xs opacity-20" style={{ color: bubbleColor.text }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {s.source && (
                  <p className="font-body text-xs uppercase tracking-widest opacity-50 mb-2" style={{ color: bubbleColor.text }}>
                    — {s.source}
                  </p>
                )}

                <h2
                  className="font-display font-black text-2xl md:text-3xl leading-tight mb-4"
                  style={{ color: bubbleColor.text }}
                >
                  {s.title}
                </h2>

                <p
                  className="font-body text-base leading-relaxed opacity-80"
                  style={{ color: bubbleColor.text }}
                >
                  {s.description}
                </p>

                {/* Tags */}
                {s.tags && s.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-8">
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-body text-[10px] px-2 py-1 border"
                        style={{ borderColor: bubbleColor.text, color: bubbleColor.text, opacity: 0.5 }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {authed && (
                  <div onClick={e => e.preventDefault()} style={{ color: bubbleColor.text }}>
                    <RatingButtons
                      date={date}
                      sectionType={s.type}
                      initialRating={ratings[s.type]?.rating ?? null}
                      initialNote={ratings[s.type]?.note ?? null}
                    />
                  </div>
                )}

                {s.link && (
                  <p className="font-display font-bold text-[10px] uppercase tracking-widest mt-6 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: bubbleColor.text }}>
                    Open →
                  </p>
                )}
              </div>
              </CardWrapper>
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
