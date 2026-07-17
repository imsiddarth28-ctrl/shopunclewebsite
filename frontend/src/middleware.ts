import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow public pages and critical system folders
        if (
          pathname === '/' ||
          pathname === '/admin-login' ||
          pathname.startsWith('/auth') ||
          pathname.startsWith('/api') ||
          pathname.includes('.') ||
          pathname.startsWith('/_next')
        ) {
          return true
        }

        // Require authentication for all other pages
        return !!token
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
)

export const config = {
  matcher: ['/((?!api|static|.*\\..*|_next).*)'],
}
