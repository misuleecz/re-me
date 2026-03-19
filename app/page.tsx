import { getAllBriefings } from '@/lib/content'
import { COLORS, SECTION_COLORS } from '@/lib/colors'
import { DayBriefing } from '@/lib/types'
import Header from '@/components/Header'
import DayCard from '@/components/DayCard'
import Link from 'next/link'

function getTodayStr() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getMonthLabel(dateStr: string) {
  const [y, m] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  }).toUpperCase()
}

function groupByMonth(briefings: DayBriefing[]): { label: string; entries: DayBriefing[] }[] {
  const map: Record<string, DayBriefing[]> = {}
  for (const b of briefings) {
    const key = b.date.slice(0, 7)
    if (!map[key]) map[key] = []
    map[key].push(b)
  }
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, entries]) => ({
      label: getMonthLabel(entries[0].date),
      entries: entries.sort((a, b) => b.date.localeCompare(a.date)),
    }))
}

const GREETINGS = [
  { text: "Good morning, sunshine", emoji: "☀️" },
  { text: "Hey you, the future called", emoji: "📞" },
  { text: "Rise and shine, future-builder", emoji: "🚀" },
  { text: "Morning! The AI world didn't sleep", emoji: "⚡" },
  { text: "Hello, beautiful brain", emoji: "🌸" },
  { text: "Good morning! Today's a good day to learn", emoji: "🔮" },
  { text: "Hey! New day, new knowledge", emoji: "🧠" },
  { text: "Morning vibes, let's go", emoji: "🌊" },
  { text: "Good morning, world-changer", emoji: "🌍" },
  { text: "Hello! Something good is waiting for you", emoji: "✨" },
  { text: "Hey! You're going to love today's digest", emoji: "💌" },
  { text: "Good morning, let's get smarter", emoji: "🎯" },
  { text: "Hey superstar, fresh ideas incoming", emoji: "🌟" },
  { text: "Morning! Grab a coffee and let's go", emoji: "☕" },
]

function getGreeting(dateStr: string) {
  const day = parseInt(dateStr.replace(/-/g, ''), 10)
  return GREETINGS[day % GREETINGS.length]
}

export default function HomePage() {
  const briefings = getAllBriefings()
  const todayStr = getTodayStr()
  const todayBriefing = briefings.find((b) => b.date === todayStr)
  const featured = todayBriefing || briefings[0]
  const months = groupByMonth(briefings)
  const greeting = featured ? getGreeting(featured.date) : GREETINGS[0]

  return (
    <>
      <Header bgColor="#0D1117" textColor="#FFFFFF" />

      <main className="min-h-screen">

        {/* ── HERO ── */}
        {featured && (() => {
          const color = COLORS[featured.color]
          return (
            <div
              className="px-5 md:px-10 pt-10 pb-14 md:pb-20 relative"
              style={{ backgroundColor: '#0D1117', color: '#FFFFFF' }}
            >
              {/* Decorative big number */}
              <span
                className="absolute right-4 bottom-0 font-display font-black select-none pointer-events-none hidden md:block"
                style={{ fontSize: 'clamp(120px, 20vw, 280px)', opacity: 0.07, color: '#FFFFFF', lineHeight: 0.85 }}
              >
                {new Date(featured.date + 'T00:00:00').getDate()}
              </span>

              {/* Centered inner container */}
              <div className="mx-auto" style={{ maxWidth: '1075px' }}>

              {/* Greeting stripe */}
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-10 bg-white/10">
                <p className="font-body font-bold opacity-90" style={{ color: '#FFFFFF', fontSize: '1.2rem' }}>
                  {greeting.text} {greeting.emoji}
                </p>
              </div>

              {/* Headline — centered */}
              <Link href={`/${featured.date}`} className="group block mb-5">
                <h1
                  className="font-display font-black leading-[0.95] tracking-tight hover:opacity-80 transition-opacity inline-block"
                  style={{
                    fontSize: 'clamp(38px, 7vw, 110px)',
                    paddingTop: '0.1em',
                    paddingBottom: '0.15em',
                    background: 'linear-gradient(135deg, #FFE680 0%, #FF99BE 35%, #B099FF 65%, #80F5FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {featured.headline}
                </h1>
              </Link>

              {/* Subheadline — left */}
              <p
                className="font-body text-base md:text-xl leading-relaxed mb-12 opacity-70"
                style={{ color: '#FFFFFF' }}
              >
                {featured.subheadline}
              </p>

              {/* 4-column takeaways */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-6 relative z-10 mb-10">
                {featured.sections.slice(0, 5).map((s) => {
                  const bubbleColor = COLORS[SECTION_COLORS[s.type]]
                  const item = (
                    <div className="group/item flex flex-col gap-2 cursor-pointer">
                      <span
                        className="text-[10px] font-display font-bold uppercase tracking-widest px-2.5 py-1 rounded-full self-start"
                        style={{ backgroundColor: bubbleColor.bg, color: bubbleColor.text }}
                      >
                        {s.emoji} {s.label}
                      </span>
                      <p
                        className="font-body text-sm leading-relaxed opacity-70 group-hover/item:opacity-100 transition-opacity"
                        style={{ color: '#FFFFFF' }}
                      >
                        {s.description.split('.')[0]}.
                      </p>
                    </div>
                  )
                  return s.link
                    ? <a key={s.type} href={s.link} target="_blank" rel="noopener noreferrer">{item}</a>
                    : <div key={s.type}>{item}</div>
                })}
              </div>

              {/* CTA */}
              <Link
                href={`/${featured.date}`}
                className="inline-flex items-center gap-2 font-display font-bold text-sm uppercase tracking-widest border-2 border-white/40 px-6 py-3 text-white hover:border-white hover:bg-white/10 transition-all"
              >
                See what today brings →
              </Link>

              </div>
            </div>
          )
        })()}

        {/* Gradient divider */}
        <div className="h-1.5" style={{ background: 'linear-gradient(to right, #FFE600, #FF2D78, #C8FF00, #6B2FFF, #FF6B2B, #00E5F5)' }} />

        {/* ── ARCHIVE by month ── */}
        {months.map(({ label, entries }) => (
          <section key={label} className="px-5 md:px-10 py-10 border-b border-ink/10">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-display font-black text-xs uppercase tracking-[0.3em] text-ink">
                {label}
              </h2>
              <div className="flex-1 h-px bg-ink/15" />
              <span className="font-body text-xs text-ink/30">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {entries.map((b) => (
                <DayCard
                  key={b.date}
                  dateStr={b.date}
                  briefing={b}
                  isToday={b.date === todayStr}
                />
              ))}
            </div>
          </section>
        ))}

        {!featured && (
          <div className="px-5 md:px-10 py-20 text-center">
            <p className="font-display font-black text-4xl opacity-10">First entry coming soon ✦</p>
          </div>
        )}

        <footer className="px-5 md:px-10 py-8 flex items-center justify-between">
          <span className="font-display font-black text-lg opacity-20">Re:Me</span>
          <span className="font-body text-xs text-ink/30 tracking-wide">
            A personal AI + design digest ✦ Updated daily
          </span>
        </footer>
      </main>
    </>
  )
}
