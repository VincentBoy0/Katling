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
import { User } from "@/types/user";

export type Role = "user" | "admin" | "moderator";

// Extended User for UI state with optional Firebase fields
export interface AuthUser extends User {
  displayName?: string;
  authProvider?: "email" | "google" | "facebook";
}

interface AuthContextType {
  user: AuthUser | null;
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  loginWithOAuth: (provider: "google" | "facebook") => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const role: Role = "user"; // TODO: Get from backend

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Update email verification status
        setIsEmailVerified(firebaseUser.emailVerified);

        // Check if we have user info in localStorage
        const savedUser = localStorage.getItem("katling_user");
        const savedToken = localStorage.getItem("firebase_token");

        if (savedUser && savedToken) {
          // We have saved data, restore it
          try {
            setUser(JSON.parse(savedUser));
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
        setIsEmailVerified(false);
        localStorage.removeItem("katling_user");
        localStorage.removeItem("firebase_token");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Restore user session from backend when Firebase is authenticated but local data is missing
   */
  const restoreUserSession = async (firebaseUser: FirebaseUser) => {
    try {
      const firebaseToken = await firebaseUser.getIdToken();
      const backendData = await loginWithBackend(firebaseToken);

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
    } catch (error) {
      console.error("Failed to restore user session:", error);
      // If backend fails, sign out from Firebase
      await firebaseSignOut(auth);
      setUser(null);
      localStorage.removeItem("katling_user");
      localStorage.removeItem("firebase_token");
    }
  };

  /**
   * Login with Email & Password
   * Flow: Firebase Auth → Get Token → Backend Verification → Save User
   */
  const login = async (email: string, password: string) => {
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

    // Step 4: Enrich user data with Firebase info
    const enrichedUser: AuthUser = {
      ...backendData.user,
      displayName:
        firebaseUser.displayName ||
        backendData.user.email?.split("@")[0] ||
        "User",
      authProvider: "email",
    };

    // Step 5: Save to localStorage & state
    localStorage.setItem("firebase_token", firebaseToken);
    localStorage.setItem("katling_user", JSON.stringify(enrichedUser));
    setUser(enrichedUser);
  };

  /**
   * Signup with Email & Password
   * Flow: Create Firebase User → Update Profile → Backend Registration → Save User
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
   * Flow: Firebase OAuth Popup → Get Token → Backend Verification → Save User
   */
  const loginWithOAuth = async (provider: "google" | "facebook") => {
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

    // Step 5: Enrich user data with Firebase info
    const enrichedUser: AuthUser = {
      ...backendData.user,
      displayName:
        firebaseUser.displayName ||
        backendData.user.email?.split("@")[0] ||
        "User",
      authProvider: provider,
    };

    // Step 6: Save to localStorage & state
    localStorage.setItem("firebase_token", firebaseToken);
    localStorage.setItem("katling_user", JSON.stringify(enrichedUser));
    setUser(enrichedUser);
  };

  /**
   * Logout
   * Clear Firebase session & local data
   */
  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    localStorage.removeItem("katling_user");
    localStorage.removeItem("firebase_token");
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
        role,
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
