import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      await supabase.auth.exchangeCodeForSession(code);
      
      // After successful authentication, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      console.error('Auth error:', error);
      // If there's an error, redirect to home page
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If no code is present, redirect to home page
  return NextResponse.redirect(new URL('/', request.url));
} 