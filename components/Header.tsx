import Link from 'next/link'

interface HeaderProps {
  bgColor?: string
  textColor?: string
  issueNumber?: number
  dateLabel?: string
}

export default function Header({
  bgColor = '#F5F3EC',
  textColor = '#0D0D0D',
  issueNumber,
  dateLabel,
}: HeaderProps) {
  const borderColor = textColor === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : 'rgba(13,13,13,0.15)'

  return (
    <header
      style={{ backgroundColor: bgColor, color: textColor, borderBottomColor: borderColor }}
      className="border-b-2 sticky top-0 z-50"
    >
      <div className="px-5 md:px-10 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-baseline gap-1">
          <span
            className="font-display font-black text-4xl md:text-5xl leading-none tracking-tight"
            style={{ color: textColor }}
          >
            Re:
          </span>
          <span
            className="font-display font-black text-4xl md:text-5xl leading-none tracking-tight"
            style={{
              color: textColor,
              WebkitTextStroke: textColor === '#0D0D0D' ? '1px #0D0D0D' : '1px rgba(255,255,255,0.8)',
            }}
          >
            Me
          </span>
        </Link>

        {/* Center — tagline */}
        <p
          className="hidden md:block font-body text-xs tracking-[0.2em] uppercase opacity-50 absolute left-1/2 -translate-x-1/2"
          style={{ color: textColor }}
        >
          your daily AI + design digest
        </p>

        {/* Right — issue + date */}
        <div className="flex items-center gap-4">
          {issueNumber && (
            <span
              className="font-display font-bold text-xs tracking-widest uppercase opacity-60"
              style={{ color: textColor }}
            >
              #{String(issueNumber).padStart(3, '0')}
            </span>
          )}
          {dateLabel && (
            <span
              className="font-body text-xs tracking-wide opacity-50 hidden sm:block"
              style={{ color: textColor }}
            >
              {dateLabel}
            </span>
          )}
          <Link
            href="/"
            className="font-display font-bold text-xs uppercase tracking-widest border px-3 py-1.5 hover:opacity-70 transition-opacity"
            style={{ color: textColor, borderColor: textColor }}
          >
            Archive
          </Link>
        </div>
      </div>
    </header>
  )
}
