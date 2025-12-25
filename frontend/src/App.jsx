import React, { useState } from 'react';
import { firebaseConfig } from './config/firebase';
// --- 1. FIREBASE SETUP ---
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- 2. LOGIN COMPONENT ---
function LoginComponent({ onSwitchToSignup, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log("Attempting login with Firebase...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      
      console.log("Login successful!", user.email);
      setSuccess("Login successful! Redirecting...");
      setEmail("");
      setPassword("");
      
      onLoginSuccess(token, user);
      
    } catch (error) {
      console.error("Login error:", error.code, error.message);
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        setError("Invalid email or password.");
      } else if (error.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log("Attempting Google Sign In...");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();
      
      console.log("Google Sign In successful!", user.email);
      setSuccess("Google Sign In successful! Redirecting...");
      
      onLoginSuccess(token, user);
      
    } catch (error) {
      console.error("Google Sign In error:", error.code, error.message);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Sign In was cancelled.");
      } else {
        setError("Google Sign In failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="your@email.com"
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="Enter your password"
          />
        </div>
        
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div style={styles.divider}>or</div>

      <button 
        type="button" 
        onClick={handleGoogleSignIn} 
        disabled={isLoading} 
        style={styles.googleButton}
      >
        🔐 Sign In with Google
      </button>

      <p style={styles.switchAuth}>
        Don't have an account?{' '}
        <button 
          type="button" 
          onClick={onSwitchToSignup} 
          style={styles.linkButton}
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}

// --- 3. SIGN UP COMPONENT ---
function SignUpComponent({ onSwitchToLogin, onSignUpSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log("Creating account with Firebase...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      
      console.log("Account created successfully!", user.email);
      setSuccess("Account created! Logging you in...");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      
      onSignUpSuccess(token, user);
      
    } catch (error) {
      console.error("Sign Up error:", error.code, error.message);
      
      if (error.code === 'auth/email-already-in-use') {
        setError("This email is already registered.");
      } else if (error.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (error.code === 'auth/weak-password') {
        setError("Password is too weak. Use a stronger password.");
      } else {
        setError("Sign Up failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log("Attempting Google Sign Up...");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();
      
      console.log("Google Sign Up successful!", user.email);
      setSuccess("Account created with Google! Redirecting...");
      
      onSignUpSuccess(token, user);
      
    } catch (error) {
      console.error("Google Sign Up error:", error.code, error.message);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Sign Up was cancelled.");
      } else {
        setError("Google Sign Up failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="signup-email">Email</label>
          <input
            type="email"
            id="signup-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="your@email.com"
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label htmlFor="signup-password">Password</label>
          <input
            type="password"
            id="signup-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="At least 6 characters"
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="Re-enter your password"
          />
        </div>
        
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div style={styles.divider}>or</div>

      <button 
        type="button" 
        onClick={handleGoogleSignUp} 
        disabled={isLoading} 
        style={styles.googleButton}
      >
        🔐 Sign Up with Google
      </button>

      <p style={styles.switchAuth}>
        Already have an account?{' '}
        <button 
          type="button" 
          onClick={onSwitchToLogin} 
          style={styles.linkButton}
        >
          Log In
        </button>
      </p>
    </div>
  );
}

// --- 4. MAIN APP COMPONENT ---
export default function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login' or 'signup'
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const handleLoginSuccess = (idToken, userData) => {
    setToken(idToken);
    setUser(userData);
    console.log("User authenticated:", userData.email);
    console.log("Token:", idToken);
  };

  const handleSignUpSuccess = (idToken, userData) => {
    setToken(idToken);
    setUser(userData);
    console.log("User created and authenticated:", userData.email);
    console.log("Token:", idToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setCurrentPage('login');
  };

  // If user is logged in, show a success page
  if (user) {
    return (
      <div style={styles.appContainer}>
        <div style={styles.successContainer}>
          <h1>✅ Welcome!</h1>
          <p>Successfully logged in as:</p>
          <p style={styles.userEmail}>{user.email}</p>
          
          <div style={styles.tokenInfo}>
            <h3>Your Auth Token (first 30 chars):</h3>
            <p style={styles.tokenText}>{token.substring(0, 30)}...</p>
            <p style={styles.tokenNote}>Use this token to authenticate with your backend API</p>
          </div>

          <button onClick={handleLogout} style={styles.logoutButton}>
            Log Out
          </button>
        </div>
      </div>
    );
  }

  // Otherwise show login or signup
  return (
    <div style={styles.appContainer}>
      {currentPage === 'login' ? (
        <LoginComponent 
          onSwitchToSignup={() => setCurrentPage('signup')}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <SignUpComponent 
          onSwitchToLogin={() => setCurrentPage('login')}
          onSignUpSuccess={handleSignUpSuccess}
        />
      )}
    </div>
  );
}

// --- 5. STYLES ---
const styles = {
  appContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f7f6',
    padding: '20px'
  },
  container: {
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  successContainer: {
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '450px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif'
  },
  button: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  googleButton: {
    padding: '12px',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.3s'
  },
  error: {
    color: '#dc3545',
    fontSize: '14px',
    textAlign: 'center',
    margin: '0',
    padding: '10px',
    backgroundColor: '#f8d7da',
    borderRadius: '4px',
    border: '1px solid #f5c6cb'
  },
  success: {
    color: '#155724',
    fontSize: '14px',
    textAlign: 'center',
    margin: '0',
    padding: '10px',
    backgroundColor: '#d4edda',
    borderRadius: '4px',
    border: '1px solid #c3e6cb'
  },
  divider: {
    textAlign: 'center',
    margin: '20px 0',
    color: '#999',
    fontSize: '14px'
  },
  switchAuth: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px'
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  userEmail: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#007bff',
    margin: '10px 0'
  },
  tokenInfo: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '4px',
    margin: '20px 0',
    textAlign: 'left'
  },
  tokenText: {
    backgroundColor: '#e9ecef',
    padding: '10px',
    borderRadius: '4px',
    wordBreak: 'break-all',
    fontSize: '12px',
    fontFamily: 'monospace'
  },
  tokenNote: {
    fontSize: '12px',
    color: '#666',
    margin: '10px 0 0 0'
  },
  logoutButton: {
    padding: '12px 30px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  }
};