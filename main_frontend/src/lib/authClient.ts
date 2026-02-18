import { createAuthClient } from 'better-auth/client';
import { twoFactorClient } from 'better-auth/client/plugins';

/**
 * Better Auth client configured with Two-Factor Authentication plugin.
 * The redirect to 2FA challenge is handled in LoginForm component.
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? `${window.location.origin}/api/auth` : '/api/auth',
  plugins: [
    twoFactorClient()
  ]
});
