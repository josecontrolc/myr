import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/authClient';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { checkSession } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authClient.signIn.email(
        { email, password },
        {
          onSuccess(context) {
            // If 2FA is required, redirect to challenge page
            if (context.data?.twoFactorRedirect || context.data?.requiresTwoFactor) {
              navigate('/auth/2fa-challenge');
              return;
            }
            // Normal login success
            checkSession();
            if (onSuccess) {
              onSuccess();
            }
            setLoading(false);
          },
          onError(context) {
            // Check if error indicates 2FA is required
            const errorMessage = context.error?.message || '';
            if (errorMessage.includes('two-factor') || errorMessage.includes('2FA') || errorMessage.includes('TOTP')) {
              navigate('/auth/2fa-challenge');
              return;
            }
            setError(errorMessage || 'Login failed');
            setLoading(false);
          }
        }
      );

      // Check response after the callbacks
      // Better Auth may return twoFactorRedirect in different formats
      if (response.data?.twoFactorRedirect || response.data?.requiresTwoFactor) {
        navigate('/auth/2fa-challenge');
        setLoading(false);
        return;
      }

      // Check if response indicates 2FA is needed via error
      if (response.error) {
        const errorMessage = response.error.message || '';
        if (errorMessage.includes('two-factor') || errorMessage.includes('2FA') || errorMessage.includes('TOTP')) {
          navigate('/auth/2fa-challenge');
          setLoading(false);
          return;
        }
        setError(errorMessage || 'Login failed');
        setLoading(false);
        return;
      }

      // If we get here and there's no error, login was successful
      if (response.data && !response.error) {
        await checkSession();
        if (onSuccess) {
          onSuccess();
        }
        setLoading(false);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      // Check if error indicates 2FA is required
      if (errorMessage.includes('two-factor') || errorMessage.includes('2FA') || errorMessage.includes('TOTP')) {
        navigate('/auth/2fa-challenge');
      } else {
        setError(errorMessage);
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your password"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

export default LoginForm;
