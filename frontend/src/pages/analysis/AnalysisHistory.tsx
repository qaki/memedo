import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { AnalysisResults } from '../../components/analysis/AnalysisResults';
import { useAnalysisStore } from '../../stores/analysis.store';
import { useToast } from '../../hooks/useToast';
import type { AnalysisHistoryItem } from '../../types';

const AnalysisHistory = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    history,
    supportedChains,
    currentAnalysis,
    isLoadingHistory,
    isAnalyzing,
    fetchHistory,
    fetchAnalysisById,
    fetchSupportedChains,
    clearCurrentAnalysis,
  } = useAnalysisStore();

  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  // Load history and chains on mount
  useEffect(() => {
    fetchHistory().catch((error) => {
      toast.error('Failed to load analysis history');
      console.error('History fetch error:', error);
    });

    if (supportedChains.length === 0) {
      fetchSupportedChains();
    }
  }, []); // Only run on mount - Zustand functions are stable references

  const handleViewAnalysis = async (id: string) => {
    setSelectedAnalysisId(id);
    try {
      await fetchAnalysisById(id);
    } catch (error) {
      toast.error('Failed to load analysis details');
      console.error('Analysis fetch error:', error);
    }
  };

  const handleBackToList = () => {
    setSelectedAnalysisId(null);
    clearCurrentAnalysis();
  };

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

  const formatAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  // If viewing a specific analysis, show the detailed view
  if (selectedAnalysisId && currentAnalysis) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Button */}
        <div>
          <Button variant="secondary" onClick={handleBackToList}>
            ← Back to History
          </Button>
        </div>

        {/* Analysis Details */}
        {isAnalyzing ? (
          <Card>
            <div className="p-12 text-center">
              <Spinner size="xl" className="mx-auto mb-4" />
              <p className="text-gray-600">Loading analysis details...</p>
            </div>
          </Card>
        ) : (
          <AnalysisResults
            analysis={currentAnalysis}
            chains={supportedChains}
            onCopyAddress={() => {
              navigator.clipboard.writeText(currentAnalysis.token_address);
              toast.success('Address copied!');
            }}
          />
        )}
      </div>
    );
  }

  // Otherwise, show the history list
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
          <p className="mt-2 text-gray-600">View and review your past token analyses</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/analyze')}>
          + New Analysis
        </Button>
      </div>

      {/* Loading State */}
      {isLoadingHistory && (
        <Card>
          <div className="p-12 text-center">
            <Spinner size="xl" className="mx-auto mb-4" />
            <p className="text-gray-600">Loading your analysis history...</p>
          </div>
        </Card>
      )}

      {/* History List */}
      {!isLoadingHistory && history.length > 0 && (
        <div className="space-y-4">
          {history.map((item: AnalysisHistoryItem) => (
            <Card key={item.id}>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Left Side - Token Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getChainIcon(item.chain)}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {formatAddress(item.token_address)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {supportedChains.find((c) => c.id === item.chain)?.name || item.chain}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Safety Score:</span>
                        <span className="font-semibold text-gray-900">{item.safety_score}/100</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRiskBadgeVariant(item.risk_level)}>
                          {item.risk_level.toUpperCase()} RISK
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewAnalysis(item.id)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(item.token_address);
                        toast.success('Address copied!');
                      }}
                    >
                      Copy Address
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoadingHistory && history.length === 0 && (
        <Card>
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis History</h3>
            <p className="text-gray-600 mb-6">
              You haven't analyzed any tokens yet. Get started by analyzing your first token!
            </p>
            <Button onClick={() => navigate('/analyze')}>Analyze Your First Token</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnalysisHistory;
