/**
 * Watchlist Page
 *
 * Display and manage user's watchlist of favorite tokens.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlistStore } from '../../stores/watchlist.store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { History } from 'lucide-react';
import toast from 'react-hot-toast';

export const Watchlist = () => {
  const navigate = useNavigate();
  const { watchlist, isLoading, error, fetchWatchlist, removeFromWatchlist } = useWatchlistStore();

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handleRemove = async (id: string, tokenSymbol: string | null) => {
    try {
      await removeFromWatchlist(id);
      toast.success(`Removed ${tokenSymbol || 'token'} from watchlist`);
    } catch (error) {
      toast.error('Failed to remove from watchlist');
    }
  };

  const handleAnalyze = (tokenAddress: string, chain: string) => {
    navigate(`/analyze?address=${tokenAddress}&chain=${chain}`);
  };

  const getRiskBadgeVariant = (riskLevel: string): 'success' | 'warning' | 'danger' | 'gray' => {
    switch (riskLevel.toLowerCase()) {
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

  const formatPrice = (price: number) => {
    if (price === 0) return 'N/A';
    if (price < 0.01) return `$${price.toExponential(2)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  if (isLoading && watchlist.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading watchlist</p>
          <p className="text-sm mt-2">{error}</p>
          <Button onClick={fetchWatchlist} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (watchlist.length === 0) {
    return (
      <EmptyState
        icon="⭐"
        title="Your watchlist is empty"
        description="Add tokens to your watchlist to track them and get quick access for re-analysis."
        action={{
          label: 'Analyze a Token',
          onClick: () => navigate('/analyze'),
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Watchlist</h1>
          <p className="text-gray-600 mt-1">Track your favorite tokens</p>
        </div>
        <Badge variant="gray" className="text-lg">
          {watchlist.length} {watchlist.length === 1 ? 'Token' : 'Tokens'}
        </Badge>
      </div>

      {/* Watchlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {watchlist.map((item) => (
          <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
            {/* Token Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {item.tokenName || 'Unknown Token'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="gray" size="sm">
                    {getChainIcon(item.chain)} {item.chain.toUpperCase()}
                  </Badge>
                  {item.tokenSymbol && (
                    <Badge variant="gray" size="sm">
                      {item.tokenSymbol}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Latest Analysis Info */}
            {item.latestAnalysis ? (
              <div className="space-y-3 mb-4">
                {/* Safety Score */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Safety Score</span>
                    <span className="font-bold text-gray-900">
                      {item.latestAnalysis.safetyScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.latestAnalysis.safetyScore >= 80
                          ? 'bg-green-500'
                          : item.latestAnalysis.safetyScore >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${item.latestAnalysis.safetyScore}%` }}
                    />
                  </div>
                </div>

                {/* Risk Level & Price */}
                <div className="flex items-center justify-between">
                  <Badge variant={getRiskBadgeVariant(item.latestAnalysis.riskLevel)} size="sm">
                    {item.latestAnalysis.riskLevel} Risk
                  </Badge>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(item.latestAnalysis.priceUSD)}
                  </span>
                </div>

                {/* Last Analysis Time */}
                <p className="text-xs text-gray-500">
                  Analyzed {formatTimeAgo(item.latestAnalysis.analyzedAt)}
                </p>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 text-center">No analysis data yet</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleAnalyze(item.tokenAddress, item.chain)}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                {item.latestAnalysis ? 'Re-analyze' : 'Analyze'}
              </Button>
              {item.latestAnalysis && (
                <Button
                  onClick={() => navigate(`/history/${item.chain}/${item.tokenAddress}`)}
                  variant="secondary"
                  size="sm"
                  className="px-3"
                  title="View History"
                >
                  <History size={16} />
                </Button>
              )}
              <Button
                onClick={() => handleRemove(item.id, item.tokenSymbol)}
                variant="secondary"
                size="sm"
                className="px-3"
                title="Remove from Watchlist"
              >
                🗑️
              </Button>
            </div>

            {/* Token Address (truncated) */}
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500 truncate" title={item.tokenAddress}>
                {item.tokenAddress}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
