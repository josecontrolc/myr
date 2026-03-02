import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/auth';

const PENDING_OTP_KEY = 'pending_email_otp_user_id';

const EmailOtpChallenge = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyEmailOtp, checkSession } = useAuth();
  const navigate = useNavigate();

  const userId = sessionStorage.getItem(PENDING_OTP_KEY);

  useEffect(() => {
    if (!userId) {
      // No pending OTP — nothing to verify, send back to login
      navigate('/login');
    }
  }, [userId, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setError('');
    setLoading(true);

    try {
      await verifyEmailOtp(userId, code);
      // checkSession(true) uses flushSync so user state is committed before navigate().
      await checkSession(true);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#160932] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.55)] border border-white/10 bg-white/5">
        <div className="bg-[#2a174f]/95 px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                R
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-purple-100 uppercase">
                  MyR
                </p>
                <p className="text-xs text-purple-200/80">Customer control panel</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-purple-200/70">
              Secure session
            </span>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-400/40 mb-4">
              <svg
                className="w-8 h-8 text-amber-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-sm text-purple-100/80 max-w-sm mx-auto">
              We sent a six digit verification code to your email address. It expires in ten minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-purple-100 mb-1">
                Verification code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                autoFocus
                className="w-full px-3 py-2 border border-white/15 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-center text-2xl tracking-[0.5em] text-purple-50 placeholder:text-purple-200/70"
                placeholder="000000"
              />
            </div>

            {error && (
              <div className="bg-red-900/40 border border-red-500/60 text-red-100 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2.5 px-4 rounded-xl text-sm font-semibold shadow-[0_14px_40px_rgba(0,0,0,0.55)] hover:from-pink-400 hover:to-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-purple-200/80 hover:text-white transition-colors"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailOtpChallenge;
