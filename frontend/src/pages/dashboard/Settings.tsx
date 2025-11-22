import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/auth.store';

const Settings = () => {
  const { user } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account preferences and security settings</p>
      </div>

      {/* Security Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={user?.totp_enabled ? 'success' : 'gray'}>
                  {user?.totp_enabled ? '✓ Enabled' : 'Disabled'}
                </Badge>
                <Button variant="secondary" size="sm">
                  {user?.totp_enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Email Verification</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Verify your email address to secure your account
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={user?.email_verified ? 'success' : 'warning'}>
                  {user?.email_verified ? '✓ Verified' : 'Unverified'}
                </Badge>
                {!user?.email_verified && (
                  <Button variant="secondary" size="sm">
                    Resend Email
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* API Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Access</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">API Key</h3>
                <Badge variant="gray">Coming Soon</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Generate an API key to access MemeDo programmatically
              </p>
              <Button variant="secondary" size="sm" className="mt-3" disabled>
                Generate API Key
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Receive email updates about your analyses
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Security Alerts</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Get notified about important security updates
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data & Privacy</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Download Your Data</h3>
              <p className="text-sm text-gray-600 mb-3">
                Export all your analysis history and account data
              </p>
              <Button variant="secondary" size="sm">
                Request Data Export
              </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Clear Analysis History</h3>
              <p className="text-sm text-gray-600 mb-3">
                Permanently delete all your past token analyses
              </p>
              <Button variant="danger" size="sm">
                Clear History
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
