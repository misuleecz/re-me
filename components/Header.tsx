import Link from 'next/link'
import { getTodayInfo } from '@/lib/namedays'

interface HeaderProps {
  bgColor?: string
  textColor?: string
}

export default function Header({
  bgColor = '#F5F3EC',
  textColor = '#0D0D0D',
}: HeaderProps) {
  const borderColor = textColor === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : 'rgba(13,13,13,0.15)'
  const { dayName, dateStr, nameday } = getTodayInfo()

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

        {/* Right — day, date, nameday */}
        <div className="hidden md:flex flex-col items-end gap-0.5">
          <p
            className="font-display font-bold text-xs uppercase tracking-[0.2em]"
            style={{ color: textColor, opacity: 0.7 }}
          >
            {dayName} · {dateStr}
          </p>
          {nameday && (
            <p
              className="font-body text-[10px] tracking-wide"
              style={{ color: textColor, opacity: 0.4 }}
            >
              {nameday}
            </p>
          )}
        </div>
      </div>
    </header>
  )
}
