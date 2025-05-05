'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { SignUpForm } from '@/components/auth/SignUpForm';
import Link from 'next/link';

const features = [
  {
    name: 'Token Management',
    description: 'Easily manage your tokens with our intuitive interface',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: 'Secure Storage',
    description: 'Your tokens are stored securely with enterprise-grade encryption',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    name: 'Real-time Updates',
    description: 'Get instant notifications about your token activities',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
];

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-white to-blue-50">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Token Management Made Simple
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Secure, efficient, and user-friendly token management platform for your business needs.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Button onClick={() => setShowSignUp(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                Get started
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '#features'} className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Learn more
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-b from-white to-blue-50">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Token Management{' '}
              <span className="text-blue-600">Made Simple</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Secure, efficient, and user-friendly token management platform for your business needs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex items-center gap-x-6"
          >
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Get started
              </Button>
            </Link>
            <Button variant="outline" onClick={() => window.location.href = '#features'} className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Learn more
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * index }}
                className="flex flex-col items-start"
              >
                <div className="rounded-lg bg-white p-2 ring-1 ring-blue-200">
                  <div className="text-blue-600">{feature.icon}</div>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {showSignUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md"
          >
            <SignUpForm />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 