import express from 'express';
import type { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { RegisterRequest, VerifyOtpRequest, LoginRequest, VestingScheduleRequest } from './types';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const router = express.Router();
const port = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
const healthCheck: RequestHandler = (_req, res) => {
  res.json({ status: 'ok' });
};
router.get('/health', healthCheck);

// Request OTP endpoint
const register: RequestHandler = async (req, res) => {
  try {
    console.log('Received registration request:', req.body);
    const { email } = req.body;

    if (!email) {
      console.log('Email is missing from request');
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP for email:', email);

    // Log Supabase configuration
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Store OTP in Supabase
    const { error: otpError } = await supabase
      .from('otps')
      .insert([
        {
          email,
          otp,
          expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      ]);

    if (otpError) {
      console.error('Error storing OTP:', otpError);
      console.error('Error details:', JSON.stringify(otpError, null, 2));
      return res.status(500).json({ error: 'Failed to store OTP' });
    }

    console.log('Stored OTP in database');

    // Send OTP via email
    console.log('Attempting to send email with Resend API key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');
    const { error: emailError } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Your verification code',
      html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    console.log('Email sent successfully');
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Unexpected error in registration:', error);
    res.status(400).json({ error: (error as Error).message });
  }
};
router.post('/auth/register', register);

// Verify OTP endpoint
const verifyOtp: RequestHandler = async (req, res) => {
  try {
    console.log('Received OTP verification request:', req.body);
    const { email, otp } = req.body;

    if (!email || !otp) {
      console.log('Missing email or OTP in request');
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Verify OTP from Supabase
    console.log('Checking OTP in database for email:', email);
    const { data: otpData, error: otpError } = await supabase
      .from('otps')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError) {
      console.error('Error verifying OTP:', otpError);
      console.error('Error details:', JSON.stringify(otpError, null, 2));
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    if (!otpData) {
      console.log('No matching OTP found for email:', email);
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    console.log('OTP verified successfully');

    // Create or get user
    console.log('Creating/getting user for email:', email);
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user:', userError);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    let userId: string;

    if (!user) {
      // Create new user with UUID
      console.log('Creating new user for email:', email);
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ 
          id: crypto.randomUUID(),
          email 
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      userId = newUser.id;
      console.log('New user created with ID:', userId);
    } else {
      userId = user.id;
      console.log('Existing user found with ID:', userId);
    }

    // Generate JWT token
    console.log('Generating JWT token for user:', userId);
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Delete used OTP
    console.log('Deleting used OTP');
    await supabase.from('otps').delete().eq('id', otpData.id);

    console.log('Sending success response with token');
    res.status(200).json({ token, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Unexpected error in OTP verification:', error);
    res.status(400).json({ error: (error as Error).message });
  }
};
router.post('/auth/verify-otp', verifyOtp);

// Login endpoint
router.post('/auth/login', async (req: LoginRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Token vesting routes
router.post('/vesting/create', async (req: VestingScheduleRequest, res: Response) => {
  try {
    const { userId, tokenAmount, vestingPeriod, startDate } = req.body;
    const { data, error } = await supabase
      .from('vesting_schedules')
      .insert([
        {
          user_id: userId,
          token_amount: tokenAmount,
          vesting_period: vestingPeriod,
          start_date: startDate,
        },
      ])
      .select();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/vesting/:userId', async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('vesting_schedules')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get vesting schedules endpoint
const getSchedules: RequestHandler = async (req, res) => {
  try {
    console.log('Received request for vesting schedules');
    console.log('Headers:', req.headers);
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header');
      return res.status(401).json({ error: 'Unauthorized - No valid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    console.log('Token received:', token.substring(0, 10) + '...');

    // Verify token and get user
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string, email: string };
      console.log('Token verified for user:', decoded.userId);
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    if (!decoded.userId) {
      console.log('No user ID in token');
      return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }

    // Get schedules from Supabase
    console.log('Fetching schedules for user:', decoded.userId);
    const { data: schedules, error } = await supabase
      .from('vesting_schedules')
      .select('*')
      .eq('user_id', decoded.userId);

    if (error) {
      console.error('Error fetching schedules:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({ error: 'Failed to fetch schedules: ' + error.message });
    }

    console.log('Successfully fetched schedules:', schedules);
    // Always return an array, even if empty
    const response = Array.isArray(schedules) ? schedules : [];
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Unexpected error in get schedules:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Internal server error: ' + (error as Error).message });
  }
};
router.get('/vesting/schedules', getSchedules);

// Mount the router
app.use('/api', router);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 