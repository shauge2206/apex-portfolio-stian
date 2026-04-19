import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const auth = request.headers.get('authorization')

  if (auth) {
    const [type, credentials] = auth.split(' ')
    if (type === 'Basic') {
      const decoded = atob(credentials)
      const colon = decoded.indexOf(':')
      const username = decoded.slice(0, colon)
      const password = decoded.slice(colon + 1)

      const validPass = process.env.ADMIN_PASSWORD

      if (validPass && password === validPass) {
        return NextResponse.next()
      }
    }
  }

  return new NextResponse(null, {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Apex Admin"' },
  })
}

export const config = {
  matcher: '/admin/:path*',
}
