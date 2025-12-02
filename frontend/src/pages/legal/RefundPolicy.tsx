import { Card } from '../../components/ui/Card';

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Refund Policy</h1>
        <p className="text-gray-600">Last Updated: December 2, 2025</p>
      </div>

      <Card padding="lg" className="prose prose-sm max-w-none">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">14-Day Money-Back Guarantee</h2>
          <p className="text-gray-900 font-semibold mb-3">
            We offer a 14-day refund period for all subscription purchases.
          </p>
          <p className="text-gray-700">
            If you are not satisfied with MemeDo for any reason, you may request a full refund
            within 14 days of your purchase date.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Refund Eligibility</h2>
          <p className="text-gray-700 mb-4">
            You are eligible for a full refund if you request it within <strong>14 days</strong> of
            your initial subscription purchase date.
          </p>
          <p className="text-gray-700 mb-4">The 14-day refund period applies to:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>New monthly subscription purchases</li>
            <li>New annual subscription purchases</li>
            <li>First-time subscription upgrades</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How to Request a Refund</h2>
          <p className="text-gray-700 mb-4">
            To request a refund within the 14-day period, please contact us at:
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Email:</strong> support@meme-go.com
            <br />
            <strong>Subject Line:</strong> "Refund Request"
            <br />
            <strong>Include:</strong> Your account email and order/transaction number
          </p>
          <p className="text-gray-700">
            We will process your refund request within <strong>3-5 business days</strong> of
            receiving your request.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Refund Processing</h2>
          <p className="text-gray-700 mb-4">
            Once your refund is approved, it will be processed automatically:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Processing Time:</strong> Refunds are processed within 3-5 business days
            </li>
            <li>
              <strong>Refund Method:</strong> Refunds are issued to your original payment method
            </li>
            <li>
              <strong>Bank Processing:</strong> Your bank may take an additional 5-10 business days
              to reflect the refund in your account
            </li>
            <li>
              <strong>Confirmation:</strong> You will receive an email confirmation when your refund
              is processed
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription Renewals</h2>
          <p className="text-gray-700 mb-4">
            <strong>Important:</strong> The 14-day refund period applies only to{' '}
            <strong>new purchases</strong>.
          </p>
          <p className="text-gray-700 mb-4">
            Subscription renewals are not eligible for refunds. To avoid being charged for a
            renewal:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              Cancel your subscription <strong>before</strong> your renewal date
            </li>
            <li>You can cancel anytime from your account settings</li>
            <li>You will retain access until the end of your current billing period</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Access After Refund</h2>
          <p className="text-gray-700">
            Once a refund is issued, your premium subscription access will be immediately
            terminated. You will be automatically downgraded to the free plan and can continue using
            basic features.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Free Trial Period</h2>
          <p className="text-gray-700">
            We offer a free plan that allows you to test our basic features before purchasing a
            premium subscription. We encourage you to try the free plan first to ensure MemeDo meets
            your needs.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Information</h2>
          <p className="text-gray-700 mb-4">For refund requests or questions about this policy:</p>
          <p className="text-gray-700">
            <strong>Business Name:</strong> memego10
            <br />
            <strong>Email:</strong> support@meme-go.com
            <br />
            <strong>Website:</strong> https://www.meme-go.com
            <br />
            <strong>Response Time:</strong> Within 24-48 hours during business days
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Payment Processor</h2>
          <p className="text-gray-700">
            All payments are processed securely through Paddle. Refunds are issued through the same
            system. If you have questions about payment processing, you can also contact Paddle
            support directly through your transaction confirmation email.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
          <p className="text-gray-700">
            We reserve the right to modify this Refund Policy at any time. Changes will be effective
            immediately upon posting to our website. The updated "Last Updated" date will reflect
            any changes. Your purchase is subject to the refund policy in effect at the time of your
            purchase.
          </p>
        </section>

        <div className="bg-gray-100 border-2 border-gray-300 p-6 rounded-lg mt-8">
          <p className="text-gray-900 font-semibold mb-3">Summary:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <strong>14 days</strong> to request a refund from your purchase date
            </li>
            <li>Full refund issued to your original payment method</li>
            <li>Refunds processed within 3-5 business days</li>
            <li>Renewals are not eligible for refunds</li>
            <li>Contact support@meme-go.com to request a refund</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
