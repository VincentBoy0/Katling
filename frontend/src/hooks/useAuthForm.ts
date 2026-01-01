import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { getFirebaseErrorMessage, GENERIC_ERRORS } from '@/lib/auth-errors';

/**
 * Custom hook for SignIn form logic
 */
export function useSignInForm() {
  const navigate = useNavigate();
  const { login, loginWithOAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setError('');
    setLoading(true);
    
    try {
      await loginWithOAuth(provider);
      navigate('/dashboard');
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
    handleOAuthLogin,
  };
}

/**
 * Custom hook for SignUp form logic
 */
export function useSignUpForm() {
  const navigate = useNavigate();
  const { signup, loginWithOAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(GENERIC_ERRORS.PASSWORDS_DO_NOT_MATCH);
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, displayName);
      // Redirect to verify page with email in query params
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignup = async (provider: 'google' | 'facebook') => {
    setError('');
    setLoading(true);
    
    try {
      await loginWithOAuth(provider);
      navigate('/dashboard');
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    displayName,
    setDisplayName,
    error,
    loading,
    handleSubmit,
    handleOAuthSignup,
  };
}
