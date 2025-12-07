import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { userAPI } from '../lib/api';
import { User } from '../types';

// DEVELOPMENT MODE: Using mock auth instead of Firebase
const DEFAULT_EMAIL = 'muhammedshad9895@gmail.com';
const MOCK_TOKEN = 'mock-dev-token-for-testing';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  // Initialize with default user in development
  useEffect(() => {
    const initializeMockUser = async () => {
      try {
        // Create mock profile for development
        const mockUser: User = {
          id: 'mock-user-dev',
          firebaseUid: 'mock-firebase-uid',
          email: DEFAULT_EMAIL,
          fullName: 'Developer User',
          role: 'ULTIMATE_ADMIN',
          collegeName: 'Test College',
          isStudent: true,
          interests: [
            { id: '1', category: { id: 'cat1', name: 'Hackathon', slug: 'hackathon' } },
            { id: '2', category: { id: 'cat2', name: 'Workshop', slug: 'workshop' } },
            { id: '3', category: { id: 'cat3', name: 'Technical Talk', slug: 'technical-talk' } },
          ],
        };
        
        // Set token in localStorage for API requests
        localStorage.setItem('mockAuthToken', MOCK_TOKEN);
        
        setUser(mockUser);
        setNeedsProfileCompletion(false);
      } catch (error) {
        console.error('Failed to initialize mock user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeMockUser();
  }, []);

  const refreshUser = async () => {
    try {
      if (user) {
        // In mock mode, just refresh local state
        const data = await userAPI.getProfile();
        setUser(data.user);
        setNeedsProfileCompletion(!data.user.interests || data.user.interests.length === 0);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      // In mock mode, just set the user
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUser: User = {
        id: 'mock-user-dev',
        firebaseUid: 'mock-firebase-uid',
        email: DEFAULT_EMAIL,
        fullName: 'Developer User',
        role: 'ULTIMATE_ADMIN',
        collegeName: 'Test College',
        isStudent: true,
        interests: [
          { id: '1', category: { id: 'cat1', name: 'Hackathon', slug: 'hackathon' } },
          { id: '2', category: { id: 'cat2', name: 'Workshop', slug: 'workshop' } },
          { id: '3', category: { id: 'cat3', name: 'Technical Talk', slug: 'technical-talk' } },
        ],
      };
      setUser(mockUser);
      setNeedsProfileCompletion(false);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('mockAuthToken');
      setUser(null);
      setFirebaseUser(null);
      setNeedsProfileCompletion(false);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signInWithGoogle,
        signOut,
        refreshUser,
        needsProfileCompletion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
