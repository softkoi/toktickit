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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-emerald-100 animate-fadeIn">
        <div className="flex items-center gap-3 mb-4 text-emerald-800">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-lg">
            🔒
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Mandatory Password Change</h2>
            <p className="text-xs text-slate-500">Please set a new password before proceeding.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm rounded">
            Password updated successfully! Reloading...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Enter current password"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Re-enter new password"
              required
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
            <p className="font-semibold text-slate-700 mb-1">Password Requirements:</p>
            <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
              <span>{hasMinLength ? '✓' : '○'}</span> At least 8 characters
            </div>
            <div className={`flex items-center gap-2 ${hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
              <span>{hasUppercase ? '✓' : '○'}</span> At least one uppercase letter (A-Z)
            </div>
            <div className={`flex items-center gap-2 ${hasLowercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
              <span>{hasLowercase ? '✓' : '○'}</span> At least one lowercase letter (a-z)
            </div>
            <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
              <span>{hasNumber ? '✓' : '○'}</span> At least one number (0-9)
            </div>
            <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
              <span>{hasSpecial ? '✓' : '○'}</span> At least one special character (!@#$%^&*)
            </div>
            <div className={`flex items-center gap-2 ${passwordsMatch ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
              <span>{passwordsMatch ? '✓' : '○'}</span> Passwords match
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
          >
            {submitting ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
