import type { ReactNode } from "react";

interface AdminCardProps {
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  children: ReactNode;
}

const AdminCard = ({ title, subtitle, headerRight, children }: AdminCardProps) => {
  const hasHeader = title || subtitle || headerRight;

  return (
    <section className="bg-surface dark:bg-surface-dark rounded-lg shadow-sm border border-border dark:border-border-dark">
      {hasHeader && (
        <div className="px-6 py-4 border-b border-border dark:border-border-dark flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-textPrimary dark:text-textPrimary-dark">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-textSecondary dark:text-textSecondary-dark mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerRight}
        </div>
      )}

      {children}
    </section>
  );
};

export default AdminCard;

