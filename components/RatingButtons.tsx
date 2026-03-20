'use client'

import { useState } from 'react'

interface RatingButtonsProps {
  date: string
  sectionType: string
  initialRating: string | null
  initialNote: string | null
  textColor?: string
}

export default function RatingButtons({ date, sectionType, initialRating, initialNote, textColor }: RatingButtonsProps) {
  const [rating, setRating] = useState<string | null>(initialRating)
  const [note, setNote] = useState(initialNote || '')
  const [showNote, setShowNote] = useState(false)
  const [saving, setSaving] = useState(false)

  async function saveRating(r: string | null, n?: string) {
    setSaving(true)
    try {
      await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, sectionType, rating: r, note: n ?? note }),
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleUp(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const newRating = rating === 'up' ? null : 'up'
    setRating(newRating)
    setShowNote(false)
    await saveRating(newRating)
  }

  async function handleDown(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (rating === 'down') {
      setRating(null)
      setShowNote(false)
      await saveRating(null)
    } else {
      setRating('down')
      setShowNote(true)
    }
  }

  async function submitNote(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    await saveRating('down', note)
    setShowNote(false)
  }

  return (
    <div className="mt-4" onClick={e => e.preventDefault()} style={{ color: textColor }}>
      <div className="flex items-center gap-2">
        <button
          onClick={handleUp}
          disabled={saving}
          className="font-body text-base transition-opacity disabled:opacity-40"
          style={{ opacity: rating === 'up' ? 1 : 0.3 }}
          title="Useful"
        >
          👍
        </button>
        <button
          onClick={handleDown}
          disabled={saving}
          className="font-body text-base transition-opacity disabled:opacity-40"
          style={{ opacity: rating === 'down' ? 1 : 0.3 }}
          title="Not useful"
        >
          👎
        </button>
        {rating === 'down' && !showNote && note && (
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); setShowNote(true) }}
            className="font-body text-[10px] opacity-40 hover:opacity-70 transition-opacity"
          >
            edit note
          </button>
        )}
      </div>

      {showNote && (
        <form onSubmit={submitNote} className="mt-2 flex gap-2">
          <input
            autoFocus
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Why wasn't it useful? (optional)"
            className="font-body text-xs bg-transparent border-b border-current opacity-60 focus:opacity-100 outline-none flex-1 py-1"
          />
          <button
            type="submit"
            className="font-display font-bold text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          >
            Save
          </button>
        </form>
      )}
    </div>
  )
}
