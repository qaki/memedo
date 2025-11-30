import { Card } from '../../components/ui/Card';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-600">Last Updated: November 30, 2025</p>
      </div>

      <Card padding="lg" className="prose prose-sm max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing or using MemeDo ("Service", "Platform", "we", "us", or "our"), you agree to
            be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you
            may not access or use the Service.
          </p>
          <p className="text-gray-700">
            MemeDo is a blockchain token analysis platform that provides security assessments, risk
            evaluations, and analytical insights for cryptocurrency tokens across multiple
            blockchain networks.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
          <p className="text-gray-700 mb-4">MemeDo provides the following services:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Multi-chain token security analysis</li>
            <li>Risk assessment and safety scoring</li>
            <li>Smart contract vulnerability detection</li>
            <li>Token holder distribution analysis</li>
            <li>Liquidity pool analysis</li>
            <li>Historical analysis records</li>
            <li>Subscription-based premium features</li>
          </ul>
          <p className="text-gray-700">
            We utilize third-party APIs and blockchain data sources to provide our analysis. The
            accuracy and completeness of our analysis depends on the availability and quality of
            this data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
          <p className="text-gray-700 mb-4">
            <strong>3.1 Account Registration:</strong> To access certain features, you must create
            an account. You agree to provide accurate, current, and complete information during
            registration.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>3.2 Account Security:</strong> You are responsible for maintaining the
            confidentiality of your account credentials and for all activities that occur under your
            account.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>3.3 Account Termination:</strong> We reserve the right to suspend or terminate
            your account at any time for violation of these Terms or for any other reason at our
            sole discretion.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription Plans</h2>
          <p className="text-gray-700 mb-4">
            <strong>4.1 Free Plan:</strong> Limited access to basic token analysis features with
            monthly analysis limits.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>4.2 Premium Plan:</strong> Subscription-based access to advanced features
            including unlimited analyses, API access, bulk analysis, and priority support.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>4.3 Billing:</strong> Premium subscriptions are billed monthly or annually in
            advance. Prices are stated in USD and are subject to change with 30 days' notice.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>4.4 Automatic Renewal:</strong> Subscriptions automatically renew at the end of
            each billing period unless cancelled before the renewal date.
          </p>
          <p className="text-gray-700">
            <strong>4.5 Cancellation:</strong> You may cancel your subscription at any time.
            Cancellation takes effect at the end of the current billing period. No partial refunds
            are provided for unused time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Important Disclaimers</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="text-gray-900 font-semibold mb-2">⚠️ NOT FINANCIAL ADVICE</p>
            <p className="text-gray-700">
              MemeDo provides analytical information and risk assessments for educational and
              informational purposes only. Our analysis is NOT financial, investment, legal, or tax
              advice. You should not construe any information provided by MemeDo as investment
              advice or a recommendation to buy, sell, or hold any cryptocurrency or token.
            </p>
          </div>
          <p className="text-gray-700 mb-4">
            <strong>5.1 No Guarantees:</strong> We do not guarantee the accuracy, completeness, or
            timeliness of any analysis or information provided through our Service. Blockchain data
            and smart contracts are complex and may contain undiscovered vulnerabilities.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>5.2 Investment Risk:</strong> Cryptocurrency investments carry substantial risk
            of loss. You acknowledge that any investment decisions made based on our analysis are
            made at your own risk.
          </p>
          <p className="text-gray-700">
            <strong>5.3 Third-Party Data:</strong> We rely on third-party data sources and APIs. We
            are not responsible for errors, omissions, or delays in third-party data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Acceptable Use Policy</h2>
          <p className="text-gray-700 mb-4">You agree NOT to:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Use the Service for any illegal purpose or in violation of any laws</li>
            <li>Attempt to gain unauthorized access to our systems or networks</li>
            <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
            <li>Use automated scripts or bots to access the Service without permission</li>
            <li>Resell, redistribute, or sublicense access to the Service</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Impersonate any person or entity or misrepresent your affiliation</li>
            <li>Share your account credentials with third parties</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
          <p className="text-gray-700 mb-4">
            All content, features, and functionality of the Service, including but not limited to
            software, text, graphics, logos, and analysis algorithms, are owned by MemeDo or our
            licensors and are protected by copyright, trademark, and other intellectual property
            laws.
          </p>
          <p className="text-gray-700">
            You are granted a limited, non-exclusive, non-transferable license to access and use the
            Service for your personal or internal business purposes in accordance with these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-gray-900 font-semibold mb-2">LIMITATION OF LIABILITY</p>
            <p className="text-gray-700">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, MEMEDO AND ITS AFFILIATES, OFFICERS,
              DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF
              PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE,
              EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
          </div>
          <p className="text-gray-700">
            Our total liability to you for all claims arising out of or related to the Service shall
            not exceed the amount you paid to us in the twelve (12) months preceding the claim, or
            $100 USD, whichever is greater.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
          <p className="text-gray-700">
            You agree to indemnify, defend, and hold harmless MemeDo and its affiliates, officers,
            directors, employees, and agents from and against any claims, liabilities, damages,
            losses, costs, or expenses (including reasonable attorneys' fees) arising out of or
            related to your use of the Service, violation of these Terms, or violation of any rights
            of third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Service Availability</h2>
          <p className="text-gray-700 mb-4">
            We strive to provide reliable service but do not guarantee uninterrupted or error-free
            access. The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any
            kind, either express or implied.
          </p>
          <p className="text-gray-700">
            We reserve the right to modify, suspend, or discontinue any part of the Service at any
            time without notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
          <p className="text-gray-700">
            We may update these Terms from time to time. We will notify you of material changes by
            posting the updated Terms on our website and updating the "Last Updated" date. Your
            continued use of the Service after changes become effective constitutes acceptance of
            the updated Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law and Disputes</h2>
          <p className="text-gray-700 mb-4">
            These Terms shall be governed by and construed in accordance with the laws of the
            jurisdiction where MemeDo operates, without regard to conflict of law principles.
          </p>
          <p className="text-gray-700">
            Any disputes arising out of or related to these Terms or the Service shall be resolved
            through binding arbitration in accordance with the rules of the American Arbitration
            Association, except where prohibited by law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
          <p className="text-gray-700">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="text-gray-700 mt-4">
            <strong>Email:</strong> legal@meme-go.com
            <br />
            <strong>Website:</strong> https://www.meme-go.com
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Severability</h2>
          <p className="text-gray-700">
            If any provision of these Terms is found to be unenforceable or invalid, that provision
            shall be limited or eliminated to the minimum extent necessary, and the remaining
            provisions shall remain in full force and effect.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Entire Agreement</h2>
          <p className="text-gray-700">
            These Terms, together with our Privacy Policy and Refund Policy, constitute the entire
            agreement between you and MemeDo regarding the use of the Service and supersede all
            prior agreements and understandings.
          </p>
        </section>
      </Card>
    </div>
  );
}
