import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { isAuthedFromRequest } from '@/lib/auth'

// POST /api/rate — save rating for a section
// body: { date, sectionType, rating: 'up' | 'down' | null, note?: string }
export async function POST(request: NextRequest) {
  if (!isAuthedFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { date, sectionType, rating, note } = await request.json()
  if (!date || !sectionType) {
    return NextResponse.json({ error: 'Missing date or sectionType' }, { status: 400 })
  }

  const key = `rate:${date}:${sectionType}`

  if (rating === null) {
    await redis.del(key)
    return NextResponse.json({ rating: null })
  }

  const data = { rating, note: note || null }
  await redis.set(key, JSON.stringify(data))
  return NextResponse.json(data)
}

// GET /api/rate?date=YYYY-MM-DD — get all ratings for a day
export async function GET(request: NextRequest) {
  if (!isAuthedFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const date = request.nextUrl.searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'Missing date' }, { status: 400 })

  const keys = await redis.keys(`rate:${date}:*`)
  const ratings: Record<string, { rating: string; note: string | null }> = {}

  for (const k of keys) {
    const sectionType = k.replace(`rate:${date}:`, '')
    const val = await redis.get(k)
    if (val) {
      ratings[sectionType] = typeof val === 'string' ? JSON.parse(val) : val
    }
  }

  return NextResponse.json({ ratings })
}
