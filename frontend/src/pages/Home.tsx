import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useState } from 'react';

const Home = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 -mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-20 lg:py-28">
          <div className="text-center">
            <Badge variant="info" className="mb-6 inline-flex">
              🚀 Now supporting 6+ blockchains
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Smart Token Analysis
              <span className="block bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent mt-2">
                Before You Invest
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Protect yourself from rug pulls, scams, and risky tokens. Get comprehensive security
              analysis across multiple blockchains in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free →
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">6+</div>
                <div className="text-sm text-gray-600">Supported Chains</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">&lt;60s</div>
                <div className="text-sm text-gray-600">Analysis Time</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto py-20 px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">
            Simple, fast, and reliable token analysis in 3 steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center relative" padding="lg" hover>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-large">
              1
            </div>
            <div className="mt-8">
              <div className="h-16 w-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="h-8 w-8 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Enter Token Address</h3>
              <p className="text-gray-600">
                Simply paste the token contract address from any supported blockchain
              </p>
            </div>
          </Card>

          <Card className="text-center relative" padding="lg" hover>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-large">
              2
            </div>
            <div className="mt-8">
              <div className="h-16 w-16 bg-success-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="h-8 w-8 text-success-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get Instant Analysis</h3>
              <p className="text-gray-600">
                Our AI-powered system analyzes the token in under 60 seconds
              </p>
            </div>
          </Card>

          <Card className="text-center relative" padding="lg" hover>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-large">
              3
            </div>
            <div className="mt-8">
              <div className="h-16 w-16 bg-warning-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="h-8 w-8 text-warning-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Make Informed Decisions</h3>
              <p className="text-gray-600">
                Review comprehensive security scores, risks, and recommendations
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* What We Check */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 px-4 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Security Analysis
            </h2>
            <p className="text-xl text-gray-600">
              We check everything you need to know before investing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🔒',
                title: 'Contract Security',
                desc: 'Detect malicious functions, honeypots, and vulnerabilities',
              },
              {
                icon: '💰',
                title: 'Liquidity Analysis',
                desc: 'Check liquidity pools, locked liquidity, and LP token status',
              },
              {
                icon: '👥',
                title: 'Holder Distribution',
                desc: 'Analyze top holders, whale concentration, and distribution',
              },
              {
                icon: '⚠️',
                title: 'Risk Assessment',
                desc: 'Calculate overall risk score based on multiple factors',
              },
              {
                icon: '📊',
                title: 'Trading Activity',
                desc: 'Monitor buy/sell tax, trading volume, and price impact',
              },
              {
                icon: '🔐',
                title: 'Ownership Status',
                desc: 'Verify contract ownership, renounced status, and permissions',
              },
              {
                icon: '🎯',
                title: 'Mint & Burn',
                desc: 'Check if token can be minted or burned by owners',
              },
              {
                icon: '⏱️',
                title: 'Historical Data',
                desc: 'Track token age, deployment date, and transaction history',
              },
              {
                icon: '🌐',
                title: 'Multi-Chain',
                desc: 'Support for Ethereum, Solana, BSC, Base, Polygon, Avalanche',
              },
            ].map((item, idx) => (
              <Card key={idx} className="text-center" padding="lg" hover>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Supported Chains */}
      <div className="max-w-7xl mx-auto py-20 px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Supported Blockchains</h2>
          <p className="text-xl text-gray-600">Analyze tokens across major blockchain networks</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {[
            { name: 'Ethereum', color: 'from-blue-500 to-blue-600' },
            { name: 'Solana', color: 'from-purple-500 to-purple-600' },
            { name: 'BSC', color: 'from-yellow-500 to-yellow-600' },
            { name: 'Base', color: 'from-blue-600 to-blue-700' },
            { name: 'Polygon', color: 'from-purple-600 to-purple-700' },
            { name: 'Avalanche', color: 'from-red-500 to-red-600' },
          ].map((chain, idx) => (
            <Card key={idx} className="text-center group" padding="lg" hover>
              <div
                className={`h-16 w-16 bg-gradient-to-br ${chain.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-medium group-hover:shadow-large transition-all duration-200`}
              >
                <span className="text-white font-bold text-xl">{chain.name[0]}</span>
              </div>
              <h3 className="font-semibold text-gray-900">{chain.name}</h3>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="max-w-7xl mx-auto py-20 px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600">Choose the plan that fits your needs</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="relative" padding="lg" hover>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $0
                <span className="text-lg text-gray-600 font-normal">/month</span>
              </div>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <svg
                  className="h-6 w-6 text-success-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">10 token analyses per month</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="h-6 w-6 text-success-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">Basic security analysis</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="h-6 w-6 text-success-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">All 6 supported blockchains</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="h-6 w-6 text-success-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">Analysis history</span>
              </li>
            </ul>
            <Link to="/register" className="block">
              <Button variant="secondary" className="w-full">
                Get Started Free
              </Button>
            </Link>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-2 border-primary-500" padding="lg" hover>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge variant="info" className="px-4 py-1">
                Most Popular
              </Badge>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent mb-2">
                $39.99
                <span className="text-lg text-gray-600 font-normal">/month</span>
              </div>
              <p className="text-gray-600">For serious traders</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <svg
                  className="h-6 w-6 text-primary-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">
                  <strong>Unlimited</strong> token analyses
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="h-6 w-6 text-primary-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">Advanced security analysis</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="h-6 w-6 text-primary-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">API access for automation</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="h-6 w-6 text-primary-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">Bulk analysis (CSV import)</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="h-6 w-6 text-primary-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">Priority support</span>
              </li>
            </ul>
            <Link to="/pricing" className="block">
              <Button className="w-full">Upgrade to Premium</Button>
            </Link>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Link to="/pricing" className="text-primary-600 hover:text-primary-700 font-semibold">
            View detailed pricing comparison →
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 px-4 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What blockchains do you support?',
                a: "We currently support Ethereum, Solana, BSC (Binance Smart Chain), Base, Polygon, and Avalanche. We're constantly adding support for more chains.",
              },
              {
                q: 'How accurate is your analysis?',
                a: 'Our analysis combines data from multiple trusted APIs including GoPlus Security API and blockchain nodes. While we strive for 100% accuracy, no analysis can guarantee complete safety. Always do your own research.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'No, all subscriptions are non-refundable. We recommend starting with our free plan to test the service before upgrading to Premium.',
              },
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes! You can cancel your Premium subscription at any time. Your access will continue until the end of your billing period.',
              },
              {
                q: 'Is this financial advice?',
                a: 'No. MemeDo provides technical analysis and security information for educational purposes only. This is NOT financial advice. Always consult with financial professionals before making investment decisions.',
              },
              {
                q: 'How fast is the analysis?',
                a: 'Most token analyses complete in under 60 seconds. Complex tokens with extensive transaction history may take slightly longer.',
              },
            ].map((faq, idx) => (
              <Card key={idx} padding="none" className="overflow-hidden" hover>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-8">{faq.q}</span>
                  <svg
                    className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-gray-600 animate-slide-down">{faq.a}</div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 py-20 px-4 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Make Smarter Investment Decisions?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Join thousands of traders protecting themselves from scams and rug pulls. Start
            analyzing tokens for free today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100 w-full sm:w-auto"
              >
                Get Started Free →
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                size="lg"
                variant="ghost"
                className="text-white border-2 border-white hover:bg-white/10 w-full sm:w-auto"
              >
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="text-primary-100 text-sm mt-8">
            ⚠️ No credit card required for free plan • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
