import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/auth';

const PENDING_OTP_KEY = 'pending_email_otp_user_id';
const PENDING_2FA_EMAIL_KEY = 'pending_2fa_email';

const TwoFactorChallenge = () => {
  const [code, setCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailOtpSending, setEmailOtpSending] = useState(false);
  const { verify2FALogin, checkSession } = useAuth();
  const navigate = useNavigate();

  // Note: During 2FA challenge, user may not be fully authenticated yet
  // Better Auth maintains a temporary session for 2FA verification
  // So we don't redirect if user is null - the backend will handle the session

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // verify2FALogin sets user state via flushSync — navigate is safe immediately after.
      await verify2FALogin(code, trustDevice);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleUseEmailCode = async () => {
    const email = sessionStorage.getItem(PENDING_2FA_EMAIL_KEY);
    if (!email) {
      setError('Email not found. Please go back and sign in again.');
      return;
    }
    setError('');
    setEmailOtpSending(true);
    try {
      const res = await fetch('/api/auth/request-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      let data: { error?: string; userId?: string } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) {
        setError(data?.error || 'Could not send email code. Use authenticator or backup code.');
        return;
      }
      if (data?.userId) {
        sessionStorage.setItem(PENDING_OTP_KEY, data.userId);
        sessionStorage.removeItem(PENDING_2FA_EMAIL_KEY);
        navigate('/auth/email-otp');
      }
    } catch {
      setError('Could not send email code. Try again or use authenticator.');
    } finally {
      setEmailOtpSending(false);
    }
  };

  const handleVerifyBackupCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/two-factor/verify-backup-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          code: backupCode,
          trustDevice 
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Invalid backup code');
      }

      // checkSession(true) uses flushSync so user state is committed before navigate().
      await checkSession(true);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid backup code');
      setBackupCode('');
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Two factor authentication</h1>
            <p className="text-sm text-purple-100/80 max-w-sm mx-auto">
              {showBackupCode
                ? 'Enter one of your backup codes'
                : 'Enter the six digit code from your authenticator application'}
            </p>
          </div>

          {!showBackupCode ? (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-purple-100 mb-1">
                  Verification code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  autoFocus
                  className="w-full px-3 py-2 border border-white/15 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-center text-2xl tracking-[0.5em] text-purple-50 placeholder:text-purple-200/70"
                  placeholder="000000"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="trustDevice"
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                  className="h-4 w-4 rounded border-purple-200 text-pink-400 focus:ring-pink-400 bg-purple-950/60"
                />
                <label htmlFor="trustDevice" className="ml-2 block text-sm text-purple-100">
                  Trust this device for thirty days
                </label>
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

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setShowBackupCode(true)}
                  className="block w-full text-sm text-pink-300 hover:text-pink-200"
                >
                  Use a backup code instead
                </button>
                <button
                  type="button"
                  onClick={handleUseEmailCode}
                  disabled={emailOtpSending}
                  className="block w-full text-sm text-pink-300 hover:text-pink-200 disabled:opacity-60"
                >
                  {emailOtpSending ? 'Sending...' : 'Send code to my email instead'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyBackupCode} className="space-y-5">
              <div>
                <label htmlFor="backupCode" className="block text-sm font-medium text-purple-100 mb-1">
                  Backup code
                </label>
                <input
                  id="backupCode"
                  type="text"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 border border-white/15 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-center font-mono text-purple-50 placeholder:text-purple-200/70"
                  placeholder="Enter backup code"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="trustDeviceBackup"
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                  className="h-4 w-4 rounded border-purple-200 text-pink-400 focus:ring-pink-400 bg-purple-950/60"
                />
                <label htmlFor="trustDeviceBackup" className="ml-2 block text-sm text-purple-100">
                  Trust this device for thirty days
                </label>
              </div>

              {error && (
                <div className="bg-red-900/40 border border-red-500/60 text-red-100 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !backupCode}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2.5 px-4 rounded-xl text-sm font-semibold shadow-[0_14px_40px_rgba(0,0,0,0.55)] hover:from-pink-400 hover:to-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify backup code'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowBackupCode(false);
                    setBackupCode('');
                    setError('');
                  }}
                  className="text-sm text-pink-300 hover:text-pink-200"
                >
                  Use authenticator code instead
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                sessionStorage.removeItem(PENDING_2FA_EMAIL_KEY);
                navigate('/login');
              }}
              className="text-sm text-purple-200/80 hover:text-white transition-colors"
            >
              Back to login
            </button>
          </div>
        </div>

        <div className="bg-[#120820] px-6 py-3 border-t border-white/10 text-center text-xs text-purple-200/80">
          <p>This step will timeout after five minutes for security.</p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorChallenge;
