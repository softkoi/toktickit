import React, { useState } from 'react';
import { useRequester, RequesterUser } from '../context/RequesterContext';
import { UserCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface RequesterSwitcherProps {
  onClose?: () => void;
}

export const RequesterSwitcher: React.FC<RequesterSwitcherProps> = ({ onClose }) => {
  const { activeRequester, setActiveRequester, requesters, loading, error, fetchRequesters } = useRequester();
  const [selectedId, setSelectedId] = useState<number>(activeRequester?.id || (requesters[0]?.id ?? 1));

  const handleConfirm = () => {
    const found = requesters.find(r => r.id === selectedId);
    if (found) {
      setActiveRequester(found);
      if (onClose) onClose();
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '40px auto' }} className="card">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
          Development Requester Switcher
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Select an active user identity to simulate API requests with <code>X-Requester-Id</code> header (Lab 2 Identity Switcher).
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
          <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
          Loading requesters...
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: 'var(--color-error-bg)',
          color: 'var(--color-error-text)',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={fetchRequesters} className="btn btn-tertiary" style={{ marginLeft: 'auto', padding: '4px 8px' }}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {requesters.map((req: RequesterUser) => {
            const isSelected = selectedId === req.id;
            const isActiveUser = activeRequester?.id === req.id;

            return (
              <label
                key={req.id}
                onClick={() => setSelectedId(req.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--color-primary-700)' : '1px solid var(--color-primary-100)',
                  backgroundColor: isSelected ? 'var(--color-primary-50)' : 'var(--color-surface-card)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                <input
                  type="radio"
                  name="requester_select"
                  checked={isSelected}
                  onChange={() => setSelectedId(req.id)}
                  style={{ marginRight: '12px', accentColor: 'var(--color-primary-700)' }}
                />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--color-text-primary)' }}>
                    {req.name}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {req.email}
                  </div>
                </div>

                {isActiveUser && (
                  <span style={{
                    marginLeft: 'auto',
                    backgroundColor: 'var(--color-primary-700)',
                    color: 'white',
                    fontSize: '12px',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <UserCheck size={14} /> Active
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}

      <button
        className="btn btn-primary"
        style={{ width: '100%', padding: '12px' }}
        onClick={handleConfirm}
        disabled={loading || requesters.length === 0}
      >
        Set Active Development Requester
      </button>
    </div>
  );
};
