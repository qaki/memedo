/**
 * Pricing Page
 * Displays subscription plans and handles checkout
 */

import { useState } from 'react';
import { Check, Zap, Star, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { useSubscriptionStore } from '../stores/subscription.store';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';

export default function Pricing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { createCheckoutSession } = useSubscriptionStore();
  const { showToast } = useToast();
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!isAuthenticated) {
      showToast('Please log in to subscribe', 'error');
      navigate('/login');
      return;
    }

    setLoading(plan);
    try {
      const checkoutUrl = await createCheckoutSession(plan);

      // Open FastSpring checkout in popup
      window.open(
        checkoutUrl,
        'fastspring-checkout',
        'width=600,height=800,scrollbars=yes,resizable=yes'
      );

      showToast('Opening checkout...', 'info');
    } catch (error) {
      console.error('Checkout error:', error);
      showToast('Failed to start checkout. Please try again.', 'error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Protect yourself from rug pulls and scams. Get comprehensive token analysis and
            real-time alerts.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $0
                <span className="text-lg font-normal text-gray-500">/month</span>
              </div>
              <p className="text-gray-600">Perfect for trying out MemeDo</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">5 token analyses per day</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Basic security scans</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">5 watchlist tokens</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">Community support</span>
              </li>
            </ul>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </Button>
          </div>

          {/* Monthly Plan */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-indigo-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Popular
            </div>

            <div className="text-center mb-6">
              <Zap className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro Monthly</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $29
                <span className="text-lg font-normal text-gray-500">/month</span>
              </div>
              <p className="text-gray-600">For serious traders</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>100</strong> token analyses per day
                </span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Advanced security analysis</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>50</strong> watchlist tokens
                </span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Export reports (PDF/CSV)</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Real-time alerts</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Priority support</span>
              </li>
            </ul>

            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={() => handleSubscribe('monthly')}
              isLoading={loading === 'monthly'}
              disabled={loading !== null}
            >
              Subscribe Monthly
            </Button>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Best Value
            </div>

            <div className="text-center mb-6">
              <Star className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro Yearly</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $290
                <span className="text-lg font-normal text-gray-500">/year</span>
              </div>
              <p className="text-green-600 font-medium">Save $58 (2 months free!)</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>100</strong> token analyses per day
                </span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Advanced security analysis</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>50</strong> watchlist tokens
                </span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Export reports (PDF/CSV)</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Real-time alerts</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Priority support</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>2 months free</strong>
                </span>
              </li>
            </ul>

            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => handleSubscribe('yearly')}
              isLoading={loading === 'yearly'}
              disabled={loading !== null}
            >
              Subscribe Yearly
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes! You can cancel your subscription at any time. You'll continue to have access
                until the end of your billing period.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and international payment methods through
                our secure payment processor FastSpring.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                Yes! Our free plan gives you 5 analyses per day to try out MemeDo. No credit card
                required.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-gray-600">
                Absolutely! You can change your plan at any time from your dashboard. Changes will
                be prorated automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
