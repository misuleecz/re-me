'use client'

import { useState } from 'react'
import type { Section } from '@/lib/types'

interface Props {
  date: string
  section: Section
  cardIndex: number
  bgColor: string
  textColor: string
  authed: boolean
  initialRead: boolean
  initialRating: string | null
  initialNote: string | null
}

export default function SectionCard({
  date, section: s, cardIndex,
  bgColor, textColor,
  authed, initialRead, initialRating, initialNote,
}: Props) {
  const [isRead, setIsRead] = useState(initialRead)
  const [rating, setRating] = useState<string | null>(initialRating)
  const [note, setNote] = useState(initialNote || '')
  const [showNote, setShowNote] = useState(false)
  const [saving, setSaving] = useState(false)

  async function toggleRead(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsRead(r => !r)
    await fetch('/api/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, sectionType: s.type }),
    })
  }

  async function saveRating(r: string | null, n?: string) {
    setSaving(true)
    try {
      await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, sectionType: s.type, rating: r, note: n ?? note }),
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleRating(e: React.MouseEvent, r: 'up' | 'down') {
    e.preventDefault()
    e.stopPropagation()
    if (rating === r) {
      setRating(null)
      setShowNote(false)
      await saveRating(null)
    } else {
      setRating(r)
      if (r === 'down') {
        setShowNote(true)
      } else {
        setShowNote(false)
        await saveRating(r)
      }
    }
  }

  const upActive = rating === 'up'
  const downActive = rating === 'down'

  const inner = (
    <div
      className="border-2 border-ink p-7 md:p-8 h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0px_#0D0D0D]"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        opacity: isRead ? 0.75 : 1,
        transition: 'opacity 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{s.emoji}</span>
          <span
            className="font-display font-bold text-[10px] uppercase tracking-[0.25em] opacity-60"
            style={{ color: textColor }}
          >
            {s.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {s.duration && (
            <span className="font-body text-xs opacity-50" style={{ color: textColor }}>
              {s.duration}
            </span>
          )}
          {authed ? (
            <button
              onClick={toggleRead}
              title={isRead ? 'Mark as unread' : 'Mark as read'}
              className="w-5 h-5 border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 cursor-pointer"
              style={{
                borderColor: textColor,
                backgroundColor: isRead ? textColor : 'transparent',
              }}
            >
              {isRead && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke={bgColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ) : (
            <span className="font-display font-black text-xs opacity-20" style={{ color: textColor }}>
              {String(cardIndex + 1).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      {s.source && (
        <p className="font-body text-xs uppercase tracking-widest opacity-50 mb-2" style={{ color: textColor }}>
          — {s.source}
        </p>
      )}

      <h2
        className="font-display font-black text-2xl md:text-3xl leading-tight mb-4"
        style={{ color: textColor }}
      >
        {s.title}
      </h2>

      <p className="font-body text-base leading-relaxed opacity-80" style={{ color: textColor }}>
        {s.description}
      </p>

      {s.tags && s.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {s.tags.map(tag => (
            <span
              key={tag}
              className="font-body text-[10px] px-2 py-1 border"
              style={{ borderColor: textColor, color: textColor, opacity: 0.5 }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {authed && (
        <div
          className="flex items-center gap-2 mt-5"
          onClick={e => e.preventDefault()}
        >
          <button
            onClick={e => handleRating(e, 'up')}
            disabled={saving}
            className="font-display font-bold text-[9px] uppercase tracking-widest border-2 px-3 py-1.5 transition-all duration-150 cursor-pointer disabled:cursor-not-allowed"
            style={{
              borderColor: textColor,
              backgroundColor: upActive ? textColor : 'transparent',
              color: upActive ? bgColor : textColor,
              opacity: downActive ? 0.25 : upActive ? 1 : 0.5,
            }}
          >
            👍 Useful
          </button>
          <button
            onClick={e => handleRating(e, 'down')}
            disabled={saving}
            className="font-display font-bold text-[9px] uppercase tracking-widest border-2 px-3 py-1.5 transition-all duration-150 cursor-pointer disabled:cursor-not-allowed"
            style={{
              borderColor: textColor,
              backgroundColor: downActive ? textColor : 'transparent',
              color: downActive ? bgColor : textColor,
              opacity: upActive ? 0.25 : downActive ? 1 : 0.5,
            }}
          >
            👎 Skip
          </button>
        </div>
      )}

      {showNote && (
        <form
          onSubmit={async e => {
            e.preventDefault()
            e.stopPropagation()
            await saveRating('down', note)
            setShowNote(false)
          }}
          onClick={e => e.stopPropagation()}
          className="mt-3 flex gap-2"
        >
          <input
            autoFocus
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Why wasn't it useful? (optional)"
            className="font-body text-xs bg-transparent border-b opacity-60 focus:opacity-100 outline-none flex-1 py-1"
            style={{ color: textColor, borderColor: textColor }}
          />
          <button
            type="submit"
            className="font-display font-bold text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ color: textColor }}
          >
            Save
          </button>
        </form>
      )}

      {s.link && (
        <p
          className="font-display font-bold text-[10px] uppercase tracking-widest mt-5 opacity-0 group-hover:opacity-60 transition-opacity"
          style={{ color: textColor }}
        >
          Open →
        </p>
      )}
    </div>
  )

  return s.link
    ? <a href={s.link} target="_blank" rel="noopener noreferrer" className="block group">{inner}</a>
    : <div className="block">{inner}</div>
}
