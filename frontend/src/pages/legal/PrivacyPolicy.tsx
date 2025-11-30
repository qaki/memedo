import { Card } from '../../components/ui/Card';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-600">Last Updated: November 30, 2025</p>
      </div>

      <Card padding="lg" className="prose prose-sm max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-700 mb-4">
            MemeDo ("we", "us", or "our") is committed to protecting your privacy. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your information when you
            use our blockchain token analysis platform ("Service").
          </p>
          <p className="text-gray-700">
            By using our Service, you consent to the data practices described in this policy. If you
            do not agree with this policy, please do not use our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
            2.1 Information You Provide
          </h3>
          <p className="text-gray-700 mb-4">
            We collect information that you voluntarily provide to us:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Account Information:</strong> Email address, display name, password
              (encrypted)
            </li>
            <li>
              <strong>Payment Information:</strong> Processed securely through our payment processor
              (FastSpring). We do not store complete credit card information
            </li>
            <li>
              <strong>Profile Information:</strong> Optional profile details and preferences
            </li>
            <li>
              <strong>Communications:</strong> Messages you send us through contact forms or support
              requests
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
            2.2 Automatically Collected Information
          </h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Usage Data:</strong> Token addresses analyzed, analysis frequency, features
              used
            </li>
            <li>
              <strong>Device Information:</strong> IP address, browser type, operating system,
              device type
            </li>
            <li>
              <strong>Analytics Data:</strong> Pages visited, time spent, navigation patterns
            </li>
            <li>
              <strong>Cookies and Tracking:</strong> Session cookies, authentication tokens,
              analytics cookies
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Blockchain Data</h3>
          <p className="text-gray-700">
            We access publicly available blockchain data to perform our analysis. This includes
            smart contract code, transaction histories, holder distributions, and liquidity pool
            data. This information is publicly available on blockchain networks and is not
            considered personal information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use the collected information for the following purposes:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Service Provision:</strong> To provide, maintain, and improve our token
              analysis services
            </li>
            <li>
              <strong>Account Management:</strong> To create and manage your account, process
              subscriptions
            </li>
            <li>
              <strong>Authentication:</strong> To verify your identity and secure your account
            </li>
            <li>
              <strong>Payment Processing:</strong> To process subscription payments and prevent
              fraud
            </li>
            <li>
              <strong>Communication:</strong> To send service updates, security alerts, and support
              responses
            </li>
            <li>
              <strong>Analytics:</strong> To understand usage patterns and improve our Service
            </li>
            <li>
              <strong>Legal Compliance:</strong> To comply with legal obligations and enforce our
              Terms
            </li>
            <li>
              <strong>Security:</strong> To detect, prevent, and address security issues and
              fraudulent activity
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            4. Information Sharing and Disclosure
          </h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
            4.1 We Do NOT Sell Your Data
          </h3>
          <p className="text-gray-700 mb-4">
            We do not sell, rent, or trade your personal information to third parties for marketing
            purposes.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Service Providers</h3>
          <p className="text-gray-700 mb-4">
            We may share information with trusted service providers who assist us:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Payment Processing:</strong> FastSpring (payment gateway)
            </li>
            <li>
              <strong>Hosting:</strong> Render.com (application hosting)
            </li>
            <li>
              <strong>Database:</strong> Neon (PostgreSQL database)
            </li>
            <li>
              <strong>Blockchain Data:</strong> GoPlus Security API and blockchain node providers
            </li>
            <li>
              <strong>Email Services:</strong> Resend (transactional emails)
            </li>
            <li>
              <strong>Analytics:</strong> Usage analytics providers
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Legal Requirements</h3>
          <p className="text-gray-700 mb-4">
            We may disclose your information if required by law or in response to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Valid legal processes (subpoenas, court orders)</li>
            <li>Compliance with legal obligations</li>
            <li>Protection of our rights, property, or safety</li>
            <li>Investigation of fraud or security issues</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.4 Business Transfers</h3>
          <p className="text-gray-700">
            In the event of a merger, acquisition, or sale of assets, your information may be
            transferred as part of that transaction. We will notify you of any such change in
            ownership or control.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement industry-standard security measures to protect your information:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Encryption:</strong> Data in transit is encrypted using TLS/SSL
            </li>
            <li>
              <strong>Password Security:</strong> Passwords are hashed using bcrypt
            </li>
            <li>
              <strong>Access Controls:</strong> Limited employee access to personal data
            </li>
            <li>
              <strong>Secure Infrastructure:</strong> Hosted on secure, monitored servers
            </li>
            <li>
              <strong>Regular Security Audits:</strong> Periodic security assessments
            </li>
          </ul>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="text-gray-700">
              <strong>Note:</strong> No method of transmission over the internet or electronic
              storage is 100% secure. While we strive to protect your information, we cannot
              guarantee absolute security.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
          <p className="text-gray-700 mb-4">
            We retain your information for as long as necessary to provide our Service and comply
            with legal obligations:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Active Accounts:</strong> Data retained while your account is active
            </li>
            <li>
              <strong>Deleted Accounts:</strong> Personal data deleted within 30 days of account
              deletion
            </li>
            <li>
              <strong>Analysis History:</strong> Anonymized analysis data may be retained for
              service improvement
            </li>
            <li>
              <strong>Legal Compliance:</strong> Some data retained longer if required by law
            </li>
            <li>
              <strong>Backup Systems:</strong> Data in backups deleted according to backup retention
              schedule
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Privacy Rights</h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
            7.1 Access and Portability
          </h3>
          <p className="text-gray-700 mb-4">
            You have the right to request a copy of your personal data in a portable format.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.2 Correction</h3>
          <p className="text-gray-700 mb-4">
            You can update your account information through your profile settings or by contacting
            us.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.3 Deletion</h3>
          <p className="text-gray-700 mb-4">
            You can request deletion of your account and personal data. Note that some information
            may be retained as required by law.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.4 Marketing Opt-Out</h3>
          <p className="text-gray-700 mb-4">
            You can opt out of marketing communications by clicking "unsubscribe" in emails or
            updating your preferences.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.5 Cookie Preferences</h3>
          <p className="text-gray-700">
            You can control cookie settings through your browser preferences. Note that disabling
            cookies may affect Service functionality.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            8. Cookies and Tracking Technologies
          </h2>
          <p className="text-gray-700 mb-4">We use the following types of cookies:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Essential Cookies:</strong> Required for authentication and security
            </li>
            <li>
              <strong>Functional Cookies:</strong> Remember your preferences and settings
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Help us understand how you use our Service
            </li>
            <li>
              <strong>Session Cookies:</strong> Temporary cookies deleted when you close your
              browser
            </li>
            <li>
              <strong>Persistent Cookies:</strong> Remain on your device for a set period
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Links</h2>
          <p className="text-gray-700">
            Our Service may contain links to third-party websites or services. We are not
            responsible for the privacy practices of these third parties. We encourage you to review
            their privacy policies before providing any information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
          <p className="text-gray-700">
            Our Service is not intended for users under 18 years of age. We do not knowingly collect
            personal information from children. If you believe we have collected information from a
            child, please contact us immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            11. International Data Transfers
          </h2>
          <p className="text-gray-700">
            Your information may be transferred to and processed in countries other than your
            country of residence. These countries may have different data protection laws. By using
            our Service, you consent to such transfers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">12. California Privacy Rights</h2>
          <p className="text-gray-700 mb-4">
            California residents have additional rights under the California Consumer Privacy Act
            (CCPA):
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Right to know what personal information is collected</li>
            <li>Right to know if personal information is sold or disclosed</li>
            <li>Right to opt-out of the sale of personal information</li>
            <li>Right to request deletion of personal information</li>
            <li>Right to non-discrimination for exercising privacy rights</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            13. GDPR Rights (European Users)
          </h2>
          <p className="text-gray-700 mb-4">
            If you are in the European Economic Area (EEA), you have rights under the General Data
            Protection Regulation (GDPR):
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Right to access your personal data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure ("right to be forgotten")</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
            <li>Right to withdraw consent</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to Privacy Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will notify you of material
            changes by posting the updated policy on our website and updating the "Last Updated"
            date. We encourage you to review this policy periodically.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about this Privacy Policy or want to exercise your privacy rights,
            please contact us:
          </p>
          <p className="text-gray-700">
            <strong>Email:</strong> privacy@meme-go.com
            <br />
            <strong>Website:</strong> https://www.meme-go.com
            <br />
            <strong>Subject Line:</strong> "Privacy Request"
          </p>
        </section>

        <section>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-gray-900 font-semibold mb-2">Your Privacy Matters</p>
            <p className="text-gray-700">
              We are committed to protecting your privacy and being transparent about our data
              practices. If you have any concerns or questions, please don't hesitate to reach out
              to us.
            </p>
          </div>
        </section>
      </Card>
    </div>
  );
}
