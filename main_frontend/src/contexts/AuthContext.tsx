import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authClient } from '../lib/authClient';

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  twoFactorEnabled?: boolean;
}

interface TwoFactorSetupData {
  totpURI: string;
  backupCodes: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  enable2FA: (password: string) => Promise<TwoFactorSetupData>;
  verify2FASetup: (code: string) => Promise<void>;
  disable2FA: (password: string) => Promise<void>;
  verify2FALogin: (code: string, trustDevice?: boolean) => Promise<void>;
  getTotpUri: (password: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/get-session', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch('/api/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password }),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    if (data.user) {
      setUser(data.user);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/sign-in/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    if (data.user) {
      setUser(data.user);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/sign-out', {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
  };

  const enable2FA = async (password: string): Promise<TwoFactorSetupData> => {
    const response = await authClient.twoFactor.enable({
      password
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to enable 2FA');
    }

    if (!response.data) {
      throw new Error('No data returned from enable 2FA');
    }

    return {
      totpURI: response.data.totpURI,
      backupCodes: response.data.backupCodes
    };
  };

  const verify2FASetup = async (code: string): Promise<void> => {
    const response = await authClient.twoFactor.verifyTotp({
      code
    });

    if (response.error) {
      throw new Error(response.error.message || 'Invalid verification code');
    }

    await checkSession();
  };

  const disable2FA = async (password: string): Promise<void> => {
    const response = await authClient.twoFactor.disable({
      password
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to disable 2FA');
    }

    await checkSession();
  };

  const verify2FALogin = async (code: string, trustDevice = false): Promise<void> => {
    const response = await authClient.twoFactor.verifyTotp({
      code,
      trustDevice
    });

    if (response.error) {
      throw new Error(response.error.message || 'Invalid verification code');
    }

    // If verifyTotp returns a user, set it directly (Better Auth should have set the session cookie)
    if (response.data?.user) {
      setUser(response.data.user);
    } else {
      await checkSession();
    }
  };

  const getTotpUri = async (password: string): Promise<string> => {
    const response = await authClient.twoFactor.getTotpUri({
      password
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to get TOTP URI');
    }

    if (!response.data?.totpURI) {
      throw new Error('No TOTP URI returned');
    }

    return response.data.totpURI;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      checkSession,
      enable2FA,
      verify2FASetup,
      disable2FA,
      verify2FALogin,
      getTotpUri
    }}>
      {children}
    </AuthContext.Provider>
  );
};
