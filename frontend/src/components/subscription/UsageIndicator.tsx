/**
 * Usage Indicator Component
 * Shows current usage and limits for analyses
 */

import { useEffect } from 'react';
import { TrendingUp, Zap } from 'lucide-react';
import { useSubscriptionStore } from '../../stores/subscription.store';
import { useNavigate } from 'react-router-dom';

export const UsageIndicator = () => {
  const navigate = useNavigate();
  const { usage, fetchUsage } = useSubscriptionStore();

  useEffect(() => {
    fetchUsage();
  }, []);

  if (!usage) return null;

  const percentage = Math.min((usage.analysesUsed / usage.analysesLimit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = usage.analysesUsed >= usage.analysesLimit;

  const isPremium = usage.plan === 'memego-pro-monthly' || usage.plan === 'memego-pro-yearly';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Usage This Month</h3>
        </div>
        {!isPremium && (
          <button
            onClick={() => navigate('/pricing')}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            <Zap className="w-3 h-3" />
            Upgrade
          </button>
        )}
      </div>

      {/* Usage Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Analyses</span>
          <span className={`font-medium ${isNearLimit ? 'text-orange-600' : 'text-gray-900'}`}>
            {usage.analysesUsed} / {usage.analysesLimit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Warning or Info */}
      {isAtLimit && !isPremium && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <p className="font-medium">Limit reached!</p>
          <p className="mt-1">
            <button onClick={() => navigate('/pricing')} className="underline hover:no-underline">
              Upgrade to Pro
            </button>{' '}
            for 100+ analyses per day.
          </p>
        </div>
      )}

      {isNearLimit && !isAtLimit && !isPremium && (
        <p className="mt-2 text-xs text-orange-600">
          You're running low on analyses. Consider upgrading!
        </p>
      )}

      {isPremium && (
        <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Premium plan active
        </p>
      )}
    </div>
  );
};
