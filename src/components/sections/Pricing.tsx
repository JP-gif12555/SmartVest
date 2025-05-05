'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    href: '#',
    price: { monthly: '$0' },
    description: 'Perfect for trying out our platform.',
    features: [
      'Up to 5 token vesting schedules',
      'Basic team management',
      'Email support',
      'Documentation access',
      'Community forum access',
      'Basic analytics',
    ],
    featured: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '#',
    price: { monthly: '$49' },
    description: 'Everything you need for serious token management.',
    features: [
      'Unlimited token vesting schedules',
      'Advanced team management',
      'Priority email support',
      'API access',
      'Custom integrations',
      'Advanced analytics dashboard',
      'Unlimited airdrops',
      'Multi-signature support',
      'Custom vesting rules',
      'Team collaboration tools',
    ],
    featured: true,
  },
  {
    name: 'Lifetime',
    id: 'tier-lifetime',
    href: '#',
    price: { monthly: '$499' },
    description: 'One-time payment for lifetime access to all features.',
    features: [
      'Everything in Pro',
      'Lifetime updates',
      'Dedicated support',
      'Custom development',
      'White-label options',
      'Enterprise features',
      'Advanced security features',
      'Custom API endpoints',
      'Priority feature requests',
      'Dedicated account manager',
    ],
    featured: false,
  },
];

export function Pricing() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="text-base font-semibold leading-7 text-blue-600"
            >
              Pricing
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
            >
              Choose the right plan for&nbsp;you
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg leading-8 text-gray-600"
            >
              Start with our free plan and upgrade as you grow. All plans include a 14-day free trial.
            </motion.p>
          </div>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-3">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 3) }}
                className={`relative flex flex-col rounded-2xl ${
                  tier.featured
                    ? 'bg-blue-600 text-white shadow-xl ring-1 ring-blue-600'
                    : 'bg-white text-gray-900 ring-1 ring-gray-200'
                }`}
              >
                <div className="p-8">
                  <h3 className="text-lg font-semibold leading-8">{tier.name}</h3>
                  <p className="mt-4 text-sm leading-6">{tier.description}</p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight">{tier.price.monthly}</span>
                    {tier.name !== 'Lifetime' && (
                      <span className="text-sm font-semibold leading-6">/month</span>
                    )}
                  </p>
                  <Link href="/signup">
                    <Button
                      className={`mt-6 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        tier.featured
                          ? 'bg-white text-blue-600 hover:bg-gray-50 focus-visible:outline-white'
                          : 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600'
                      }`}
                    >
                      Get started today
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-1 flex-col justify-between p-8 pt-0">
                  <ul role="list" className="space-y-3 text-sm leading-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <svg
                          className={`h-6 w-5 flex-none ${
                            tier.featured ? 'text-white' : 'text-blue-600'
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
} 