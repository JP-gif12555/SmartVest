'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

const MotionDiv = motion.div;

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'otp'>('email');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await api.requestOtp(email);

    if (error) {
      setError(error);
    } else {
      setStep('otp');
    }

    setIsLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error } = await api.verifyOtp(email, otp);

    if (error) {
      setError(error);
    } else if (data?.token) {
      // Store the JWT token
      localStorage.setItem('token', data.token);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }

    setIsLoading(false);
  };

  return (
    <AnimatePresence mode="wait">
      <MotionDiv
        key={step}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-lg bg-white p-8 shadow-lg ring-1 ring-gray-200"
      >
        <form onSubmit={step === 'email' ? handleEmailSubmit : handleOtpSubmit} className="space-y-6">
          {step === 'email' ? (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Enter the 6-digit code sent to your email
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-center tracking-widest"
                  placeholder="000000"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-blue-600 hover:text-blue-500"
                >
                  Try again
                </button>
              </p>
            </div>
          )}

          {error && (
            <MotionDiv
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-md bg-red-50 p-4"
            >
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </MotionDiv>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading
              ? step === 'email'
                ? 'Sending code...'
                : 'Verifying...'
              : step === 'email'
              ? 'Send code'
              : 'Verify code'}
          </Button>
        </form>
      </MotionDiv>
    </AnimatePresence>
  );
} 