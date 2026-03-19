import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBriefingByDate, getAllDates, formatDisplayDate, getIssueNumber } from '@/lib/content'
import { COLORS } from '@/lib/colors'
import Header from '@/components/Header'
import SectionBlock from '@/components/SectionBlock'

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
      <Header
        bgColor={color.bg}
        textColor={color.text}
        issueNumber={issueNumber}
        dateLabel={displayDate}
      />

      <main>
        {/* ── Day hero ── */}
        <div
          className="px-5 md:px-10 py-12 md:py-20 border-b-2 border-ink relative overflow-hidden"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          {/* Back link */}
          <Link
            href="/"
            className="font-display font-bold text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2 mb-10"
            style={{ color: color.text }}
          >
            ← Back to archive
          </Link>

          {/* Decorative big number */}
          <span
            className="absolute right-4 bottom-0 font-display font-black leading-none select-none pointer-events-none hidden md:block"
            style={{
              fontSize: 'clamp(140px, 22vw, 320px)',
              opacity: 0.07,
              color: color.text,
              lineHeight: 0.85,
            }}
          >
            {new Date(date + 'T00:00:00').getDate()}
          </span>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-6">
            <span
              className="font-display font-bold text-xs uppercase tracking-[0.25em] border px-3 py-1"
              style={{ borderColor: color.text, color: color.text, opacity: 0.5 }}
            >
              Issue #{String(issueNumber).padStart(3, '0')}
            </span>
            <span
              className="font-body text-xs tracking-widest opacity-40"
              style={{ color: color.text }}
            >
              {displayDate}
            </span>
          </div>

          {/* Emoji */}
          <div className="text-5xl mb-5">{briefing.emoji}</div>

          {/* Headline */}
          <h1
            className="font-display font-black leading-[0.88] tracking-tight relative z-10"
            style={{
              fontSize: 'clamp(36px, 7vw, 100px)',
              color: color.text,
              maxWidth: '85%',
            }}
          >
            {briefing.headline}
          </h1>

          {/* Subheadline */}
          <p
            className="font-body text-base md:text-xl mt-5 max-w-2xl leading-relaxed opacity-70 relative z-10"
            style={{ color: color.text }}
          >
            {briefing.subheadline}
          </p>

          {/* Section preview pills */}
          <div className="flex flex-wrap gap-2 mt-8 relative z-10">
            {briefing.sections.map((s) => (
              <span
                key={s.type}
                className="font-display font-bold text-xs uppercase tracking-widest border px-3 py-1.5 flex items-center gap-1.5"
                style={{ borderColor: color.text, color: color.text, opacity: 0.55 }}
              >
                {s.emoji} {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Content sections ── */}
        <div className="flex flex-col">
          {briefing.sections.map((section, i) => (
            <SectionBlock key={section.type} section={section} index={i} />
          ))}
        </div>

        {/* ── Bottom nav ── */}
        <div
          className="px-5 md:px-10 py-8 border-t-2 border-ink flex items-center justify-between"
          style={{ backgroundColor: color.bg }}
        >
          <Link
            href="/"
            className="font-display font-bold text-sm uppercase tracking-widest border-2 px-5 py-2.5 hover:opacity-70 transition-opacity"
            style={{ borderColor: color.text, color: color.text }}
          >
            ← Back
          </Link>
          <span className="font-display font-black text-lg opacity-20" style={{ color: color.text }}>
            Re:Me
          </span>
        </div>
      </main>
    </>
  )
}
