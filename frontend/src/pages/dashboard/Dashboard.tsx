import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuthStore } from '../../stores/auth.store';
import { useAnalysisStore } from '../../stores/analysis.store';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { history, isLoadingHistory, fetchHistory, supportedChains, fetchSupportedChains } =
    useAnalysisStore();

  // Load data on mount
  useEffect(() => {
    fetchHistory().catch((error) => {
      console.error('Failed to fetch history:', error);
    });

    if (supportedChains.length === 0) {
      fetchSupportedChains();
    }
  }, [fetchHistory, fetchSupportedChains, supportedChains.length]);

  const getPlanBadgeVariant = (plan: string): 'success' | 'warning' | 'gray' => {
    switch (plan) {
      case 'premium':
        return 'success';
      case 'admin':
        return 'gray';
      default:
        return 'warning';
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

  // Calculate stats from history
  const totalAnalyses = history.length;
  const lowRisk = history.filter((a) => a.risk_level === 'low').length;
  const mediumRisk = history.filter((a) => a.risk_level === 'medium').length;
  const highRisk = history.filter((a) => a.risk_level === 'high').length;

  const recentAnalyses = history.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.display_name || user?.email || 'User'}! 👋
        </h1>
        <p className="mt-2 text-gray-600">Here's an overview of your account and recent activity</p>
      </div>

      {/* User Info Card */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-medium text-gray-900 break-all">{user?.email}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Plan</p>
              <div className="flex items-center gap-2">
                <Badge variant={getPlanBadgeVariant(user?.role || 'free')} className="capitalize">
                  {user?.role === 'admin' ? '👑 Admin' : user?.role || 'Free'}
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">2FA Status</p>
              <Badge variant={user?.totp_enabled ? 'success' : 'gray'}>
                {user?.totp_enabled ? '✓ Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/profile')}>
              Edit Profile
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/settings')}>
              Settings
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Total Analyses</p>
            <p className="text-3xl font-bold text-gray-900">{totalAnalyses}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Low Risk</p>
            <p className="text-3xl font-bold text-green-600">{lowRisk}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Medium Risk</p>
            <p className="text-3xl font-bold text-yellow-600">{mediumRisk}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">High Risk</p>
            <p className="text-3xl font-bold text-red-600">{highRisk}</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/analyze')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
            >
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-1">Analyze Token</h3>
              <p className="text-sm text-gray-600">Get comprehensive security analysis</p>
            </button>
            <button
              onClick={() => navigate('/history')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
            >
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900 mb-1">View History</h3>
              <p className="text-sm text-gray-600">Review past analyses</p>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
            >
              <div className="text-3xl mb-2">👤</div>
              <h3 className="font-semibold text-gray-900 mb-1">Profile Settings</h3>
              <p className="text-sm text-gray-600">Manage your account</p>
            </button>
          </div>
        </div>
      </Card>

      {/* Recent Analyses */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Analyses</h2>
            {history.length > 0 && (
              <Button variant="secondary" size="sm" onClick={() => navigate('/history')}>
                View All
              </Button>
            )}
          </div>

          {isLoadingHistory ? (
            <div className="text-center py-8">
              <Spinner size="lg" className="mx-auto" />
              <p className="mt-2 text-gray-600 text-sm">Loading recent analyses...</p>
            </div>
          ) : recentAnalyses.length > 0 ? (
            <div className="space-y-3">
              {recentAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate('/history')}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl">{getChainIcon(analysis.chain)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {analysis.token_address.slice(0, 10)}...
                        {analysis.token_address.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {supportedChains.find((c) => c.id === analysis.chain)?.name ||
                          analysis.chain}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        Score: {analysis.safety_score}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        analysis.risk_level === 'low'
                          ? 'success'
                          : analysis.risk_level === 'medium'
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {analysis.risk_level}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">📊</div>
              <p className="text-gray-600 mb-4">No analyses yet</p>
              <Button onClick={() => navigate('/analyze')}>Analyze Your First Token</Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
