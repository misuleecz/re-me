import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { isAuthedFromRequest } from '@/lib/auth'

// GET /api/status?date=YYYY-MM-DD — read status + ratings for a specific day
export async function GET(request: NextRequest) {
  if (!isAuthedFromRequest(request)) {
    return NextResponse.json({ authed: false })
  }

  const date = request.nextUrl.searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'Missing date' }, { status: 400 })

  const readVal = await redis.get(`read:${date}`)
  const isRead = !!readVal

  const ratingKeys = await redis.keys(`rate:${date}:*`)
  const ratings: Record<string, { rating: string; note: string | null }> = {}
  for (const k of ratingKeys) {
    const sectionType = k.replace(`rate:${date}:`, '')
    const val = await redis.get(k)
    if (val) {
      ratings[sectionType] = typeof val === 'string' ? JSON.parse(val) : val
    }
  }

  return NextResponse.json({ authed: true, isRead, ratings })
}
