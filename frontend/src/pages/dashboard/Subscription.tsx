/**
 * Subscription Management Page
 * Allows users to view and manage their subscription
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, AlertTriangle, Check, Zap } from 'lucide-react';
import { useSubscriptionStore } from '../../stores/subscription.store';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { useToast } from '../../hooks/useToast';

export default function Subscription() {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    subscription,
    usage,
    isLoading,
    fetchSubscriptionStatus,
    fetchUsage,
    cancelSubscription,
    reactivateSubscription,
  } = useSubscriptionStore();

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
    fetchUsage();
  }, []);

  const handleCancel = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.'
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await cancelSubscription();
      toast.success('Subscription canceled successfully');
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    try {
      await reactivateSubscription();
      toast.success('Subscription reactivated successfully');
    } catch (error) {
      toast.error('Failed to reactivate subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  if (isLoading && !subscription) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="xl" />
      </div>
    );
  }

  const isPremium = subscription?.status === 'active' || subscription?.status === 'trial';
  const isCanceled = subscription?.cancelAtPeriodEnd;
  const statusColor =
    subscription?.status === 'active'
      ? 'success'
      : subscription?.status === 'trial'
        ? 'info'
        : subscription?.status === 'canceled'
          ? 'warning'
          : subscription?.status === 'overdue'
            ? 'danger'
            : 'gray';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        <p className="text-gray-600 mt-2">Manage your subscription and billing</p>
      </div>

      {/* Current Plan */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
          </div>
          <Badge variant={statusColor}>{subscription?.status || 'free'}</Badge>
        </div>

        <div className="space-y-4">
          {/* Plan Info */}
          <div className="flex items-center justify-between py-3 border-b">
            <span className="text-gray-600">Plan</span>
            <span className="font-medium text-gray-900">
              {subscription?.plan === 'memego-pro-monthly' && 'Pro Monthly'}
              {subscription?.plan === 'memego-pro-yearly' && 'Pro Yearly'}
              {subscription?.plan === 'free' && 'Free'}
            </span>
          </div>

          {/* Billing Period */}
          {isPremium && subscription?.periodEnd && (
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">{isCanceled ? 'Access until' : 'Renews on'}</span>
              <span className="font-medium text-gray-900">
                {new Date(subscription.periodEnd).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Cancellation Warning */}
          {isCanceled && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">Subscription Canceled</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Your subscription will end on{' '}
                  {subscription.periodEnd && new Date(subscription.periodEnd).toLocaleDateString()}.
                  You can reactivate it anytime before this date.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {!isPremium && (
              <Button onClick={handleUpgrade} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            )}

            {isPremium && !isCanceled && (
              <>
                <Button variant="secondary" onClick={() => navigate('/pricing')} className="flex-1">
                  Change Plan
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancel}
                  isLoading={actionLoading}
                  className="flex-1"
                >
                  Cancel Subscription
                </Button>
              </>
            )}

            {isCanceled && (
              <Button
                onClick={handleReactivate}
                isLoading={actionLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Reactivate Subscription
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Usage Stats */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900">Usage This Month</h2>
        </div>

        <div className="space-y-4">
          {/* Analyses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Token Analyses</span>
              <span className="text-sm text-gray-600">
                {usage?.analysesUsed || 0} / {usage?.analysesLimit || 5}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    ((usage?.analysesUsed || 0) / (usage?.analysesLimit || 5)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Reset Date */}
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-gray-600">Resets on</span>
            <span className="font-medium text-gray-900">
              {usage?.resetDate && new Date(usage.resetDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Plan Benefits */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {isPremium ? 'Your Benefits' : 'Upgrade for More'}
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Check className={`w-5 h-5 mt-0.5 ${isPremium ? 'text-green-500' : 'text-gray-400'}`} />
            <div>
              <p className="font-medium text-gray-900">
                {subscription?.benefits?.maxAnalysesPerDay || 5} analyses per day
              </p>
              <p className="text-sm text-gray-600">
                {isPremium ? 'Unlimited token analysis' : 'Limited analysis capacity'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Check className={`w-5 h-5 mt-0.5 ${isPremium ? 'text-green-500' : 'text-gray-400'}`} />
            <div>
              <p className="font-medium text-gray-900">
                {subscription?.benefits?.maxWatchlistTokens || 5} watchlist tokens
              </p>
              <p className="text-sm text-gray-600">
                {isPremium ? 'Track more tokens' : 'Limited watchlist'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Check
              className={`w-5 h-5 mt-0.5 ${subscription?.benefits?.exportReports ? 'text-green-500' : 'text-gray-400'}`}
            />
            <div>
              <p className="font-medium text-gray-900">Export Reports</p>
              <p className="text-sm text-gray-600">
                {subscription?.benefits?.exportReports ? 'PDF and CSV exports' : 'Premium feature'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Check
              className={`w-5 h-5 mt-0.5 ${subscription?.benefits?.prioritySupport ? 'text-green-500' : 'text-gray-400'}`}
            />
            <div>
              <p className="font-medium text-gray-900">Priority Support</p>
              <p className="text-sm text-gray-600">
                {subscription?.benefits?.prioritySupport
                  ? '24/7 priority assistance'
                  : 'Community support only'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
