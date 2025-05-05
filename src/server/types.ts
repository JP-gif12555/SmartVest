import { Request } from 'express';

export interface RegisterRequest extends Request {
  body: {
    email: string;
  };
}

export interface VerifyOtpRequest extends Request {
  body: {
    email: string;
    otp: string;
  };
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Otp {
  id: string;
  email: string;
  otp: string;
  expires_at: string;
  created_at: string;
  used: boolean;
}

export interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export interface VestingScheduleRequest extends Request {
  body: {
    userId: string;
    tokenAmount: number;
    vestingPeriod: number;
    startDate: string;
  };
} 