import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes and public routes
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname === '/'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/signup', request.url));
  }

  try {
    // Verify the token with our backend
    const response = await fetch(`${API_URL}/api/verify-token`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Invalid token');
    }

    return NextResponse.next();
  } catch (error) {
    // Clear the invalid token
    const response = NextResponse.redirect(new URL('/signup', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 