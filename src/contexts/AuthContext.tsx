import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as loginApi, getUser as getUserFromBackend, getUserByEmail as getUserByEmailFromBackend } from '../lib/api-client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setAuthUser: (user: User) => void;
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

  const computeNeedsProfile = (u: User | null) => {
    if (!u) return true;
    const role = String(u.role || '').toUpperCase();
    if (!u.fullName || String(u.fullName).trim() === '') return true;
    if (role === 'STUDENT') {
      return !u.interests || u.interests.length === 0;
    }
    // For HOST and PROFESSIONAL, do not require interests to be set
    return false;
  };

  // Load user from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      try {
        const parsed: User = JSON.parse(stored);
        setUser(parsed);
        setNeedsProfileCompletion(computeNeedsProfile(parsed));
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('authUser');
      }
    }
    setLoading(false);
  }, []);

  const persistUser = (userData: User) => {
    setUser(userData);
    setNeedsProfileCompletion(computeNeedsProfile(userData));
    localStorage.setItem('authUser', JSON.stringify(userData));
  };

  const setAuthUser = (userData: User) => {
    persistUser(userData);
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
      let userData = await getUserFromBackend(user.id);
      if (!userData && user.email) {
        userData = await getUserByEmailFromBackend(user.email);
      }
      if (userData) persistUser(userData);
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
        setAuthUser,
        needsProfileCompletion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
