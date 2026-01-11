import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/config/firebase";
import { loginWithBackend } from "@/services/authService";
import { userService } from "@/services/userService";
import { User, RoleType } from "@/types/user";

// Extended User for UI state with optional Firebase fields
export interface AuthUser extends User {
  displayName?: string;
  authProvider?: "email" | "google" | "facebook";
}

// Portal types for login navigation
export type LoginPortal = "admin" | "moderator" | "learner";

// Custom error for banned users
export class BannedUserError extends Error {
  constructor(message: string = "Tài khoản của bạn đã bị khóa.") {
    super(message);
    this.name = "BannedUserError";
  }
}

// Custom error for permission denied
export class PermissionDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionDeniedError";
  }
}

interface AuthContextType {
  user: AuthUser | null;
  roles: RoleType[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
  login: (email: string, password: string, portal?: LoginPortal) => Promise<void>;
  signup: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  loginWithOAuth: (provider: "google" | "facebook", portal?: LoginPortal) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  /**
   * Fetch user roles from backend
   */
  const fetchUserRoles = async (): Promise<RoleType[]> => {
    try {
      const response = await userService.getRoles();
      const roleObjects = response.data;

      if (!Array.isArray(roleObjects) || roleObjects.length === 0) {
        console.warn("No roles returned from backend, defaulting to LEARNER");
        setRoles([RoleType.LEARNER]);
        localStorage.setItem(
          "katling_roles",
          JSON.stringify([RoleType.LEARNER])
        );
        return [RoleType.LEARNER];
      }

      const userRoles = roleObjects.map((role) => role.type as RoleType);

      setRoles(userRoles);
      localStorage.setItem("katling_roles", JSON.stringify(userRoles));
      return userRoles;
    } catch (error: any) {
      console.error("Failed to fetch user roles:", error);

      setRoles([RoleType.LEARNER]); // Default to learner
      localStorage.setItem("katling_roles", JSON.stringify([RoleType.LEARNER]));
      return [RoleType.LEARNER];
    }
  };

  /**
   * Navigate user based on the portal they logged in from
   * Only navigates if user has the required role for that portal
   */
  const navigateByPortal = (userRoles: RoleType[], portal?: LoginPortal) => {
    if (portal === "admin") {
      if (userRoles.includes(RoleType.ADMIN)) {
        window.location.href = "/admin";
      } else {
        // User doesn't have admin role
        throw new PermissionDeniedError(
          "Bạn không có quyền truy cập trang Admin. Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập."
        );
      }
    } else if (portal === "moderator") {
      if (userRoles.includes(RoleType.MODERATOR)) {
        window.location.href = "/moderator";
      } else {
        throw new PermissionDeniedError(
          "Bạn không có quyền truy cập trang Moderator. Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập."
        );
      }
    } else {
      // Default learner portal - anyone can access dashboard
      window.location.href = "/dashboard";
    }
  };

  /**
   * Check if user is banned and throw error if so
   */
  const checkBannedStatus = (userData: User) => {
    if (userData.is_banned) {
      throw new BannedUserError();
    }
  };

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Update email verification status
        setIsEmailVerified(firebaseUser.emailVerified);

        // Check if we have user info in localStorage
        const savedUser = localStorage.getItem("katling_user");
        const savedToken = localStorage.getItem("firebase_token");
        const savedRoles = localStorage.getItem("katling_roles");

        if (savedUser && savedToken) {
          // We have saved data, restore it
          try {
            const parsedUser = JSON.parse(savedUser) as AuthUser;
            
            // Check if user is banned
            if (parsedUser.is_banned) {
              // User is banned, logout
              await firebaseSignOut(auth);
              setUser(null);
              setRoles([]);
              localStorage.removeItem("katling_user");
              localStorage.removeItem("firebase_token");
              localStorage.removeItem("katling_roles");
              setIsLoading(false);
              return;
            }
            
            setUser(parsedUser);

            // Restore roles from localStorage
            if (savedRoles) {
              const parsedRoles = JSON.parse(savedRoles) as RoleType[];
              setRoles(parsedRoles);
            } else {
              // No saved roles, fetch from backend
              await fetchUserRoles();
            }

            // CRITICAL: Get a fresh token to replace the potentially expired one
            try {
              const freshToken = await firebaseUser.getIdToken(true);
              localStorage.setItem("firebase_token", freshToken);
            } catch (tokenError) {
              console.error("Failed to refresh token:", tokenError);
              // If token refresh fails, re-authenticate
              await restoreUserSession(firebaseUser);
            }
          } catch (error) {
            console.error("Failed to parse saved user:", error);
            // If parse fails, re-fetch from backend
            await restoreUserSession(firebaseUser);
          }
        } else {
          // Firebase session exists but no local data - restore from backend
          await restoreUserSession(firebaseUser);
        }
      } else {
        setUser(null);
        setRoles([]);
        setIsEmailVerified(false);
        localStorage.removeItem("katling_user");
        localStorage.removeItem("firebase_token");
        localStorage.removeItem("katling_roles");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Periodically refresh Firebase token (every 50 minutes)
  // Firebase tokens expire after 1 hour, so we refresh proactively
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const freshToken = await currentUser.getIdToken(true);
          localStorage.setItem("firebase_token", freshToken);
          console.log("Token refreshed successfully");
        } catch (error) {
          console.error("Periodic token refresh failed:", error);
        }
      }
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  /**
   * Restore user session from backend when Firebase is authenticated but local data is missing
   */
  const restoreUserSession = async (firebaseUser: FirebaseUser) => {
    try {
      // Always get a fresh token (force refresh if needed)
      const firebaseToken = await firebaseUser.getIdToken(true);
      const backendData = await loginWithBackend(firebaseToken);

      // Check if user is banned
      if (backendData.user.is_banned) {
        console.warn("User is banned, logging out");
        await firebaseSignOut(auth);
        setUser(null);
        setRoles([]);
        localStorage.removeItem("katling_user");
        localStorage.removeItem("firebase_token");
        localStorage.removeItem("katling_roles");
        return;
      }

      const enrichedUser: AuthUser = {
        ...backendData.user,
        displayName:
          firebaseUser.displayName ||
          backendData.user.email?.split("@")[0] ||
          "User",
        authProvider: firebaseUser.providerData[0]?.providerId.includes(
          "google"
        )
          ? "google"
          : firebaseUser.providerData[0]?.providerId.includes("facebook")
          ? "facebook"
          : "email",
      };

      localStorage.setItem("firebase_token", firebaseToken);
      localStorage.setItem("katling_user", JSON.stringify(enrichedUser));
      setUser(enrichedUser);

      // Fetch user roles
      await fetchUserRoles();
    } catch (error) {
      console.error("Failed to restore user session:", error);
      await firebaseSignOut(auth);
      setUser(null);
      localStorage.removeItem("katling_user");
      localStorage.removeItem("firebase_token");
    }
  };

  /**
   * Login with Email & Password
   * Flow: Firebase Auth → Get Token → Backend Verification → Check Banned → Save User
   */
  const login = async (email: string, password: string, portal?: LoginPortal) => {
    // Step 1: Firebase authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Step 2: Get Firebase ID token
    const firebaseToken = await firebaseUser.getIdToken();

    // Step 3: Verify with backend
    const backendData = await loginWithBackend(firebaseToken);

    // Step 4: Check if user is banned
    checkBannedStatus(backendData.user);

    // Step 5: Enrich user data with Firebase info
    const enrichedUser: AuthUser = {
      ...backendData.user,
      displayName:
        firebaseUser.displayName ||
        backendData.user.email?.split("@")[0] ||
        "User",
      authProvider: "email",
    };

    // Step 6: Save to localStorage & state
    localStorage.setItem("firebase_token", firebaseToken);
    localStorage.setItem("katling_user", JSON.stringify(enrichedUser));
    setUser(enrichedUser);

    // Step 7: Fetch roles and navigate based on portal
    const userRoles = await fetchUserRoles();
    navigateByPortal(userRoles, portal);
  };

  /**
   * Signup with Email & Password
   * Flow: Create Firebase User → Update Profile → Backend Registration → Save User
   * Note: Does NOT auto-navigate - caller should redirect to verify page
   */
  const signup = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    // Step 1: Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Step 2: Update Firebase profile
    await updateProfile(firebaseUser, { displayName });

    // Step 3: Send verification email
    await sendEmailVerification(firebaseUser);

    // Step 4: Get Firebase ID token
    const firebaseToken = await firebaseUser.getIdToken();

    // Step 5: Register with backend
    const backendData = await loginWithBackend(firebaseToken);

    // Step 6: Enrich user data with Firebase info
    const enrichedUser: AuthUser = {
      ...backendData.user,
      displayName:
        displayName || backendData.user.email?.split("@")[0] || "User",
      authProvider: "email",
    };

    // Step 7: Save to localStorage & state
    localStorage.setItem("firebase_token", firebaseToken);
    localStorage.setItem("katling_user", JSON.stringify(enrichedUser));
    setUser(enrichedUser);
    setIsEmailVerified(false);

    // Step 8: Fetch roles (but don't navigate - let caller handle redirect to verify page)
    await fetchUserRoles();
    // Navigation to /verify is handled by the signup form
  };

  /**
   * Resend verification email
   */
  const resendVerificationEmail = async () => {
    const currentUser = auth.currentUser;
    if (currentUser && !currentUser.emailVerified) {
      await sendEmailVerification(currentUser);
    }
  };

  /**
   * Login with OAuth (Google/Facebook)
   * Flow: Firebase OAuth Popup → Get Token → Backend Verification → Check Banned → Save User
   */
  const loginWithOAuth = async (provider: "google" | "facebook", portal?: LoginPortal) => {
    // Step 1: Get OAuth provider
    let authProvider;
    if (provider === "google") {
      authProvider = new GoogleAuthProvider();
      // Force account selection every time
      authProvider.setCustomParameters({ prompt: "select_account" });
    } else {
      authProvider = new FacebookAuthProvider();
    }

    // Step 2: Firebase OAuth popup
    const result = await signInWithPopup(auth, authProvider);
    const firebaseUser = result.user;

    // Step 3: Get Firebase ID token
    const firebaseToken = await firebaseUser.getIdToken();

    // Step 4: Verify with backend
    const backendData = await loginWithBackend(firebaseToken);

    // Step 5: Check if user is banned
    checkBannedStatus(backendData.user);

    // Step 6: Enrich user data with Firebase info
    const enrichedUser: AuthUser = {
      ...backendData.user,
      displayName:
        firebaseUser.displayName ||
        backendData.user.email?.split("@")[0] ||
        "User",
      authProvider: provider,
    };

    // Step 7: Save to localStorage & state
    localStorage.setItem("firebase_token", firebaseToken);
    localStorage.setItem("katling_user", JSON.stringify(enrichedUser));
    setUser(enrichedUser);

    // Step 8: Fetch roles and navigate based on portal
    const userRoles = await fetchUserRoles();
    navigateByPortal(userRoles, portal);
  };

  /**
   * Logout
   * Clear Firebase session & local data
   */
  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setRoles([]);
    localStorage.removeItem("katling_user");
    localStorage.removeItem("firebase_token");
    localStorage.removeItem("katling_roles");
  };

  /**
   * Update user data locally
   */
  const updateUser = (updates: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("katling_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        isAuthenticated: !!user,
        isLoading,
        isEmailVerified,
        login,
        signup,
        loginWithOAuth,
        logout,
        updateUser,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
