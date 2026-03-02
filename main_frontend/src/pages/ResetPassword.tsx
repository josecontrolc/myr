import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Reset link is not valid or expired.');
      return;
    }

    if (password.length < 8) {
      setError('Password must have at least eight characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        setError('Reset link is not valid or has already been used.');
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Reset password failed:', err);
      setError('Something went wrong. Please request a new reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b1236] via-[#1a0f2f] to-[#120820] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white/95 rounded-3xl shadow-2xl px-8 py-10">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-wider text-purple-600 uppercase mb-2">
              Choose new password
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Secure your account
            </h1>
            <p className="text-sm text-gray-600">
              Pick a new password that you do not use on other services. This link works only once.
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-800">
                Your password has been updated. You can now sign in with your new credentials.
              </div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 px-4 rounded-xl text-sm font-semibold shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Go to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="At least eight characters"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Use a mix of letters, numbers, and symbols for better security.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Repeat the new password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 px-4 rounded-xl text-sm font-semibold shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating password...' : 'Update password'}
              </button>

              <div className="mt-4 text-sm text-gray-500 text-center">
                You can also{' '}
                <Link
                  to="/auth/forgot-password"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  request a new link
                </Link>
                .
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

