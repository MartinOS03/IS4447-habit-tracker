import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentSessionEmail, loginUser, logoutUser, registerUser } from '../services/auth';

type AuthContextValue = {
  isLoading: boolean;
  sessionEmail: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    const hydrateSession = async () => {
      const existingSession = await getCurrentSessionEmail();
      setSessionEmail(existingSession);
      setIsLoading(false);
    };
    void hydrateSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    await loginUser(email, password);
    setSessionEmail(email.trim().toLowerCase());
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    await registerUser(email, password, displayName);
    await loginUser(email, password);
    setSessionEmail(email.trim().toLowerCase());
  };

  const signOut = async () => {
    await logoutUser();
    setSessionEmail(null);
  };

  const value = useMemo(
    () => ({ isLoading, sessionEmail, signIn, signUp, signOut }),
    [isLoading, sessionEmail],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
