import type { ApiResponse, VestingSchedule, AuthResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
console.log('API URL:', API_URL); // Debug log

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token');
    console.log('Token present:', !!token); // Debug log
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    console.log('Request headers:', headers); // Debug log

    const url = `${API_URL}${endpoint}`;
    console.log('Making request to:', url); // Debug log

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('Response status:', response.status); // Debug log

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const error = await response.json();
        console.error('API error response:', error); // Debug log
        errorMessage = error.message || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', e); // Debug log
      }
      return { error: errorMessage };
    }

    const data = await response.json();
    console.log('API success response:', data); // Debug log
    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    return { error: error instanceof Error ? error.message : 'Failed to make request' };
  }
}

export const api = {
  requestOtp: (email: string) => 
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email: string, otp: string) =>
    request<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  getVestingSchedules: () =>
    request<VestingSchedule[]>('/vesting/schedules', {
      method: 'GET',
    }),

  createVestingSchedule: (schedule: Omit<VestingSchedule, 'id' | 'created_at'>) =>
    request<VestingSchedule>('/vesting/create', {
      method: 'POST',
      body: JSON.stringify(schedule),
    }),
}; 