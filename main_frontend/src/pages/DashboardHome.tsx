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
    <div className="min-h-[calc(100vh-4rem)] text-textPrimary dark:text-textPrimary-dark flex dark:bg-gradient-to-b dark:from-dark-purple dark:via-black-purple dark:to-black-purple">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col justify-center">
        <div className="card rounded-lg px-6 sm:px-8 py-8 sm:py-10 space-y-8">
          <header className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textPrimary dark:text-textPrimary-dark">
              {t('dashboard.home.title')}{' '}
              <span className="text-secondary">MyR</span>
            </h1>
            <p className="max-w-3xl mx-auto text-sm sm:text-base text-textSecondary dark:text-textSecondary-dark">
              {t('dashboard.home.description')}
            </p>
            <p className="max-w-3xl mx-auto text-sm sm:text-base text-textSecondary dark:text-textSecondary-dark">
              {t('dashboard.home.description2')}
            </p>
          </header>

          <DashboardQuickLinks />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

