import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { isAuthedFromRequest } from '@/lib/auth'

// POST /api/rate — save rating for a section by index
export async function POST(request: NextRequest) {
  if (!isAuthedFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { date, sectionIndex, rating, note } = await request.json()
  if (!date || sectionIndex === undefined) {
    return NextResponse.json({ error: 'Missing date or sectionIndex' }, { status: 400 })
  }

  const key = `rate:${date}:${sectionIndex}`

  if (rating === null) {
    await redis.del(key)
    return NextResponse.json({ rating: null })
  }

  const data = { rating, note: note || null }
  await redis.set(key, JSON.stringify(data))
  return NextResponse.json(data)
}
