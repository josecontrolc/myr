import { useState } from 'react';
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

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Two Factor Authentication</h1>
            <p className="text-gray-400">
              {showBackupCode 
                ? 'Enter one of your backup codes'
                : 'Enter the 6-digit code from your authenticator app'}
            </p>
          </div>

          {!showBackupCode ? (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="trustDevice"
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                />
                <label htmlFor="trustDevice" className="ml-2 block text-sm text-gray-300">
                  Trust this device for 30 days
                </label>
              </div>

              {error && (
                <div className="rounded-lg bg-red-900/50 border border-red-700 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setShowBackupCode(true)}
                  className="block w-full text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Use a backup code instead
                </button>
                <button
                  type="button"
                  onClick={handleUseEmailCode}
                  disabled={emailOtpSending}
                  className="block w-full text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                >
                  {emailOtpSending ? 'Sending...' : 'Send code to my email instead'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyBackupCode} className="space-y-4">
              <div>
                <label htmlFor="backupCode" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Backup Code
                </label>
                <input
                  id="backupCode"
                  type="text"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center font-mono"
                  placeholder="Enter backup code"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="trustDeviceBackup"
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                />
                <label htmlFor="trustDeviceBackup" className="ml-2 block text-sm text-gray-300">
                  Trust this device for 30 days
                </label>
              </div>

              {error && (
                <div className="rounded-lg bg-red-900/50 border border-red-700 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !backupCode}
                className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify Backup Code'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowBackupCode(false);
                    setBackupCode('');
                    setError('');
                  }}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
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
              className="text-sm text-gray-400 hover:text-gray-300"
            >
              Back to login
            </button>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>This page will timeout after 5 minutes for security.</p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorChallenge;
