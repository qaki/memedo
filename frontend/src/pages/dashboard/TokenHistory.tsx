/**
 * Token History Page
 * Displays historical analysis data for a specific token
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHistoricalStore } from '../../stores/historical.store';
import { HistoricalLineChart } from '../../components/charts/HistoricalLineChart';
import { HistoricalAreaChart } from '../../components/charts/HistoricalAreaChart';
import { ChartCard } from '../../components/analytics/ChartCard';
import { StatCard } from '../../components/analytics/StatCard';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Spinner } from '../../components/common/Spinner';

const TokenHistory = () => {
  const { chain, address } = useParams<{ chain: string; address: string }>();
  const navigate = useNavigate();
  const { currentTokenHistory, isLoading, fetchTokenHistory, reanalyzeToken, clearHistory } =
    useHistoricalStore();

  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(30); // days
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  useEffect(() => {
    if (chain && address) {
      fetchTokenHistory(address, chain, selectedTimeRange);
    }

    return () => {
      clearHistory();
    };
  }, [chain, address, selectedTimeRange]);

  const handleReanalyze = async () => {
    if (!chain || !address) return;

    setIsReanalyzing(true);
    try {
      await reanalyzeToken(address, chain);
    } finally {
      setIsReanalyzing(false);
    }
  };

  if (isLoading && !currentTokenHistory) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentTokenHistory) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Historical Data Found</h2>
          <p className="text-gray-400 mb-6">
            This token doesn't have enough historical data yet. Analyze it multiple times to build
            history.
          </p>
          <button
            onClick={() => navigate('/watchlist')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Watchlist
          </button>
        </div>
      </div>
    );
  }

  const { dataPoints, summary, tokenName, tokenSymbol, totalAnalyses, dateRange } =
    currentTokenHistory;

  // Prepare chart data
  const safetyData = dataPoints.map((point) => ({
    timestamp: point.timestamp,
    safetyScore: point.safetyScore,
  }));

  const priceData = dataPoints
    .filter((point) => point.priceUSD !== null)
    .map((point) => ({
      timestamp: point.timestamp,
      price: point.priceUSD,
    }));

  const liquidityData = dataPoints
    .filter((point) => point.liquidityUSD !== null)
    .map((point) => ({
      timestamp: point.timestamp,
      liquidity: point.liquidityUSD,
    }));

  const holderData = dataPoints
    .filter((point) => point.holders !== null || point.top10HolderPercentage !== null)
    .map((point) => ({
      timestamp: point.timestamp,
      holders: point.holders,
      top10Concentration: point.top10HolderPercentage,
    }));

  // Get trend indicator
  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="text-green-500" size={20} />;
    if (change < 0) return <TrendingDown className="text-red-500" size={20} />;
    return <Minus className="text-gray-500" size={20} />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {tokenName || 'Unknown'} ({tokenSymbol || 'N/A'})
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {totalAnalyses} {totalAnalyses === 1 ? 'analysis' : 'analyses'} •{' '}
              {new Date(dateRange.oldest).toLocaleDateString()} -{' '}
              {new Date(dateRange.newest).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(Number(e.target.value))}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>

          {/* Re-analyze Button */}
          <button
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={isReanalyzing ? 'animate-spin' : ''} />
            {isReanalyzing ? 'Re-analyzing...' : 'Re-analyze'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Average Safety Score"
          value={summary.averageSafetyScore}
          suffix="/100"
          icon={getTrendIcon(summary.safetyScoreChange)}
          trend={
            summary.safetyScoreChange !== 0
              ? `${summary.safetyScoreChange > 0 ? '+' : ''}${summary.safetyScoreChange}`
              : undefined
          }
        />
        <StatCard
          title="Current Risk Level"
          value={summary.currentRiskLevel.toUpperCase()}
          icon={getTrendIcon(0)}
          trend={
            summary.riskLevelChanged
              ? `Changed from ${summary.previousRiskLevel.toUpperCase()}`
              : undefined
          }
        />
        <StatCard
          title="Price Change"
          value={
            summary.priceChange !== null
              ? `${summary.priceChange > 0 ? '+' : ''}${summary.priceChange.toFixed(2)}%`
              : 'N/A'
          }
          icon={getTrendIcon(summary.priceChange || 0)}
        />
        <StatCard title="Total Analyses" value={totalAnalyses} icon={getTrendIcon(0)} />
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Safety Score Chart */}
        <ChartCard
          title="Safety Score Over Time"
          subtitle="Track how the token's safety rating has changed"
        >
          <HistoricalAreaChart
            data={safetyData}
            dataKey="safetyScore"
            name="Safety Score"
            color="#6366F1"
            gradientColor="#818CF8"
            yAxisLabel="Score (0-100)"
            height={350}
            formatter={(value) => `${value}/100`}
          />
        </ChartCard>

        {/* Price Chart */}
        {priceData.length > 0 && (
          <ChartCard title="Price History" subtitle="Track price movements over time">
            <HistoricalAreaChart
              data={priceData}
              dataKey="price"
              name="Price (USD)"
              color="#10B981"
              gradientColor="#34D399"
              yAxisLabel="Price (USD)"
              height={350}
              formatter={(value) =>
                `$${value < 0.01 ? value.toExponential(2) : value.toFixed(value < 1 ? 4 : 2)}`
              }
            />
          </ChartCard>
        )}

        {/* Liquidity Chart */}
        {liquidityData.length > 0 && (
          <ChartCard title="Liquidity History" subtitle="Monitor liquidity pool depth over time">
            <HistoricalAreaChart
              data={liquidityData}
              dataKey="liquidity"
              name="Liquidity (USD)"
              color="#F59E0B"
              gradientColor="#FBBF24"
              yAxisLabel="Liquidity (USD)"
              height={350}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
          </ChartCard>
        )}

        {/* Holder Metrics Chart */}
        {holderData.length > 0 && (
          <ChartCard title="Holder Metrics" subtitle="Track holder count and top 10 concentration">
            <HistoricalLineChart
              data={holderData}
              dataKeys={[
                {
                  key: 'holders',
                  name: 'Total Holders',
                  color: '#8B5CF6',
                  formatter: (value) => value.toLocaleString(),
                },
                {
                  key: 'top10Concentration',
                  name: 'Top 10 Concentration (%)',
                  color: '#EC4899',
                  formatter: (value) => `${value.toFixed(2)}%`,
                },
              ]}
              height={350}
            />
          </ChartCard>
        )}
      </div>
    </div>
  );
};

export default TokenHistory;
