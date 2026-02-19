import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token");

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if already logged in
  if (request.nextUrl.pathname === '/login' && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
