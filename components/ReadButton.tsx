'use client'

import { useState } from 'react'

interface ReadButtonProps {
  date: string
  initialRead: boolean
}

export default function ReadButton({ date, initialRead }: ReadButtonProps) {
  const [isRead, setIsRead] = useState(initialRead)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch('/api/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      })
      if (res.ok) {
        const data = await res.json()
        setIsRead(data.read)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="font-display font-bold text-[10px] uppercase tracking-widest border-2 border-ink px-4 py-2 transition-all disabled:opacity-40"
      style={
        isRead
          ? { backgroundColor: '#0D0D0D', color: '#F5F0E8' }
          : { backgroundColor: 'transparent', color: '#0D0D0D' }
      }
    >
      {isRead ? '✓ Read' : 'Mark as read'}
    </button>
  )
}
