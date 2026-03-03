import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@shared/auth';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
        <div className="text-sm text-textSecondary dark:text-textSecondary-dark">
          Checking admin session…
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
