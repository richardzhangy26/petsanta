'use client';

import React, { useEffect, useState } from 'react';

interface StripePayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  creditsAdded: number;
  createdAt: string;
}

interface CreditUsage {
  id: string;
  creditsUsed: number;
  remainingCredits: number;
  description: string;
  createdAt: string;
  creditsAdded?: number;
}

interface BillingData {
  credits: number;
  payments: StripePayment[];
  usageHistory: CreditUsage[];
}

const BillingPage: React.FC = () => {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/billing');
      const data = await response.json();

      if (response.ok) {
        setBillingData(data);
      } else {
        setError(data.error || 'Failed to fetch billing data');
      }
    } catch (err) {
      setError('An error occurred while fetching billing data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-bounce text-4xl">🐾</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchBillingData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 festive-font">Billing</h1>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Credit Balance</h2>
            <p className="text-6xl font-bold text-red-600 dark:text-red-400">
              {billingData?.credits || 0}
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Holiday Credits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Payment History</h2>
            {billingData?.payments && billingData.payments.length > 0 ? (
              <div className="space-y-4">
                {billingData.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        +{payment.creditsAdded} credits
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400 text-center py-8">No payment history</p>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Credit Usage</h2>
            {billingData?.usageHistory && billingData.usageHistory.length > 0 ? (
              <div className="space-y-4">
                {billingData.usageHistory.map((usage) => (
                  <div
                    key={usage.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{usage.description}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {usage.creditsUsed > 0 ? `-${usage.creditsUsed} credits` : `+${usage.creditsAdded || 0} credits`}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {new Date(usage.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {usage.remainingCredits} remaining
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400 text-center py-8">No credit usage history</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
