import { Resend } from 'resend';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>This is a test email from Resend</p>',
    });

    if (error) {
      console.error('Error sending email:', error);
      return;
    }

    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testResend(); 