import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { supabase } from '../../lib/supabase';
import { AdminLoginForm } from './AdminLoginForm';
import './Login.css';
import { StyledForm, StyledFormWrapper, StyledWrapper } from './Login.styles';
import { useAuth } from './useAuth';

export const LoginPage = () => {
  const { user, isLoading: isCheckingSession } = useAuth();
  const [mode, setMode] = useState('signIn');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
  } = useForm({ mode: 'onChange' });

  if (isCheckingSession) return <div className="login-page p-4">Loading...</div>;
  if (user) return <Navigate to="/classes" replace />;

  const isSignUp = mode === 'signUp';

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setNotice('');
  };

  const onSubmit = async ({ email, password }) => {
    setError('');
    setNotice('');
    setIsSubmitting(true);
    const { error: authError } = isSignUp
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
      : await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);

    if (authError) {
      setError(authError.message);
    } else if (isSignUp) {
      // Supabase sends a confirmation link; the account can't sign in until it's confirmed
      setNotice('Check your email and click the confirmation link, then sign in.');
      setMode('signIn');
    }
  };

  return (
    <div className="login-page">
      <StyledWrapper>
        <StyledFormWrapper>
          <StyledForm onSubmit={handleSubmit(onSubmit)}>
            <div className="login-header">
              <h2 className="login-title">{isSignUp ? 'Create an admin account' : 'Welcome Back'}</h2>
              <p className="login-subtitle">
                {isSignUp ? 'Each admin manages their own classes' : 'Please sign in to continue'}
              </p>
            </div>

            <div className="login-toggle">
              <button
                type="button"
                className={`toggle-btn ${!isSignUp ? 'active' : ''}`}
                onClick={() => switchMode('signIn')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`toggle-btn ${isSignUp ? 'active' : ''}`}
                onClick={() => switchMode('signUp')}
                data-test-specifier="signUpToggle"
              >
                Create Account
              </button>
            </div>

            {error && <div className="error-message" role="alert">{error}</div>}
            {notice && <div className="alert alert-success" role="status">{notice}</div>}

            <div className="form-content">
              <AdminLoginForm control={control} errors={errors} trigger={trigger} isSignUp={isSignUp} />
              <Button
                disabled={!isValid || isSubmitting}
                type="submit"
                dataTestSpecifier="submitButton"
                className="btn-block mb-4 login-submit-btn"
                isLoading={isSubmitting}
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </div>
          </StyledForm>

          <div className="login-illustration">
            <img
              width={600}
              src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
              className="img-fluid"
              alt="Login Illustration"
            />
          </div>
        </StyledFormWrapper>
      </StyledWrapper>
    </div>
  );
};
