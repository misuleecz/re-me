import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies()
  const key = cookieStore.get('re_me_key')?.value
  return key === process.env.USER_KEY
}

export function isAuthedFromRequest(request: NextRequest): boolean {
  const key = request.cookies.get('re_me_key')?.value
  return key === process.env.USER_KEY
}
