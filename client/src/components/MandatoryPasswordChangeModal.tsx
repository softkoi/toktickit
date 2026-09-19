import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const MandatoryPasswordChangeModal: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!user || !user.mustChangePassword) return null;

  // Validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial && passwordsMatch && currentPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isFormValid) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'Password update failed');
      } else {
        setSuccess(true);
        setTimeout(() => {
          refreshUser();
        }, 1200);
      }
    } catch {
      setError('Network error updating password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-emerald-100 animate-fadeIn"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
          maxWidth: '440px',
          width: '100%',
          padding: '24px',
          border: '1px solid #D1E4D9',
          boxSizing: 'border-box'
        }}
      >
        <div className="flex items-center gap-3 mb-4 text-emerald-800" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div 
            className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-lg"
            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#EAF6EF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}
          >
            🔒
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800" style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Mandatory Password Change</h2>
            <p className="text-xs text-slate-500" style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Please set a new password before proceeding.</p>
          </div>
        </div>

        {error && (
          <div 
            className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded"
            style={{ backgroundColor: '#FEF2F2', borderLeft: '4px solid #EF4444', color: '#991B1B', padding: '12px', fontSize: '13px', borderRadius: '6px', marginBottom: '16px' }}
          >
            {error}
          </div>
        )}

        {success && (
          <div 
            className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm rounded"
            style={{ backgroundColor: '#EAF6EF', borderLeft: '4px solid #006B3C', color: '#004D2B', padding: '12px', fontSize: '13px', borderRadius: '6px', marginBottom: '16px' }}
          >
            Password updated successfully! Reloading...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
              placeholder="Enter current password (e.g. Password123!)"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
              placeholder="Re-enter new password"
              required
            />
          </div>

          <div 
            className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1"
            style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <p className="font-semibold text-slate-700 mb-1" style={{ fontWeight: 600, color: '#374151', margin: 0 }}>Password Requirements:</p>
            <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}`} style={{ color: hasMinLength ? '#006B3C' : '#6B7280' }}>
              <span>{hasMinLength ? '✓' : '○'}</span> At least 8 characters
            </div>
            <div className={`flex items-center gap-2 ${hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}`} style={{ color: hasUppercase ? '#006B3C' : '#6B7280' }}>
              <span>{hasUppercase ? '✓' : '○'}</span> At least one uppercase letter (A-Z)
            </div>
            <div className={`flex items-center gap-2 ${hasLowercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}`} style={{ color: hasLowercase ? '#006B3C' : '#6B7280' }}>
              <span>{hasLowercase ? '✓' : '○'}</span> At least one lowercase letter (a-z)
            </div>
            <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-500'}`} style={{ color: hasNumber ? '#006B3C' : '#6B7280' }}>
              <span>{hasNumber ? '✓' : '○'}</span> At least one number (0-9)
            </div>
            <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-700 font-medium' : 'text-slate-500'}`} style={{ color: hasSpecial ? '#006B3C' : '#6B7280' }}>
              <span>{hasSpecial ? '✓' : '○'}</span> At least one special character (!@#$%^&*)
            </div>
            <div className={`flex items-center gap-2 ${passwordsMatch ? 'text-emerald-700 font-medium' : 'text-slate-500'}`} style={{ color: passwordsMatch ? '#006B3C' : '#6B7280' }}>
              <span>{passwordsMatch ? '✓' : '○'}</span> Passwords match
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
            style={{
              width: '100%',
              height: '40px',
              backgroundColor: '#006B3C',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              opacity: isFormValid && !submitting ? 1 : 0.5,
              marginTop: '4px'
            }}
          >
            {submitting ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );

};
