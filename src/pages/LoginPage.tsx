// Firebase imports
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../lib/api-client';

// Firebase config (read from Vite env vars - set these in .env or .env.local)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
const app = initializeApp(firebaseConfig);
try {
  // Analytics may fail in non-browser env or if measurement id is missing
  getAnalytics(app);
} catch (e) {
  // ignore analytics initialization errors
}
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const LoginPage: React.FC = () => {
  const { login, user, loading, needsProfileCompletion, setAuthUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');


  useEffect(() => {
    if (!loading && user) {
      // On normal login, go to profile or complete-profile if needed
      if (needsProfileCompletion) {
        navigate('/complete-profile');
      } else {
        navigate('/profile');
      }
    }
  }, [user, loading, navigate, needsProfileCompletion]);




  // Google Sign-In handler
const handleGoogleSignIn = async () => {
    try {
      // 1. Open Google Popup
      const result = await signInWithPopup(auth, provider);
      
      const googleUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      };

      console.log("Google Login Success! Navigating to profile...", googleUser);

      // Notify backend to upsert the Google user so subsequent API GETs don't 404
      try {
        const resp = await fetch(`${API_BASE_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(googleUser),
        });
        if (resp.ok) {
          const data = await resp.json().catch(() => ({}));
          if (data && data.user) {
            try { setAuthUser(data.user as any); } catch (_) { }
          }
        } else {
          const text = await resp.text().catch(() => '<no body>');
          console.warn('Backend upsert returned', resp.status, text);
        }
      } catch (err) {
        console.warn('Failed to upsert Google user on backend:', err);
      }

      navigate('/complete-profile', { state: { googleUser } });
      return; 

    } catch (error: any) {
      setError('Google sign-in failed.');
      console.error("Popup Error:", error);
    }
  };


  // Handle redirect result (when returning from Google sign-in)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result || !result.user) return;
        const googleUser = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        };

        try {
          const resp = await fetch(`${API_BASE_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(googleUser),
          });
          if (!resp.ok) {
            const text = await resp.text().catch(() => '<no body>');
            console.error('Server returned', resp.status, text);
            throw new Error(`Server returned ${resp.status}: ${text}`);
          }
          const data = await resp.json().catch(() => ({}));
          if (!mounted) return;
          // Persist returned user (if any) to auth context so ProtectedRoute works
          if (data && data.user) {
            try {
              setAuthUser(data.user as any);
            } catch (e) {
              console.warn('Failed to set auth user from backend response', e);
            }
          }
          navigate('/complete-profile', { state: { googleUser: data.user || googleUser } });
        } catch (err) {
          console.error('Failed to send Google user to backend', err);
          if (!mounted) return;
          // Persist a minimal user so protected routes allow navigation
          try {
            setAuthUser({
              id: googleUser.uid,
              email: googleUser.email || '',
              fullName: googleUser.displayName || '',
              photoUrl: googleUser.photoURL || undefined,
              role: 'GUEST' as const,
              isStudent: null,
              collegeName: null,
              interests: [],
            } as any);
          } catch (e) {
            console.warn('Failed to persist auth user after backend error', e);
          }
          navigate('/complete-profile', { state: { googleUser } });
        }
      } catch (err) {
        // getRedirectResult throws if there was no redirect result or on errors
        // Only surface unexpected errors
        if ((err as any)?.code) {
          console.warn('No redirect result or user cancelled:', err);
        } else {
          console.error('Error handling redirect result:', err);
        }
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError('');
  //   try {
  //     await login(username.trim(), password);
  //   } catch (err) {
  //     console.error('Login failed:', err);
  //     setError('Invalid credentials.');
  //   }
  // };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="mb-8 text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EVENT HALL</h1>
          <p className="text-gray-600">Login with the provided credentials</p>
        </div>

        <form className="space-y-4">
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="user | host (event host) | admin (admin/god)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="user123 | host123 | admin123"
              required
            />
          </div> */}

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full mt-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.13 2.36 30.45 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.2C12.36 13.13 17.73 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.98 37.13 46.1 31.36 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.29c-1.13-3.36-1.13-6.97 0-10.33l-7.98-6.2C.9 16.36 0 20.05 0 24c0 3.95.9 7.64 2.69 12.24l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.45 0 12.13-2.13 16.65-5.81l-7.19-5.59c-2.01 1.35-4.59 2.15-7.46 2.15-6.27 0-11.64-3.63-13.33-8.79l-7.98 6.2C6.73 42.2 14.82 48 24 48z"/></g></svg>
            Sign in with Google
          </button>
          {/* After Google sign-in, redirect to /complete-profile and ask for username/password. Store these data in your backend or Firebase as needed. */}
        </form>

        {/* <div className="mt-6 text-xs text-gray-500 space-y-1">
          <div>Normal user: user / user123</div>
          <div>Event host: host / host123</div>
          <div>Admin (god): admin / admin123</div>
        </div> */}
      </div>
    </div>
  );
};

