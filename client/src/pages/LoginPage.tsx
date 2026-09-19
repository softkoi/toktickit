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
    <div
      className="login-page-container"
      style={{
        minHeight: '100vh',
        backgroundColor: '#F4F5F7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Inter', 'Prompt', system-ui, -apple-system, sans-serif",
        boxSizing: 'border-box'
      }}
    >
      <div
        className="login-card"
        style={{
          width: '100%',
          maxWidth: '375px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          padding: '36px 32px 32px',
          boxSizing: 'border-box'
        }}
      >
        <div className="login-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            className="login-icon-box"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '24px',
              backgroundColor: '#FEF08A',
              borderRadius: '4px',
              marginBottom: '12px'
            }}
          >
            <svg width="22" height="16" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 0H3C1.34 0 0.01 1.34 0.01 3L0 7C1.1 7 2 7.9 2 9C2 10.1 1.1 11 0 11L0.01 15C0.01 16.66 1.34 18 3 18H25C26.66 18 28 16.66 28 15V11C26.9 11 26 10.1 26 9C26 7.9 26.9 7 28 7V3C28 1.34 26.66 0 25 0ZM25 7.79C23.25 8.35 22 10.02 22 12C22 13.98 23.25 15.65 25 16.21V16H3V16.21C4.75 15.65 6 13.98 6 12C6 10.02 4.75 8.35 3 7.79V4H25V7.79Z" fill="#D97706"/>
            </svg>
          </div>
          <h1
            className="login-title"
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#111827',
              margin: '0 0 4px 0',
              letterSpacing: '-0.01em'
            }}
          >
            TokTickIT
          </h1>
          <p className="login-subtitle" style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <div
            className="login-error-alert"
            style={{
              backgroundColor: '#FEF2F2',
              borderLeft: '4px solid #EF4444',
              color: '#991B1B',
              padding: '10px 14px',
              fontSize: '13px',
              borderRadius: '6px',
              marginBottom: '20px'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="login-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label
              className="login-label"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#374151',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
            >
              Email
              <span className="required-star" style={{ color: '#EF4444', fontSize: '12px', lineHeight: '1.2', marginTop: '2px' }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              style={{
                width: '100%',
                height: '38px',
                padding: '0 12px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#111827',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div className="login-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label
              className="login-label"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#374151',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
            >
              Password
              <span className="required-star" style={{ color: '#EF4444', fontSize: '12px', lineHeight: '1.2', marginTop: '2px' }}>*</span>
            </label>
            <div className="password-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input password-input"
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 56px 0 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#111827',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#006B3C',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '2px 4px'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-submit-btn"
            style={{
              width: '100%',
              height: '40px',
              backgroundColor: '#006B3C',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '8px',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};


