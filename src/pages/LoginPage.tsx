import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, signInAsGuest, user, loading, needsProfileCompletion } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (needsProfileCompletion && user.role !== 'GUEST') {
        navigate('/complete-profile');
      } else {
        navigate('/home');
      }
    }
  }, [user, loading, needsProfileCompletion, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
      alert('Sign in failed. Please try again.');
    }
  };

  const handleGuestSignIn = async () => {
    try {
      await signInAsGuest();
    } catch (error) {
      console.error('Guest sign in failed:', error);
      alert('Guest sign in failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Logo/Title */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EVENT HALL</h1>
          <p className="text-gray-600">Discover Campus Events</p>
        </div>

        {/* Features */}
        <div className="mb-8 space-y-3 text-left">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
            <p className="text-sm text-gray-700">Browse events from colleges across the region</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
            <p className="text-sm text-gray-700">Get personalized recommendations</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
            <p className="text-sm text-gray-700">Register for hackathons, workshops & more</p>
          </div>
        </div>

        {/* Sign In Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-3 border-2 border-gray-200 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <button
            onClick={handleGuestSignIn}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-3 transition-all"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Continue as Guest</span>
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Sign in with Google to save your preferences and register for events
        </p>
      </div>
    </div>
  );
};
