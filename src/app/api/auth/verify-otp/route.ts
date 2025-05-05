import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { User, Session } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: Error | null;
}

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Verify OTP
    const { data: otpData, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpData) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    let authData;
    if (existingUser) {
      // Sign in existing user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: code,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        return NextResponse.json(
          { error: 'Failed to sign in' },
          { status: 500 }
        );
      }

      authData = signInData;
    } else {
      // Create new user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: code,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      authData = signUpData;
    }

    if (!authData?.user?.id) {
      return NextResponse.json(
        { error: 'Failed to authenticate user' },
        { status: 500 }
      );
    }

    // Create or update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: email,
        trial_start_date: existingUser ? undefined : new Date().toISOString(),
        trial_end_date: existingUser ? undefined : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: existingUser ? undefined : 'trial'
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Delete used OTP
    await supabase
      .from('otp_codes')
      .delete()
      .eq('email', email);

    // Set session cookie
    const cookieStore = cookies();
    if (authData.session?.access_token) {
      cookieStore.set('supabase-auth-token', authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      // Also set the refresh token
      if (authData.session.refresh_token) {
        cookieStore.set('supabase-auth-refresh-token', authData.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      redirectTo: '/dashboard',
      session: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
      }
    });
  } catch (error: any) {
    console.error('Error in verify-otp route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 