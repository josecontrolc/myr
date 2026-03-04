import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@shared/auth';
import ServiceStatusPanel from '../components/ServiceStatusPanel';

const Home = () => {
  const { t } = useTranslation('common');
  const { user, loading } = useAuth();

  return (
    <div className="bg-background dark:bg-background-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ── Header info ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark tracking-tight">
              MyR<span className="text-secondary"> {t('home.header.titleSuffix')}</span>
            </h1>
            <p className="text-sm text-textSecondary dark:text-textSecondary-dark mt-0.5">
              {t('home.header.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border dark:border-border-dark text-xs font-medium bg-surface dark:bg-surface-dark text-sec">
            <span className="inline-flex h-3 w-3 rounded-full bg-status-success dark:bg-status-success-dark" />
            {t('home.header.statusChip')}
          </div>
        </div>

        {/* ── Services Status ── */}
        <ServiceStatusPanel />

        {/* ── Quick access (only if logged in) ── */}
        {!loading && user && (
          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 p-4 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-card dark:shadow-card-dark hover:border-secondary hover:shadow-card transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-on-light dark:text-primary-on-dark group-hover:opacity-90 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-textPrimary dark:text-textPrimary-dark">Dashboard</p>
                <p className="text-xs text-textSecondary dark:text-textSecondary-dark">Menu with quick links</p>
              </div>
            </Link>
          </div>
        )}

        {/* ── Features ── */}
        <div className="card rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-textSecondary dark:text-textSecondary-dark uppercase tracking-wider mb-5">
            {t('home.features.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🔐', key: '2fa' },
              { icon: '🛡️', key: 'dmz' },
              { icon: '👥', key: 'rbac' },
              { icon: '📋', key: 'audit' },
              { icon: '🔒', key: 'sessions' },
              { icon: '🐳', key: 'docker' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-textPrimary dark:text-textPrimary-dark">
                    {t(`home.features.items.${f.key}.title`)}
                  </p>
                  <p className="text-xs text-textSecondary dark:text-textSecondary-dark leading-relaxed mt-0.5">
                    {t(`home.features.items.${f.key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Architecture diagram ── */}
        <div className="card rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-textSecondary dark:text-textSecondary-dark uppercase tracking-wider mb-6">
            {t('home.architecture.title')}
          </h2>

            <div className="flex flex-col items-center gap-0 text-xs">

            {/* Internet */}
            <div className="flex items-center justify-center w-full">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-dashed border-border dark:border-border-dark bg-background dark:bg-background-dark text-textSecondary dark:text-textSecondary-dark">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span className="font-medium">{t('home.architecture.internet')}</span>
              </div>
            </div>

            {/* Arrow down */}
            <div className="flex flex-col items-center py-1 text-border dark:text-border-dark/70">
              <div className="w-px h-5 bg-border dark:bg-border-dark/70" />
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 10L1 4h10L6 10z" />
              </svg>
            </div>

            {/* DMZ zone */}
            <div className="w-full border border-border dark:border-border-dark bg-surface dark:bg-surface-dark rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-sec">
                {t('home.architecture.dmzZone')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg px-4 py-2.5 text-center">
                  <p className="font-semibold text-textPrimary dark:text-textPrimary-dark">
                    {t('home.architecture.dmz.nginxTitle')}
                  </p>
                  <p className="text-textSecondary dark:text-textSecondary-dark text-xs mt-0.5">
                    {t('home.architecture.dmz.nginxSubtitle')}
                  </p>
                </div>
                <div className="bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg px-4 py-2.5 text-center">
                  <p className="font-semibold text-textPrimary dark:text-textPrimary-dark">
                    {t('home.architecture.dmz.frontendTitle')}
                  </p>
                  <p className="text-textSecondary dark:text-textSecondary-dark text-xs mt-0.5">
                    {t('home.architecture.dmz.frontendSubtitle')}
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow down */}
            <div className="flex flex-col items-center py-1 text-border dark:text-border-dark/70">
              <div className="w-px h-5 bg-border dark:bg-border-dark/70" />
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 10L1 4h10L6 10z" />
              </svg>
            </div>

            {/* Internal network */}
            <div className="w-full border border-border dark:border-border-dark bg-surface dark:bg-surface-dark rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-sec">
                {t('home.architecture.internalZone')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg px-4 py-2.5 text-center">
                  <p className="font-semibold text-textPrimary dark:text-textPrimary-dark">
                    {t('home.architecture.internal.backendTitle')}
                  </p>
                  <p className="text-textSecondary dark:text-textSecondary-dark text-xs mt-0.5">
                    {t('home.architecture.internal.backendSubtitle')}
                  </p>
                </div>
                <div className="bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg px-4 py-2.5 text-center">
                  <p className="font-semibold text-textPrimary dark:text-textPrimary-dark">
                    {t('home.architecture.internal.authTitle')}
                  </p>
                  <p className="text-textSecondary dark:text-textSecondary-dark text-xs mt-0.5">
                    {t('home.architecture.internal.authSubtitle')}
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow down */}
            <div className="flex flex-col items-center py-1 text-border dark:text-border-dark/70">
              <div className="w-px h-5 bg-border dark:bg-border-dark/70" />
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 10L1 4h10L6 10z" />
              </svg>
            </div>

            {/* Data layer */}
            <div className="w-full border border-border dark:border-border-dark bg-surface dark:bg-surface-dark rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-sec">
                {t('home.architecture.dataZone')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg px-4 py-2.5 text-center">
                  <p className="font-semibold text-textPrimary dark:text-textPrimary-dark">
                    {t('home.architecture.data.databaseTitle')}
                  </p>
                  <p className="text-textSecondary dark:text-textSecondary-dark text-xs mt-0.5">
                    {t('home.architecture.data.databaseSubtitle')}
                  </p>
                </div>
                <div className="bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg px-4 py-2.5 text-center">
                  <p className="font-semibold text-textPrimary dark:text-textPrimary-dark">
                    {t('home.architecture.data.ormTitle')}
                  </p>
                  <p className="text-textSecondary dark:text-textSecondary-dark text-xs mt-0.5">
                    {t('home.architecture.data.ormSubtitle')}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Legend */}
          <div className="mt-5 flex flex-wrap items-center gap-4 pt-4 border-t border-border dark:border-border-dark">
            <span className="text-xs text-textSecondary dark:text-textSecondary-dark font-medium">
              {t('home.architecture.legendLabel')}
            </span>
            {[
              { color: 'bg-primary', labelKey: 'dmz' },
              { color: 'bg-secondary', labelKey: 'internal' },
              { color: 'bg-pink', labelKey: 'data' },
            ].map((l) => (
              <span key={l.labelKey} className="flex items-center gap-1.5 text-xs text-sec">
                <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                {t(`home.architecture.legend.${l.labelKey}`)}
              </span>
            ))}
          </div>
        </div>

        {/* ── Tech stack ── */}
        <div className="card rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-textSecondary dark:text-textSecondary-dark uppercase tracking-wider mb-5">
            {t('home.techStack.title')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'React 18', role: 'UI / SPA', tag: 'Frontend', tagColor: 'bg-cyan-50 text-cyan-700' },
              { name: 'TypeScript', role: 'Static typing', tag: 'Cross-cutting', tagColor: 'bg-blue-50 text-blue-700' },
              { name: 'Vite', role: 'Bundler and dev server', tag: 'Frontend', tagColor: 'bg-cyan-50 text-cyan-700' },
              { name: 'Tailwind CSS', role: 'Utility styles', tag: 'Frontend', tagColor: 'bg-cyan-50 text-cyan-700' },
              { name: 'Express.js', role: 'REST API', tag: 'Backend', tagColor: 'bg-gray-100 text-gray-600' },
              { name: 'Better Auth', role: '2FA Authentication', tag: 'Backend', tagColor: 'bg-gray-100 text-gray-600' },
              { name: 'Prisma ORM', role: 'Typed data access', tag: 'Backend', tagColor: 'bg-gray-100 text-gray-600' },
              { name: 'PostgreSQL', role: 'Relational database', tag: 'Data', tagColor: 'bg-purple-50 text-purple-700' },
              { name: 'NGINX', role: 'Reverse proxy and TLS', tag: 'Infra', tagColor: 'bg-green-50 text-green-700' },
              { name: 'Docker Compose', role: 'Local orchestration', tag: 'Infra', tagColor: 'bg-green-50 text-green-700' },
              { name: 'Node.js LTS', role: 'Server runtime', tag: 'Backend', tagColor: 'bg-gray-100 text-gray-600' },
              { name: 'Prisma Migrate', role: 'Migration control', tag: 'Data', tagColor: 'bg-purple-50 text-purple-700' },
            ].map((tech) => (
              <div
                key={tech.name}
                className="flex flex-col justify-between p-3 border border-border dark:border-border-dark rounded-xl hover:border-secondary hover:shadow-card transition-all bg-background dark:bg-background-dark"
              >
                <div>
                  <p className="text-sm font-semibold text-textPrimary dark:text-textPrimary-dark">{tech.name}</p>
                  <p className="text-xs text-textSecondary dark:text-textSecondary-dark mt-0.5 leading-tight">{tech.role}</p>
                </div>
                <span className={`mt-2 self-start text-xs font-medium px-2 py-0.5 rounded-full ${tech.tagColor}`}>
                  {tech.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer info ── */}
        <div className="text-center pb-4">
          <p className="text-xs text-textSecondary dark:text-textSecondary-dark">
            {t('home.footer.text')}
          </p>
        </div>

      </div>
    </div>
  );
};

export default Home;
