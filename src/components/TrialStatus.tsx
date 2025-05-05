'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

interface TrialStatusProps {
  className?: string;
}

export default function TrialStatus({ className = '' }: TrialStatusProps) {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('trial');
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchTrialStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('trial_end_date, subscription_status')
          .eq('id', user.id)
          .single();

        if (profile) {
          const endDate = new Date(profile.trial_end_date);
          const now = new Date();
          const diffTime = endDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          setDaysRemaining(diffDays > 0 ? diffDays : 0);
          setSubscriptionStatus(profile.subscription_status);
        }
      }
    };

    fetchTrialStatus();
  }, [supabase]);

  if (subscriptionStatus === 'pro' || subscriptionStatus === 'lifetime') {
    return null;
  }

  const isExpired = subscriptionStatus === 'expired' || daysRemaining === 0;

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h3 className="text-xl font-semibold text-gray-900">
            {isExpired
              ? 'Your trial has ended'
              : `You have ${daysRemaining} days remaining in your free trial`}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isExpired
              ? 'Upgrade to continue using premium features'
              : 'Upgrade to Pro or Lifetime to unlock all features'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isExpired ? 'Upgrade Now' : 'View Plans'}
          </Link>
          {!isExpired && (
            <Link
              href="/features"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Features
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 