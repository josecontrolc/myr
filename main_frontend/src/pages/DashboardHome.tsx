import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@shared/auth';
import DashboardQuickLinks from '../components/DashboardQuickLinks';

const DashboardHome = () => {
  const { t } = useTranslation('common');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-textSecondary dark:text-textSecondary-dark">
          {t('dashboard.home.loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="page-container">
        <div className="text-center space-y-3 mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textPrimary dark:text-textPrimary-dark">
            {t('dashboard.home.title')}{' '}
            <span className="text-secondary">MyR</span>
          </h1>
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-textSecondary dark:text-textSecondary-dark">
            {t('dashboard.home.description')}
          </p>
        </div>

        <div className="card px-4 sm:px-6 py-6 sm:py-8">
          <DashboardQuickLinks />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

