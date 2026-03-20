import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { isAuthedFromRequest } from '@/lib/auth'

// POST /api/read — toggle read status for a section by index
export async function POST(request: NextRequest) {
  if (!isAuthedFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { date, sectionIndex } = await request.json()
  if (!date || sectionIndex === undefined) return NextResponse.json({ error: 'Missing date or sectionIndex' }, { status: 400 })

  const key = `card_read:${date}:${sectionIndex}`
  const existing = await redis.get(key)

  if (existing) {
    await redis.del(key)
    return NextResponse.json({ read: false })
  } else {
    await redis.set(key, '1')
    return NextResponse.json({ read: true })
  }
}
