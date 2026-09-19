import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-box">
            <svg width="22" height="16" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 0H3C1.34 0 0.01 1.34 0.01 3L0 7C1.1 7 2 7.9 2 9C2 10.1 1.1 11 0 11L0.01 15C0.01 16.66 1.34 18 3 18H25C26.66 18 28 16.66 28 15V11C26.9 11 26 10.1 26 9C26 7.9 26.9 7 28 7V3C28 1.34 26.66 0 25 0ZM25 7.79C23.25 8.35 22 10.02 22 12C22 13.98 23.25 15.65 25 16.21V16H3V16.21C4.75 15.65 6 13.98 6 12C6 10.02 4.75 8.35 3 7.79V4H25V7.79Z" fill="#D97706"/>
            </svg>
          </div>
          <h1 className="login-title">TokTickIT</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {error && (
          <div className="login-error-alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label className="login-label">
              Email
              <span className="required-star">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <div className="login-form-group">
            <label className="login-label">
              Password
              <span className="required-star">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input password-input"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-submit-btn"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

