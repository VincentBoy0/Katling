const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Backend Response Type
 */
export interface BackendAuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    avatar?: string;
    level: number;
    exp: number;
    streak: number;
    energy: number;
    maxEnergy: number;
    authProvider?: "email" | "google" | "facebook";
  };
  firebase: any; // Firebase decoded token data
}

/**
 * Login with Backend API
 * @param firebaseToken - Firebase ID token
 * @returns { user, firebase } - Backend response
 */
export const loginWithBackend = async (firebaseToken: string): Promise<BackendAuthResponse> => {
  const response = await fetch(`${API_URL}/auth/login/?token=${encodeURIComponent(firebaseToken)}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Backend login failed' }));
    throw new Error(errorData.message || 'Backend login failed');
  }

  return response.json(); // { user, firebase }
};