import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { isAuthedFromRequest } from '@/lib/auth'

// POST /api/clear-day — delete all read/rating data for a date
export async function POST(request: NextRequest) {
  if (!isAuthedFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { date } = await request.json()
  if (!date) return NextResponse.json({ error: 'Missing date' }, { status: 400 })

  const deleted: string[] = []
  let cursor = 0

  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: `*:${date}:*`, count: 100 })
    cursor = Number(nextCursor)
    if (keys.length > 0) {
      await redis.del(...keys)
      deleted.push(...keys)
    }
  } while (cursor !== 0)

  return NextResponse.json({ deleted })
}
