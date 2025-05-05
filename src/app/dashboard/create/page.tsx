'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { motion, HTMLMotionProps } from 'framer-motion';

export default function CreateVestingSchedulePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tokenAddress: '',
    beneficiary: '',
    startTime: Math.floor(Date.now() / 1000), // Current time in seconds
    duration: 0,
    totalAmount: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.createVestingSchedule(formData);
      if (response.error) {
        throw new Error(response.error);
      }
      router.push('/dashboard');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const motionProps: HTMLMotionProps<"div"> = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
    className: "mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Create Vesting Schedule</h2>
          <p className="mt-2 text-sm text-gray-600">
            Set up a new token vesting schedule
          </p>
        </div>

        <motion.div {...motionProps}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="tokenAddress" className="block text-sm font-medium text-gray-700">
                Token Address
              </label>
              <div className="mt-1">
                <input
                  id="tokenAddress"
                  name="tokenAddress"
                  type="text"
                  required
                  value={formData.tokenAddress}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0x..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="beneficiary" className="block text-sm font-medium text-gray-700">
                Beneficiary Address
              </label>
              <div className="mt-1">
                <input
                  id="beneficiary"
                  name="beneficiary"
                  type="text"
                  required
                  value={formData.beneficiary}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0x..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Start Time (Unix timestamp)
              </label>
              <div className="mt-1">
                <input
                  id="startTime"
                  name="startTime"
                  type="number"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration (in seconds)
              </label>
              <div className="mt-1">
                <input
                  id="duration"
                  name="duration"
                  type="number"
                  required
                  min="0"
                  value={formData.duration}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700">
                Total Amount (in wei)
              </label>
              <div className="mt-1">
                <input
                  id="totalAmount"
                  name="totalAmount"
                  type="text"
                  required
                  value={formData.totalAmount}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="1000000000000000000"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Creating...' : 'Create Schedule'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 