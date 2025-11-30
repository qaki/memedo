import { Card } from '../../components/ui/Card';

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Refund Policy</h1>
        <p className="text-gray-600">Last Updated: November 30, 2025</p>
      </div>

      <Card padding="lg" className="prose prose-sm max-w-none">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
          <h2 className="text-2xl font-bold text-red-900 mb-3">⚠️ NO REFUND POLICY</h2>
          <p className="text-gray-900 font-semibold mb-3">
            All sales are final. We do not offer refunds for any subscription purchases.
          </p>
          <p className="text-gray-700">
            By purchasing a subscription to MemeDo, you acknowledge and agree that all payments are
            non-refundable. Please read this policy carefully before making a purchase.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. General Refund Policy</h2>
          <p className="text-gray-700 mb-4">
            MemeDo operates a strict <strong>NO REFUND</strong> policy for all subscription plans,
            including but not limited to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Monthly Premium subscriptions</li>
            <li>Annual Premium subscriptions</li>
            <li>Any promotional or discounted subscription plans</li>
            <li>Subscription renewals</li>
            <li>Upgrade or downgrade fees (if applicable)</li>
          </ul>
          <p className="text-gray-700">
            This policy applies regardless of the reason for the refund request, including but not
            limited to dissatisfaction with the service, changes in financial circumstances, or
            technical issues.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Why We Don't Offer Refunds</h2>
          <p className="text-gray-700 mb-4">
            Our no-refund policy exists for the following reasons:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Immediate Access:</strong> Upon payment, you receive immediate access to all
              premium features, including unlimited token analyses, API access, and advanced
              analytics
            </li>
            <li>
              <strong>Digital Service:</strong> Our service is digital and immediately consumable.
              Once accessed, the service has been delivered
            </li>
            <li>
              <strong>Resource Allocation:</strong> We allocate significant computational resources
              and API credits to premium users immediately upon subscription
            </li>
            <li>
              <strong>Fair Trial Period:</strong> We offer a free plan that allows you to test our
              basic features before committing to a paid subscription
            </li>
            <li>
              <strong>Service Costs:</strong> We incur real costs for blockchain data access, API
              usage, and infrastructure that cannot be reversed
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Before You Subscribe</h2>
          <p className="text-gray-700 mb-4">
            <strong>Important:</strong> Please consider the following before purchasing a
            subscription:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Try Before You Buy:</strong> Use our free plan to evaluate the service quality
              and features
            </li>
            <li>
              <strong>Review Features:</strong> Carefully review the features included in each
              subscription tier on our Pricing page
            </li>
            <li>
              <strong>Check System Requirements:</strong> Ensure your device and browser are
              compatible with our Service
            </li>
            <li>
              <strong>Understand Limitations:</strong> Review our Terms of Service to understand
              what our analysis can and cannot do
            </li>
            <li>
              <strong>Plan Selection:</strong> Choose between monthly and annual plans based on your
              needs. Annual plans offer better value but commit you for a longer period
            </li>
            <li>
              <strong>Auto-Renewal:</strong> All subscriptions auto-renew unless cancelled before
              the renewal date
            </li>
          </ul>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="text-gray-700">
              <strong>💡 Recommendation:</strong> Start with a monthly subscription if you're unsure
              about committing to an annual plan. This gives you the flexibility to cancel after one
              month if the service doesn't meet your needs.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription Cancellation</h2>
          <p className="text-gray-700 mb-4">
            While we do not offer refunds, you can cancel your subscription at any time:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>How to Cancel:</strong> Go to your account settings and click "Cancel
              Subscription" under the Subscription tab
            </li>
            <li>
              <strong>Effect of Cancellation:</strong> Your subscription will remain active until
              the end of the current billing period
            </li>
            <li>
              <strong>Access After Cancellation:</strong> You will retain access to premium features
              until the end of your paid period
            </li>
            <li>
              <strong>No Partial Refunds:</strong> Cancelling mid-period does not entitle you to a
              refund for the unused portion
            </li>
            <li>
              <strong>Reactivation:</strong> You can reactivate a cancelled subscription at any time
              before it expires
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Billing Errors</h2>
          <p className="text-gray-700 mb-4">
            In the rare event of a billing error or duplicate charge:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Contact Us Immediately:</strong> Email support@meme-go.com with your
              transaction details
            </li>
            <li>
              <strong>Investigation Period:</strong> We will investigate the issue within 5 business
              days
            </li>
            <li>
              <strong>Error Confirmation:</strong> If we confirm a billing error, we will issue a
              refund for the incorrect charge
            </li>
            <li>
              <strong>Dispute Process:</strong> For payment disputes, you may also contact our
              payment processor (FastSpring) directly
            </li>
          </ul>
          <p className="text-gray-700">
            Please note: Billing error refunds apply only to clear technical errors or duplicate
            charges, not to general refund requests.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Service Interruptions</h2>
          <p className="text-gray-700 mb-4">In the event of significant service interruptions:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Temporary Outages:</strong> Brief service interruptions do not qualify for
              refunds. We aim for 99.9% uptime but cannot guarantee uninterrupted service
            </li>
            <li>
              <strong>Extended Outages:</strong> If the service is unavailable for more than 48
              consecutive hours due to our technical issues, we may, at our sole discretion, offer
              subscription time credits
            </li>
            <li>
              <strong>Third-Party Issues:</strong> Outages caused by third-party providers
              (blockchain nodes, API providers) do not qualify for refunds or credits
            </li>
            <li>
              <strong>Maintenance:</strong> Scheduled maintenance periods do not qualify for refunds
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Account Termination</h2>
          <p className="text-gray-700 mb-4">
            If your account is terminated for violation of our Terms of Service:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>No Refund:</strong> Account termination for Terms violation does not entitle
              you to a refund
            </li>
            <li>
              <strong>Immediate Effect:</strong> Your access will be terminated immediately upon
              violation
            </li>
            <li>
              <strong>Appeal Process:</strong> You may appeal the termination by contacting
              support@meme-go.com within 7 days
            </li>
            <li>
              <strong>Remaining Balance:</strong> Any remaining subscription time will be forfeited
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Chargebacks</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="text-gray-900 font-semibold mb-2">⚠️ Chargeback Warning</p>
            <p className="text-gray-700">
              Filing a chargeback instead of contacting us directly may result in immediate account
              termination and may affect your ability to use our Service in the future.
            </p>
          </div>
          <p className="text-gray-700 mb-4">
            If you file a chargeback with your credit card company:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Account Suspension:</strong> Your account will be immediately suspended
              pending chargeback resolution
            </li>
            <li>
              <strong>Service Termination:</strong> Successful chargebacks will result in permanent
              account termination
            </li>
            <li>
              <strong>Future Access:</strong> You may be prohibited from creating new accounts or
              purchasing subscriptions
            </li>
            <li>
              <strong>Contact First:</strong> We strongly encourage you to contact us directly
              before initiating a chargeback
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Exceptional Circumstances</h2>
          <p className="text-gray-700 mb-4">
            While our general policy is NO REFUNDS, we may consider exceptions in extremely rare
            circumstances:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Confirmed billing errors or technical glitches</li>
            <li>Duplicate charges verified by our payment processor</li>
            <li>Service completely unavailable for extended periods due to our fault</li>
            <li>Other exceptional situations at our sole discretion</li>
          </ul>
          <p className="text-gray-700">
            <strong>Important:</strong> Any exceptions are granted at our absolute discretion and do
            not set a precedent or create any obligation for future refunds.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Alternative Options</h2>
          <p className="text-gray-700 mb-4">
            If you're not satisfied with our Service, consider these alternatives to requesting a
            refund:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Contact Support:</strong> Many issues can be resolved through our support team
            </li>
            <li>
              <strong>Feature Requests:</strong> Let us know what features or improvements would
              make the service valuable to you
            </li>
            <li>
              <strong>Downgrade:</strong> Switch from annual to monthly (contact support)
            </li>
            <li>
              <strong>Cancel Future Renewals:</strong> Prevent future charges while using your
              remaining subscription time
            </li>
            <li>
              <strong>Share Feedback:</strong> Help us improve by sharing constructive feedback
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
          <p className="text-gray-700 mb-4">
            For questions about this Refund Policy or to report billing errors:
          </p>
          <p className="text-gray-700">
            <strong>Email:</strong> support@meme-go.com
            <br />
            <strong>Subject Line:</strong> "Refund Policy Question" or "Billing Error"
            <br />
            <strong>Response Time:</strong> Within 48 hours during business days
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Payment Processor</h2>
          <p className="text-gray-700 mb-4">
            All payments are processed securely through FastSpring. For payment-related questions:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>FastSpring Support:</strong> Available through your payment confirmation email
            </li>
            <li>
              <strong>Transaction History:</strong> Accessible through FastSpring's customer portal
            </li>
            <li>
              <strong>Payment Disputes:</strong> Can be initiated through FastSpring's system
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to This Policy</h2>
          <p className="text-gray-700">
            We reserve the right to modify this Refund Policy at any time. Changes will be effective
            immediately upon posting to our website. Your continued use of the Service after changes
            constitutes acceptance of the updated policy. Material changes will be communicated via
            email to active subscribers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Acknowledgment</h2>
          <div className="bg-gray-100 border-2 border-gray-300 p-6 rounded-lg">
            <p className="text-gray-900 font-semibold mb-3">
              By subscribing to MemeDo, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>You have read and understood this Refund Policy</li>
              <li>You agree to the NO REFUND policy</li>
              <li>All subscription payments are final and non-refundable</li>
              <li>You have tested the free plan before purchasing (if applicable)</li>
              <li>You understand that cancellation does not entitle you to a refund</li>
            </ul>
          </div>
        </section>
      </Card>
    </div>
  );
}
