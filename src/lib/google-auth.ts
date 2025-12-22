// API for Google sign-in user creation
import { API_BASE_URL } from './api-client';

export const createUserWithGoogle = async ({ username, password, googleUser }) => {
  const response = await fetch(`${API_BASE_URL}/auth/google-signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
      googleId: googleUser.uid,
      email: googleUser.email,
      displayName: googleUser.displayName,
      photoURL: googleUser.photoURL,
    }),
  });
  if (!response.ok) throw new Error('Failed to create user with Google');
  return response.json();
};
