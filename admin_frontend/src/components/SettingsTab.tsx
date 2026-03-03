import { useState, useEffect } from 'react';
import AdminCard from "./AdminCard";

interface SystemSetting {
  id: string;
  settingKey: string;
  isEnabled: boolean;
  providerConfig: any;
  updatedAt: string;
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL || '';
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || '';

const SettingsTab = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/admin/settings`, {
        headers: {
          'x-admin-secret': ADMIN_SECRET
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSettings(data.filter((s: SystemSetting) => s.settingKey.startsWith('auth_')));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = async (setting: SystemSetting) => {
    setUpdating(setting.id);
    try {
      const response = await fetch(`${API_BASE}/api/admin/settings/${setting.settingKey}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET
        },
        body: JSON.stringify({
          isEnabled: !setting.isEnabled
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update setting: ${response.statusText}`);
      }
      
      // Refresh settings after update
      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update setting');
      console.error('Error updating setting:', err);
    } finally {
      setUpdating(null);
    }
  };

  const formatSettingName = (key: string): string => {
    // Convert auth_google_enabled to "Google"
    return key
      .replace('auth_', '')
      .replace('_enabled', '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>{error}</p>
          <button
            onClick={fetchSettings}
            className="mt-2 font-medium text-red-700 underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      <AdminCard
        title="Authentication Providers"
        subtitle="Enable or disable authentication providers for your application."
      >
        {loading && settings.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-textSecondary dark:text-textSecondary-dark">
              Loading settings...
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border dark:divide-border-dark">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-background dark:hover:bg-background-dark transition-colors"
              >
                <div className="flex-1">
                  <h4 className="text-base font-medium text-textPrimary dark:text-textPrimary-dark">
                    {formatSettingName(setting.settingKey)}
                  </h4>
                  <p className="text-sm text-textSecondary dark:text-textSecondary-dark mt-1">
                    Key:{" "}
                    <code className="bg-background dark:bg-background-dark px-2 py-0.5 rounded text-xs">
                      {setting.settingKey}
                    </code>
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <span
                    className={`text-sm font-medium ${
                      setting.isEnabled
                        ? "text-green-600"
                        : "text-textSecondary dark:text-textSecondary-dark"
                    }`}
                  >
                    {setting.isEnabled ? "Enabled" : "Disabled"}
                  </span>

                  <button
                    onClick={() => handleToggle(setting)}
                    disabled={updating === setting.id}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface-dark ${
                      setting.isEnabled ? "bg-secondary" : "bg-border dark:bg-border-dark"
                    } ${
                      updating === setting.id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    aria-pressed={setting.isEnabled}
                    aria-label={`Toggle ${formatSettingName(setting.settingKey)}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-primary-on-light transition-transform ${
                        setting.isEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}

            {settings.length === 0 && !loading && (
              <div className="px-6 py-8 text-center text-sm text-textSecondary dark:text-textSecondary-dark">
                No authentication provider settings found.
              </div>
            )}
          </div>
        )}
      </AdminCard>
    </div>
  );
};

export default SettingsTab;
