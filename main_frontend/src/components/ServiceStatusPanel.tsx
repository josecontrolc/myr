import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@shared/auth';

type ServiceStatus = 'ok' | 'error' | 'checking';

interface Service {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  message: string;
  detail?: string;
}

const StatusDot = ({ status }: { status: ServiceStatus }) => {
  if (status === 'checking') {
    return (
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400" />
      </span>
    );
  }
  return (
    <span className="relative flex h-3 w-3">
      {status === 'ok' && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
      )}
      <span
        className={`relative inline-flex rounded-full h-3 w-3 ${
          status === 'ok' ? 'bg-emerald-500' : 'bg-red-500'
        }`}
      />
    </span>
  );
};

const ServiceRow = ({ svc }: { svc: Service }) => (
  <div
    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
      svc.status === 'ok'
        ? 'bg-emerald-50 border-emerald-100'
        : svc.status === 'error'
          ? 'bg-red-50 border-red-100'
          : 'bg-gray-50 border-gray-100'
    }`}
  >
    <StatusDot status={svc.status} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-semibold text-gray-800">{svc.name}</p>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            svc.status === 'ok'
              ? 'bg-emerald-100 text-emerald-700'
              : svc.status === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {svc.status === 'ok'
            ? 'Operational'
            : svc.status === 'error'
              ? 'Unavailable'
              : 'Checking...'}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-0.5">{svc.description}</p>
    </div>
    <p
      className={`text-xs font-mono text-right flex-shrink-0 hidden sm:block ${
        svc.status === 'ok'
          ? 'text-emerald-600'
          : svc.status === 'error'
            ? 'text-red-500'
            : 'text-gray-400'
      }`}
    >
      {svc.message}
    </p>
  </div>
);

const CHECKING_PLACEHOLDER: Service[] = [
  {
    id: 'proxy',
    name: 'NGINX Proxy',
    description: 'DMZ reverse proxy and request router',
    status: 'checking',
    message: '...',
  },
  {
    id: 'api',
    name: 'Express API',
    description: 'Internal REST API server',
    status: 'checking',
    message: '...',
  },
  {
    id: 'database',
    name: 'PostgreSQL',
    description: 'Relational database (internal network)',
    status: 'checking',
    message: '...',
  },
  {
    id: 'auth',
    name: 'Auth Service',
    description: 'Better Auth session management',
    status: 'checking',
    message: '...',
  },
  {
    id: 'session',
    name: 'User Session',
    description: 'Current authenticated session',
    status: 'checking',
    message: '...',
  },
];

const ServiceStatusPanel = () => {
  const [services, setServices] = useState<Service[]>(CHECKING_PLACEHOLDER);
  const [checking, setChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { user, loading } = useAuth();

  const checkServices = useCallback(async () => {
    setChecking(true);

    const proxyOk: Service = {
      id: 'proxy',
      name: 'NGINX Proxy',
      description: 'DMZ reverse proxy and request router',
      status: 'ok',
      message: 'Routing requests',
    };

    let apiOk: Service = {
      id: 'api',
      name: 'Express API',
      description: 'Internal REST API server',
      status: 'error',
      message: 'No response',
    };

    let dbOk: Service = {
      id: 'database',
      name: 'PostgreSQL',
      description: 'Relational database (internal network)',
      status: 'error',
      message: 'No response',
    };

    let authOk: Service = {
      id: 'auth',
      name: 'Auth Service',
      description: 'Better Auth session management',
      status: 'error',
      message: 'No response',
    };

    try {
      const res = await fetch('/api/health');
      const data = await res.json();

      apiOk = {
        id: 'api',
        name: 'Express API',
        description: 'Internal REST API server',
        status: res.ok ? 'ok' : 'error',
        message: res.ok ? `HTTP ${res.status}` : `HTTP ${res.status}`,
      };

      const db = data?.services?.database;
      dbOk = {
        id: 'database',
        name: 'PostgreSQL',
        description: 'Relational database (internal network)',
        status: db?.ok ? 'ok' : 'error',
        message: db?.message ?? (db?.ok ? 'Connected' : 'Connection failed'),
      };
    } catch {
    }

    try {
      const authRes = await fetch('/api/auth/get-session', {
        credentials: 'include',
      });
      authOk = {
        id: 'auth',
        name: 'Auth Service',
        description: 'Better Auth session management',
        status: authRes.ok ? 'ok' : 'error',
        message: authRes.ok ? `HTTP ${authRes.status}` : `HTTP ${authRes.status}`,
      };
    } catch {
    }

    const sessionSvc: Service = {
      id: 'session',
      name: 'User Session',
      description: 'Current authenticated session',
      status: user ? 'ok' : 'error',
      message: user ? user.email : 'Not authenticated',
    };

    setServices([proxyOk, apiOk, dbOk, authOk, sessionSvc]);
    setLastChecked(new Date());
    setChecking(false);
  }, [user]);

  useEffect(() => {
    if (!loading) checkServices();
  }, [loading, checkServices]);

  useEffect(() => {
    if (loading) return;
    const interval = setInterval(checkServices, 30_000);
    return () => clearInterval(interval);
  }, [loading, checkServices]);

  const allOk = services.every((s) => s.status === 'ok');
  const anyError = services.some((s) => s.status === 'error');

  return (
    <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-textSecondary dark:text-textSecondary-dark uppercase tracking-wider">
          Services Status
        </h2>
        <button
          onClick={checkServices}
          disabled={checking}
          className="flex items-center gap-1.5 text-xs text-secondary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {checking ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-2.5">
        {services.map((svc) => (
          <ServiceRow key={svc.id} svc={svc} />
        ))}
      </div>

      {lastChecked && !checking && (
        <p className="mt-4 text-xs text-textSecondary dark:text-textSecondary-dark text-right">
          Last checked: {lastChecked.toLocaleTimeString()} · Auto refreshes every 30 s
        </p>
      )}
    </div>
  );
};

export default ServiceStatusPanel;

