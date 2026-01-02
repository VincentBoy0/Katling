import { api } from "@/lib/api"
import { User } from "@/types/user"

/**
 * Backend Response Type
 */
export interface BackendAuthResponse {
  user: User;
  firebase: any; 
}

export const authService = {
  /**
   * Login with Backend API
   * @param firebaseToken - Firebase ID token
   * @returns { user, firebase } - Backend response
   */
  async login(firebaseToken: string): Promise<BackendAuthResponse> {
    const response = await api.post<BackendAuthResponse>(
      '/auth/login/',
      null,
      {
        params: { token: firebaseToken }
      }
    );
    return response.data;
  }
};

// Backward compatibility alias
export const loginWithBackend = authService.login;