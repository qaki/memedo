import { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { TokenAnalysis, SupportedChain } from '../../types';

interface AnalysisResultsProps {
  analysis: TokenAnalysis;
  chains: SupportedChain[];
  onCopyAddress?: () => void;
}

type Tab = 'overview' | 'token-info' | 'security' | 'contract' | 'raw-data';

export const AnalysisResults = ({ analysis, chains, onCopyAddress }: AnalysisResultsProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const getRiskBadgeVariant = (riskLevel: string): 'success' | 'warning' | 'danger' | 'gray' => {
    switch (riskLevel) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      default:
        return 'gray';
    }
  };

  const getChainIcon = (chainId: string) => {
    const icons: Record<string, string> = {
      ethereum: '⟠',
      solana: '◎',
      bsc: '🔶',
      polygon: '🟣',
      base: '🔵',
      avalanche: '🔺',
    };
    return icons[chainId] || '🔗';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const chainInfo = chains.find((c) => c.id === analysis.chain);

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: '📊' },
    { id: 'token-info' as Tab, label: 'Token Info', icon: '💎' },
    { id: 'security' as Tab, label: 'Security', icon: '🛡️' },
    { id: 'contract' as Tab, label: 'Contract', icon: '📝' },
    { id: 'raw-data' as Tab, label: 'Raw Data', icon: '🔧' },
  ];

  return (
    <Card>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {analysis.metadata?.name || 'Token Analysis'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(analysis.created_at).toLocaleString()}
            </p>
          </div>
          <Badge
            variant={getRiskBadgeVariant(analysis.risk_level || 'unknown')}
            className="text-lg px-4 py-2"
          >
            {(analysis.risk_level || 'unknown').toUpperCase()} RISK
          </Badge>
        </div>

        {/* Chain Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="gray">
            {getChainIcon(analysis.chain)} {chainInfo?.name || analysis.chain}
          </Badge>
          {analysis.metadata?.symbol && <Badge variant="gray">{analysis.metadata.symbol}</Badge>}
          {analysis.metadata?.is_verified && <Badge variant="success">✓ Verified</Badge>}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Safety Score */}
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Safety Score</p>
              <div
                className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBackground(analysis.safety_score)} mb-4`}
              >
                <span className={`text-4xl font-bold ${getScoreColor(analysis.safety_score)}`}>
                  {analysis.safety_score}
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {analysis.safety_score >= 80
                  ? 'Low Risk - Relatively Safe'
                  : analysis.safety_score >= 50
                    ? 'Medium Risk - Use Caution'
                    : 'High Risk - Proceed Carefully'}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Risk Level</p>
                <p className="text-xl font-bold text-gray-900 capitalize">
                  {analysis.risk_level || 'Unknown'}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Data Completeness</p>
                <p className="text-xl font-bold text-gray-900">
                  {Math.round(analysis.data_completeness * 100)}%
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Analysis Date</p>
                <p className="text-xl font-bold text-gray-900">
                  {new Date(analysis.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Key Findings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Findings</h3>
              <div className="space-y-2">
                {analysis.security_scan && analysis.security_scan.is_honeypot !== null && (
                  <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Honeypot Status</span>
                    <Badge
                      variant={analysis.security_scan.is_honeypot ? 'danger' : 'success'}
                      className="text-xs"
                    >
                      {analysis.security_scan.is_honeypot ? '⚠️ DETECTED' : '✓ SAFE'}
                    </Badge>
                  </div>
                )}
                {analysis.security_scan && analysis.security_scan.is_open_source !== null && (
                  <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Contract Source</span>
                    <Badge
                      variant={analysis.security_scan.is_open_source ? 'success' : 'warning'}
                      className="text-xs"
                    >
                      {analysis.security_scan.is_open_source ? 'Open Source ✓' : 'Closed Source'}
                    </Badge>
                  </div>
                )}
                {analysis.security_scan &&
                  (analysis.security_scan.buy_tax || analysis.security_scan.sell_tax) && (
                    <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Trading Taxes</span>
                      <span className="text-sm text-gray-900">
                        Buy: {analysis.security_scan.buy_tax || '0'}% / Sell:{' '}
                        {analysis.security_scan.sell_tax || '0'}%
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Market Health - NEW SECTION! */}
            {analysis.market_data && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">💰 Market Health</h3>

                {/* Market Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* Price */}
                  {analysis.market_data.price_usd > 0 && (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700 mb-1 font-medium">💵 Current Price</p>
                      <p className="text-xl font-bold text-blue-900">
                        $
                        {analysis.market_data.price_usd < 0.01
                          ? analysis.market_data.price_usd.toExponential(4)
                          : analysis.market_data.price_usd.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                            })}
                      </p>
                    </div>
                  )}

                  {/* Total Liquidity */}
                  {analysis.market_data.total_liquidity_usd !== undefined && (
                    <div
                      className={`p-4 border rounded-lg ${
                        analysis.market_data.is_low_liquidity
                          ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'
                          : 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                      }`}
                    >
                      <p
                        className={`text-sm font-medium mb-1 ${
                          analysis.market_data.is_low_liquidity ? 'text-red-700' : 'text-green-700'
                        }`}
                      >
                        💧 Total Liquidity {analysis.market_data.is_low_liquidity && '⚠️'}
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          analysis.market_data.is_low_liquidity ? 'text-red-900' : 'text-green-900'
                        }`}
                      >
                        ${analysis.market_data.total_liquidity_usd.toLocaleString()}
                      </p>
                      {analysis.market_data.is_low_liquidity && (
                        <p className="text-xs text-red-600 mt-1">
                          Low liquidity - High slippage risk
                        </p>
                      )}
                    </div>
                  )}

                  {/* 24h Volume */}
                  {analysis.market_data.volume_24h !== undefined && (
                    <div
                      className={`p-4 border rounded-lg ${
                        analysis.market_data.is_low_volume
                          ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300'
                          : 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                      }`}
                    >
                      <p
                        className={`text-sm font-medium mb-1 ${
                          analysis.market_data.is_low_volume ? 'text-yellow-700' : 'text-green-700'
                        }`}
                      >
                        📊 24h Volume {analysis.market_data.is_low_volume && '⚠️'}
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          analysis.market_data.is_low_volume ? 'text-yellow-900' : 'text-green-900'
                        }`}
                      >
                        ${analysis.market_data.volume_24h.toLocaleString()}
                      </p>
                      {analysis.market_data.is_low_volume && (
                        <p className="text-xs text-yellow-600 mt-1">Low trading activity</p>
                      )}
                    </div>
                  )}

                  {/* Market Cap */}
                  {analysis.market_data.market_cap > 0 && (
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-700 mb-1 font-medium">📈 Market Cap</p>
                      <p className="text-xl font-bold text-purple-900">
                        ${analysis.market_data.market_cap.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Holders */}
                  {analysis.market_data.holders > 0 && (
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-700 mb-1 font-medium">👥 Total Holders</p>
                      <p className="text-xl font-bold text-gray-900">
                        {analysis.market_data.holders.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Top 10 Holder Concentration */}
                  {analysis.market_data.top_10_holder_percentage > 0 && (
                    <div
                      className={`p-4 border rounded-lg ${
                        analysis.market_data.is_high_concentration
                          ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'
                          : 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                      }`}
                    >
                      <p
                        className={`text-sm font-medium mb-1 ${
                          analysis.market_data.is_high_concentration
                            ? 'text-red-700'
                            : 'text-green-700'
                        }`}
                      >
                        🐋 Top 10 Concentration {analysis.market_data.is_high_concentration && '⚠️'}
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          analysis.market_data.is_high_concentration
                            ? 'text-red-900'
                            : 'text-green-900'
                        }`}
                      >
                        {analysis.market_data.top_10_holder_percentage.toFixed(2)}%
                      </p>
                      {analysis.market_data.is_high_concentration && (
                        <p className="text-xs text-red-600 mt-1">High whale concentration</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Top Holders List */}
                {analysis.market_data.top_10_holders &&
                  analysis.market_data.top_10_holders.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Top 10 Holders</h4>
                      <div className="space-y-2">
                        {analysis.market_data.top_10_holders
                          .slice(0, 5)
                          .map((holder: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <span className="text-sm text-gray-600 font-mono">
                                #{idx + 1} {holder.address.slice(0, 6)}...{holder.address.slice(-4)}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-700">
                                  {holder.balance.toLocaleString(undefined, {
                                    maximumFractionDigits: 2,
                                  })}{' '}
                                  tokens
                                </span>
                                <Badge
                                  variant={
                                    holder.percentage > 10
                                      ? 'danger'
                                      : holder.percentage > 5
                                        ? 'warning'
                                        : 'gray'
                                  }
                                >
                                  {holder.percentage.toFixed(2)}%
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}

        {/* Token Info Tab */}
        {activeTab === 'token-info' && (
          <div className="space-y-6">
            {analysis.metadata ? (
              <>
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.metadata.name && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Token Name</p>
                        <p className="font-semibold text-gray-900">{analysis.metadata.name}</p>
                      </div>
                    )}
                    {analysis.metadata.symbol && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Symbol</p>
                        <p className="font-semibold text-gray-900">{analysis.metadata.symbol}</p>
                      </div>
                    )}
                    {analysis.metadata.decimals !== undefined && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Decimals</p>
                        <p className="font-semibold text-gray-900">{analysis.metadata.decimals}</p>
                      </div>
                    )}
                    {analysis.metadata.total_supply && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total Supply</p>
                        <p className="font-semibold text-gray-900">
                          {Number(analysis.metadata.total_supply).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {analysis.metadata.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{analysis.metadata.description}</p>
                  </div>
                )}

                {/* Links */}
                {(analysis.metadata.website ||
                  analysis.metadata.twitter ||
                  analysis.metadata.telegram) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Links</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.metadata.website && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(analysis.metadata!.website!, '_blank')}
                        >
                          🌐 Website
                        </Button>
                      )}
                      {analysis.metadata.twitter && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(analysis.metadata!.twitter!, '_blank')}
                        >
                          🐦 Twitter
                        </Button>
                      )}
                      {analysis.metadata.telegram && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(analysis.metadata!.telegram!, '_blank')}
                        >
                          ✈️ Telegram
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No token metadata available</p>
              </div>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {analysis.security_scan ? (
              <>
                {/* Ownership Status - NEW! */}
                {analysis.security_scan.is_ownership_renounced !== undefined && (
                  <div
                    className={`p-4 border-2 rounded-lg ${
                      analysis.security_scan.is_ownership_renounced
                        ? 'bg-green-50 border-green-300'
                        : 'bg-yellow-50 border-yellow-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {analysis.security_scan.is_ownership_renounced ? '✅' : '⚠️'}
                      </span>
                      <div>
                        <h4
                          className={`font-bold ${
                            analysis.security_scan.is_ownership_renounced
                              ? 'text-green-900'
                              : 'text-yellow-900'
                          }`}
                        >
                          Ownership{' '}
                          {analysis.security_scan.is_ownership_renounced
                            ? 'Renounced'
                            : 'Not Renounced'}
                        </h4>
                        <p
                          className={`text-sm ${
                            analysis.security_scan.is_ownership_renounced
                              ? 'text-green-700'
                              : 'text-yellow-700'
                          }`}
                        >
                          {analysis.security_scan.is_ownership_renounced
                            ? 'Contract owner has permanently given up control. This is a major safety positive!'
                            : 'Owner still has control of the contract. This could allow malicious modifications.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Critical Checks */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Critical Security Checks
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        label: 'Honeypot Detection',
                        value: analysis.security_scan.is_honeypot,
                        danger: true,
                      },
                      {
                        label: 'Hidden Owner',
                        value: analysis.security_scan.hidden_owner,
                        danger: true,
                      },
                      {
                        label: 'Self Destruct',
                        value: analysis.security_scan.selfdestruct,
                        danger: true,
                      },
                      {
                        label: 'Can Take Back Ownership',
                        value: analysis.security_scan.can_take_back_ownership,
                        danger: true,
                      },
                      {
                        label: 'Owner Can Change Balance',
                        value: analysis.security_scan.owner_change_balance,
                        danger: true,
                      },
                    ].map(
                      (check, idx) =>
                        check.value !== null && (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white border rounded-lg"
                          >
                            <span className="text-sm font-medium text-gray-700">{check.label}</span>
                            <Badge
                              variant={
                                check.danger
                                  ? check.value
                                    ? 'danger'
                                    : 'success'
                                  : check.value
                                    ? 'success'
                                    : 'gray'
                              }
                              className="text-xs"
                            >
                              {check.danger
                                ? check.value
                                  ? '⚠️ YES'
                                  : '✓ NO'
                                : check.value
                                  ? '✓ YES'
                                  : 'NO'}
                            </Badge>
                          </div>
                        )
                    )}
                  </div>
                </div>

                {/* Code Quality */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Code Quality & Transparency
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        label: 'Open Source',
                        value: analysis.security_scan.is_open_source,
                        good: true,
                      },
                      {
                        label: 'Proxy Contract',
                        value: analysis.security_scan.is_proxy,
                        good: false,
                      },
                      { label: 'Mintable', value: analysis.security_scan.is_mintable, good: false },
                      {
                        label: 'External Calls',
                        value: analysis.security_scan.external_call,
                        good: false,
                      },
                    ].map(
                      (check, idx) =>
                        check.value !== null && (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white border rounded-lg"
                          >
                            <span className="text-sm font-medium text-gray-700">{check.label}</span>
                            <Badge
                              variant={
                                check.good
                                  ? check.value
                                    ? 'success'
                                    : 'warning'
                                  : check.value
                                    ? 'warning'
                                    : ('success' as 'success' | 'warning')
                              }
                              className="text-xs"
                            >
                              {check.value ? 'YES' : 'NO'}
                            </Badge>
                          </div>
                        )
                    )}
                  </div>
                </div>

                {/* Trading Restrictions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Trading Restrictions</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Blacklist Function', value: analysis.security_scan.is_blacklisted },
                      { label: 'Whitelist Function', value: analysis.security_scan.is_whitelisted },
                      {
                        label: 'Anti-Whale Mechanism',
                        value: analysis.security_scan.is_anti_whale,
                      },
                      { label: 'Trading Cooldown', value: analysis.security_scan.trading_cooldown },
                      {
                        label: 'Transfer Pausable',
                        value: analysis.security_scan.transfer_pausable,
                      },
                      { label: 'Cannot Sell All', value: analysis.security_scan.cannot_sell_all },
                    ].map(
                      (check, idx) =>
                        check.value !== null && (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white border rounded-lg"
                          >
                            <span className="text-sm font-medium text-gray-700">{check.label}</span>
                            <Badge
                              variant={
                                check.value ? 'warning' : ('success' as 'success' | 'warning')
                              }
                              className="text-xs"
                            >
                              {check.value ? '⚠️ YES' : 'NO'}
                            </Badge>
                          </div>
                        )
                    )}
                  </div>
                </div>

                {/* Tax Info */}
                {(analysis.security_scan.buy_tax || analysis.security_scan.sell_tax) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tax Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {analysis.security_scan.buy_tax && (
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                          <p className="text-sm text-gray-600 mb-1">Buy Tax</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {analysis.security_scan.buy_tax}%
                          </p>
                        </div>
                      )}
                      {analysis.security_scan.sell_tax && (
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                          <p className="text-sm text-gray-600 mb-1">Sell Tax</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {analysis.security_scan.sell_tax}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No security scan data available</p>
              </div>
            )}
          </div>
        )}

        {/* Contract Tab */}
        {activeTab === 'contract' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contract Information</h3>

              {/* Contract Address */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Contract Address</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono text-gray-900 break-all">
                    {analysis.token_address}
                  </code>
                  <Button variant="secondary" size="sm" onClick={onCopyAddress}>
                    Copy
                  </Button>
                </div>
              </div>

              {/* Explorer Link */}
              {chainInfo && (
                <div>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      window.open(
                        `${chainInfo.explorerUrl}/address/${analysis.token_address}`,
                        '_blank'
                      )
                    }
                    className="w-full"
                  >
                    🔍 View on {chainInfo.name} Explorer
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Raw Data Tab */}
        {activeTab === 'raw-data' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Raw JSON Data</h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-green-400 font-mono">
                {JSON.stringify(analysis, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
