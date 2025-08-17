import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Only match admin routes - the rest of the website is open to everyone
     * This will only run middleware for /admin paths
     */
    '/admin/:path*',
  ],
}