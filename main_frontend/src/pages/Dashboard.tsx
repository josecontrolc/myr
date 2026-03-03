import { useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/auth';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TwoFactorSetup from '../components/TwoFactorSetup';
import Counter from '../components/Counter';

const Dashboard = () => {
  const { t } = useTranslation('common');
  const { user, logout, loading, disable2FA, checkSession } = useAuth();
  const navigate = useNavigate();
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDisable2FA = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionError('');
    setActionLoading(true);

    try {
      await disable2FA(disablePassword);
      setShowDisable2FA(false);
      setDisablePassword('');
      await checkSession();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to disable 2FA';
      setActionError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handle2FASetupComplete = async () => {
    setShow2FASetup(false);
    await checkSession();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-textSecondary dark:text-textSecondary-dark">
          {t('dashboard.info.loading')}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="card rounded-2xl p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-textPrimary dark:text-textPrimary-dark mb-2">
                {t('dashboard.info.title')}
              </h1>
              <p className="text-textSecondary dark:text-textSecondary-dark">
                {t('dashboard.info.subtitle')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {t('auth.logout')}
            </button>
          </div>

          <div className="bg-secondary rounded-lg p-6 text-secondary-on-light dark:text-secondary-on-dark mb-8">
            <h2 className="text-2xl font-bold mb-2">
              {t('dashboard.info.greeting', {
                name: user.name || t('dashboard.info.greetingFallback'),
              })}
            </h2>
            <p className="opacity-80">{user.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card rounded-lg p-6">
              <h3 className="font-semibold text-textPrimary dark:text-textPrimary-dark mb-4">
                {t('dashboard.info.userCardTitle')}
              </h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark">
                    {t('dashboard.info.userIdLabel')}
                  </dt>
                  <dd className="text-textPrimary dark:text-textPrimary-dark font-mono text-sm">{user.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark">
                    {t('dashboard.info.emailLabel')}
                  </dt>
                  <dd className="text-textPrimary dark:text-textPrimary-dark">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark">
                    {t('dashboard.info.nameLabel')}
                  </dt>
                  <dd className="text-textPrimary dark:text-textPrimary-dark">
                    {user.name || t('dashboard.info.nameNotSet')}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="card rounded-lg p-6">
              <h3 className="font-semibold text-textPrimary dark:text-textPrimary-dark mb-4">
                {t('dashboard.info.architectureCardTitle')}
              </h3>
              <div className="space-y-2 text-sm text-textSecondary dark:text-textSecondary-dark">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-textSecondary dark:text-textSecondary-dark">
                    {t('dashboard.info.architecture.nginx')}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-textSecondary dark:text-textSecondary-dark">
                    {t('dashboard.info.architecture.frontend')}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-textSecondary dark:text-textSecondary-dark">
                    {t('dashboard.info.architecture.backend')}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-textSecondary dark:text-textSecondary-dark">
                    {t('dashboard.info.architecture.database')}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-textSecondary dark:text-textSecondary-dark">
                    {t('dashboard.info.architecture.auth')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Counter />
          </div>

          <div className="mt-8 card rounded-lg p-6">
            <h3 className="font-semibold text-textPrimary dark:text-textPrimary-dark mb-4">
              {t('dashboard.security.sectionTitle')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-textPrimary dark:text-textPrimary-dark">
                    {t('dashboard.security.twoFactorLabel')}
                  </p>
                  <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                    {user.twoFactorEnabled
                      ? t('dashboard.security.twoFactorEnabledDescription')
                      : t('dashboard.security.twoFactorDisabledDescription')}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.twoFactorEnabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                      : 'bg-primary text-textPrimary dark:bg-surface-dark dark:text-textPrimary-dark'
                  }`}>
                    {user.twoFactorEnabled
                      ? t('dashboard.security.status.enabled')
                      : t('dashboard.security.status.disabled')}
                  </span>
                  {user.twoFactorEnabled ? (
                    <button
                      onClick={() => setShowDisable2FA(true)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {t('dashboard.security.buttons.disable')}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShow2FASetup(true)}
                      className="px-4 py-2 bg-secondary text-secondary-on-light dark:text-secondary-on-dark rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                      {t('dashboard.security.buttons.enable2fa')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-primary rounded-lg p-4 border border-border dark:border-border-dark text-primary-on-light dark:text-primary-on-dark">
            <p className="text-sm">
              <span className="font-semibold">{t('dashboard.security.note.label')}</span>{' '}
              {t('dashboard.security.note.text')}
            </p>
          </div>
        </div>

        {show2FASetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface dark:bg-surface-dark rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-border dark:border-border-dark">
              <TwoFactorSetup 
                onComplete={handle2FASetupComplete}
                onCancel={() => setShow2FASetup(false)}
              />
            </div>
          </div>
        )}

        {showDisable2FA && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface dark:bg-surface-dark rounded-lg max-w-md w-full p-6 border border-border dark:border-border-dark">
              <h2 className="text-xl font-bold text-textPrimary dark:text-textPrimary-dark mb-4">
                {t('dashboard.security.disableModal.title')}
              </h2>
              <p className="text-textSecondary dark:text-textSecondary-dark mb-6">
                {t('dashboard.security.disableModal.body')}
              </p>

              <form onSubmit={handleDisable2FA} className="space-y-4">
                <div>
                  <label htmlFor="disablePassword" className="block text-sm font-medium text-textSecondary dark:text-textSecondary-dark mb-1">
                    {t('dashboard.security.disableModal.passwordLabel')}
                  </label>
                  <input
                    id="disablePassword"
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-surface dark:bg-surface-dark focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder={t('dashboard.security.disableModal.passwordPlaceholder')}
                  />
                </div>

                {actionError && (
                  <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-100 px-4 py-3 rounded-lg">
                    {actionError}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisable2FA(false);
                      setDisablePassword('');
                      setActionError('');
                    }}
                    className="flex-1 px-4 py-2 border border-border dark:border-border-dark rounded-lg hover:bg-background dark:hover:bg-background-dark"
                  >
                    {t('dashboard.security.disableModal.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading
                      ? t('dashboard.security.disableModal.confirmLoading')
                      : t('dashboard.security.disableModal.confirm')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
