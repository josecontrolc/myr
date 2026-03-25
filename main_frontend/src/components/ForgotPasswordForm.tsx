import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        // Log for diagnostics but always show the generic success message for security.
        console.error('Password reset request failed with status', res.status);
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Password reset request failed:', err);
      // Show generic message regardless of error to avoid leaking account existence.
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 pt-2">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-600 dark:text-emerald-400">
          {t('login.forgot.successMessage')}
        </div>
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onBack}
            className="font-semibold text-pink-600 dark:text-pink-300 hover:text-pink-700 dark:hover:text-pink-200 transition-colors"
          >
            {t('login.forgot.backToLogin')}
          </button>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setEmail('');
            }}
            className="text-textPrimary/50 dark:text-white/50 hover:text-textPrimary dark:hover:text-white transition-colors text-sm"
          >
            {t('login.forgot.tryAnother')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div>
        <label
          htmlFor="forgot-email"
          className="block text-sm font-medium text-textPrimary/80 dark:text-white/80 mb-1"
        >
          {t('login.forgot.emailLabel')}
        </label>
        <input
          id="forgot-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border dark:border-white/20 bg-surface/5 dark:bg-white/10 text-textPrimary dark:text-white placeholder:text-textPrimary/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-secondary"
          placeholder={t('login.forgot.emailPlaceholder')}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-secondary hover:bg-secondary/90 text-white font-bold text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-60"
      >
        {loading ? t('login.forgot.sendingButton') : t('login.forgot.sendButton')}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full py-2.5 rounded-lg border border-border/30 dark:border-white/30 text-textPrimary/70 dark:text-white/70 text-xs font-semibold tracking-widest hover:bg-textPrimary/5 dark:hover:bg-white/10"
      >
        {t('login.forgot.backToLogin')}
      </button>
    </form>
  );
};

export default ForgotPasswordForm;
