import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as loginApi, getUser as getUserFromBackend } from '../lib/api-client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  needsProfileCompletion: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  // Load user from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      try {
        const parsed: User = JSON.parse(stored);
        setUser(parsed);
        setNeedsProfileCompletion(!parsed.fullName || !parsed.interests || parsed.interests.length === 0);
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('authUser');
      }
    }
    setLoading(false);
  }, []);

  const persistUser = (userData: User) => {
    setUser(userData);
    setNeedsProfileCompletion(!userData.fullName || !userData.interests || userData.interests.length === 0);
    localStorage.setItem('authUser', JSON.stringify(userData));
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const { user: loggedInUser } = await loginApi(username, password);
      persistUser(loggedInUser);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const userData = await getUserFromBackend(user.id);
      if (userData) {
        persistUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const signOut = async () => {
    setUser(null);
    setNeedsProfileCompletion(false);
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signOut,
        refreshUser,
        needsProfileCompletion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
