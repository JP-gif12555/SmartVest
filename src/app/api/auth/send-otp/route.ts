import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Log environment variables (without sensitive values)
console.log('Environment check:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');
console.log('- RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    console.log('Starting OTP process for email:', email);

    // Delete any existing OTPs for this email
    const { error: deleteError } = await supabase
      .from('otp_codes')
      .delete()
      .eq('email', email);

    if (deleteError) {
      console.error('Error deleting existing OTPs:', deleteError);
    }

    // Store OTP in Supabase
    const { data, error: upsertError } = await supabase
      .from('otp_codes')
      .insert({
        email,
        code: otp,
        expires_at: expiresAt.toISOString(),
      })
      .select();

    if (upsertError) {
      console.error('Failed to store OTP:', upsertError);
      return NextResponse.json(
        { error: 'Failed to store OTP. Please try again.' },
        { status: 500 }
      );
    }

    console.log('OTP stored successfully:', data);

    // Send OTP email using Resend
    console.log('Attempting to send email via Resend...');
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'SmartVest <onboarding@resend.dev>',
      to: email,
      subject: 'Your SmartVest Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to SmartVest</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Failed to send email. Error details:', emailError);
      // Delete the stored OTP since email failed
      await supabase
        .from('otp_codes')
        .delete()
        .eq('email', email);
      
      return NextResponse.json(
        { error: 'Failed to send verification code. Please try again.' },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', emailData);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in send-otp route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
} 