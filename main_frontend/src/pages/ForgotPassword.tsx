import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        // For security we still show the same friendly success message.
        // We only log the problem in the console.
        console.error('Password reset request failed with status', res.status);
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Password reset request failed:', err);
      // Keep generic message for the user.
      setSubmitted(true);
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
              Reset password
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Get a new access link
            </h1>
            <p className="text-sm text-gray-600">
              Enter the email that you use for MyR. If it is in our records we will send a link to create a new password.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-800">
                We sent an email with instructions if the address is registered. Check your inbox and spam folder.
              </div>
              <div className="flex items-center justify-between text-sm">
                <Link
                  to="/login"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Return to sign in
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Use another email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="you@example.com"
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
                {loading ? 'Sending email...' : 'Send reset link'}
              </button>

              <div className="mt-4 text-sm text-gray-500 text-center">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

