import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { isAuthedFromRequest } from '@/lib/auth'

// POST /api/read — toggle read status for a date
export async function POST(request: NextRequest) {
  if (!isAuthedFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { date } = await request.json()
  if (!date) return NextResponse.json({ error: 'Missing date' }, { status: 400 })

  const key = `read:${date}`
  const existing = await redis.get(key)

  if (existing) {
    await redis.del(key)
    return NextResponse.json({ read: false })
  } else {
    await redis.set(key, '1')
    return NextResponse.json({ read: true })
  }
}

// GET /api/read — get all read dates
export async function GET(request: NextRequest) {
  if (!isAuthedFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const keys = await redis.keys('read:*')
  const dates = keys.map((k: string) => k.replace('read:', ''))
  return NextResponse.json({ dates })
}
