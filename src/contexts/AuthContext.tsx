import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { authAPI, userAPI } from '../lib/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
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

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get ID token and sync with backend
          const idToken = await firebaseUser.getIdToken();
          const data = await authAPI.syncUser(idToken);
          setUser(data.user);
          setNeedsProfileCompletion(!data.user.fullName || !data.user.interests || data.user.interests.length === 0);
        } catch (error) {
          console.error('Failed to sync user with backend:', error);
          setUser(null);
        }
      } else {
        // Check for guest mode
        const guestData = localStorage.getItem('guestUser');
        if (guestData) {
          try {
            setUser(JSON.parse(guestData));
          } catch (error) {
            console.error('Failed to load guest user:', error);
            localStorage.removeItem('guestUser');
          }
        } else {
          setUser(null);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    try {
      if (user?.id.startsWith('guest-')) {
        // Guest user - refresh from localStorage
        const guestData = localStorage.getItem('guestUser');
        if (guestData) {
          setUser(JSON.parse(guestData));
        }
      } else if (firebaseUser) {
        // Real user - refresh from backend
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
      // Clear any guest data
      localStorage.removeItem('guestUser');
      
      // Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Sync with backend
      const data = await authAPI.syncUser(idToken);
      setUser(data.user);
      setFirebaseUser(result.user);
      setNeedsProfileCompletion(!data.user.fullName || !data.user.interests || data.user.interests.length === 0);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async () => {
    try {
      setLoading(true);
      
      // Create guest user
      const guestUser: User = {
        id: `guest-${Date.now()}`,
        firebaseUid: 'guest',
        email: 'guest@eventhall.local',
        fullName: 'Guest User',
        role: 'GUEST',
        collegeName: null,
        isStudent: null,
        interests: [],
      } as User;
      
      // Store in localStorage
      localStorage.setItem('guestUser', JSON.stringify(guestUser));
      setUser(guestUser);
      setNeedsProfileCompletion(false);
    } catch (error) {
      console.error('Guest sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clear guest data
      localStorage.removeItem('guestUser');
      
      // Sign out from Firebase if logged in
      if (firebaseUser) {
        await firebaseSignOut(auth);
      }
      
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
        signInAsGuest,
        signOut,
        refreshUser,
        needsProfileCompletion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
