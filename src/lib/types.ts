export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface VestingSchedule {
  id: string;
  token_address: string;
  beneficiary: string;
  total_amount: string;
  released_amount: string;
  start_time: string;
  duration: number;
  revoked: boolean;
  created_at: string;
}

export interface RegisterRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VestingScheduleRequest {
  userId: string;
  tokenAmount: number;
  vestingPeriod: number;
  startDate: string;
}

export interface AuthResponse {
  token: string;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
    };
  }
} 