import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { isAuthedFromRequest } from '@/lib/auth'

// POST /api/read — toggle read status for a date+section
export async function POST(request: NextRequest) {
  if (!isAuthedFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { date, sectionType } = await request.json()
  if (!date || !sectionType) return NextResponse.json({ error: 'Missing date or sectionType' }, { status: 400 })

  const key = `card_read:${date}:${sectionType}`
  const existing = await redis.get(key)

  if (existing) {
    await redis.del(key)
    return NextResponse.json({ read: false })
  } else {
    await redis.set(key, '1')
    return NextResponse.json({ read: true })
  }
}

// GET /api/read?date=YYYY-MM-DD — get all read sections for a date
export async function GET(request: NextRequest) {
  if (!isAuthedFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const date = request.nextUrl.searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'Missing date' }, { status: 400 })

  const keys = await redis.keys(`card_read:${date}:*`)
  const sections = keys.map((k: string) => k.replace(`card_read:${date}:`, ''))
  return NextResponse.json({ sections })
}
