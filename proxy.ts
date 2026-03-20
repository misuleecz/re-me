import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl
  const keyParam = searchParams.get('key')

  if (keyParam) {
    const url = request.nextUrl.clone()
    url.searchParams.delete('key')
    const response = NextResponse.redirect(url)
    response.cookies.set('re_me_key', keyParam, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
