import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBriefingByDate, getAllDates, formatDisplayDate, getIssueNumber } from '@/lib/content'
import { COLORS, SECTION_COLORS } from '@/lib/colors'
import Header from '@/components/Header'

export async function generateStaticParams() {
  const dates = getAllDates()
  return dates.map((date) => ({ date }))
}

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

        {/* ── Centered content ── */}
        <div className="mx-auto px-5 py-6 md:py-8 flex flex-col gap-6" style={{ maxWidth: '1075px' }}>

          {/* Section cards — 2 col grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {briefing.sections.map((s, i) => {
            const bubbleColor = COLORS[SECTION_COLORS[s.type]]
            return (
              <div
                key={s.type}
                className="border-2 border-ink p-7 md:p-10"
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

                {/* Tags + link */}
                <div className="flex items-center justify-between mt-8 flex-wrap gap-4">
                  {s.tags && s.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
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
                  {s.link && (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display font-bold text-sm uppercase tracking-widest border-2 px-5 py-2.5 hover:opacity-70 transition-opacity ml-auto"
                      style={{ borderColor: bubbleColor.text, color: bubbleColor.text }}
                    >
                      Open →
                    </a>
                  )}
                </div>
              </div>
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
