/**
 * Analytics Dashboard Page
 *
 * Displays comprehensive analytics and insights about user's watchlist and tokens.
 */

import React, { useEffect } from 'react';
import { useAnalyticsStore } from '../../stores/analytics.store';
import { StatCard } from '../../components/analytics/StatCard';
import { ChartCard } from '../../components/analytics/ChartCard';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export const Analytics: React.FC = () => {
  const { dashboardStats, isLoading, error, fetchDashboardStats } = useAnalyticsStore();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg
            className="h-6 w-6 text-red-600 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-red-900 font-semibold">Error loading analytics</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardStats || dashboardStats.overview.totalTokens === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <svg
          className="mx-auto h-16 w-16 text-gray-400 mb-4"
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Analytics Data Yet</h2>
        <p className="text-gray-600 mb-6">
          Start analyzing tokens and adding them to your watchlist to see analytics here!
        </p>
        <a
          href="/analyze"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Analyze Your First Token
        </a>
      </div>
    );
  }

  const { overview, topTokens, attentionNeeded, recentActivity } = dashboardStats;

  // Prepare chart data
  const riskData = [
    { name: 'Low Risk', value: overview.riskDistribution.low, color: '#10b981' },
    { name: 'Medium Risk', value: overview.riskDistribution.medium, color: '#f59e0b' },
    { name: 'High Risk', value: overview.riskDistribution.high, color: '#ef4444' },
    { name: 'Unknown', value: overview.riskDistribution.unknown, color: '#6b7280' },
  ].filter((item) => item.value > 0);

  const chainData = Object.entries(overview.chainDistribution)
    .map(([chain, count]) => ({
      chain: chain.toUpperCase(),
      tokens: count,
    }))
    .sort((a, b) => b.tokens - a.tokens);

  // Get safety score color
  const getSafetyScoreColor = (score: number): string => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Comprehensive insights about your tracked tokens and watchlist
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tokens Tracked"
          value={overview.totalTokens}
          color="blue"
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          subtitle="In your watchlist"
        />

        <StatCard
          title="Average Safety Score"
          value={overview.averageSafetyScore.toFixed(1)}
          color={
            overview.averageSafetyScore >= 70
              ? 'green'
              : overview.averageSafetyScore >= 40
                ? 'yellow'
                : 'red'
          }
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          }
          subtitle="Out of 100"
        />

        <StatCard
          title="High Risk Tokens"
          value={overview.riskDistribution.high}
          color="red"
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          }
          subtitle="Needs attention"
        />

        <StatCard
          title="Chains Tracked"
          value={Object.keys(overview.chainDistribution).length}
          color="purple"
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          }
          subtitle="Different blockchains"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <ChartCard title="Risk Distribution" subtitle="Breakdown of tokens by risk level">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chain Distribution Bar Chart */}
        <ChartCard title="Chain Distribution" subtitle="Tokens tracked per blockchain">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chainData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="chain" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tokens" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Tokens and Attention Needed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tokens */}
        {topTokens.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performing Tokens</h3>
            <div className="space-y-3">
              {topTokens.map((token, index) => (
                <div
                  key={`${token.tokenAddress}-${token.chain}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {token.tokenName} ({token.tokenSymbol})
                      </p>
                      <p className="text-xs text-gray-500 uppercase">{token.chain}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getSafetyScoreColor(token.safetyScore)}`}>
                      {token.safetyScore}
                    </p>
                    <p className="text-xs text-gray-500">Safety Score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attention Needed */}
        {attentionNeeded.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ⚠️ Tokens Needing Attention
            </h3>
            <div className="space-y-3">
              {attentionNeeded.map((token) => (
                <div
                  key={`${token.tokenAddress}-${token.chain}`}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {token.tokenName} ({token.tokenSymbol})
                    </p>
                    <p className="text-xs text-gray-500 uppercase">{token.chain}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getSafetyScoreColor(token.safetyScore)}`}>
                      {token.safetyScore}
                    </p>
                    <p className="text-xs text-red-600 font-medium uppercase">
                      {token.riskLevel} Risk
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Recently Added Tokens</h3>
          <div className="space-y-3">
            {recentActivity.map((token) => (
              <div
                key={`${token.tokenAddress}-${token.chain}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {token.tokenName} ({token.tokenSymbol})
                  </p>
                  <p className="text-xs text-gray-500 uppercase">{token.chain}</p>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(token.addedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
