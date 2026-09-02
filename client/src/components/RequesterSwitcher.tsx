import React, { useState, useEffect } from 'react';
import { useRequester } from '../context/RequesterContext';
import { UserCog, Info, Shield, ArrowRight, Home, RefreshCw, AlertCircle } from 'lucide-react';

interface RequesterSwitcherProps {
  onContinue?: () => void;
  onCancel?: () => void;
}

export const RequesterSwitcher: React.FC<RequesterSwitcherProps> = ({ onContinue, onCancel }) => {
  const { activeRequester, setActiveRequester, requesters, loading, error, fetchRequesters } = useRequester();
  const [selectedId, setSelectedId] = useState<number>(activeRequester?.id || 1);

  useEffect(() => {
    if (activeRequester) {
      setSelectedId(activeRequester.id);
    } else if (requesters.length > 0) {
      setSelectedId(requesters[0].id);
    }
  }, [activeRequester, requesters]);

  const handleContinue = () => {
    const found = requesters.find(r => r.id === Number(selectedId));
    if (found) {
      setActiveRequester(found);
    }
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <div className="requester-select-page">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <Home size={14} className="breadcrumb-home" />
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-current">Development Requester Selection</span>
      </div>

      {/* Main Select Card */}
      <div className="card requester-select-card">
        {/* Top Circle Icon */}
        <div className="user-icon-circle">
          <UserCog size={32} color="#006B3C" />
        </div>

        {/* Heading & Subtitle */}
        <h1 className="select-title">Select Development Requester</h1>
        <p className="select-subtitle">
          Choose a development requester to simulate the current requester context for Lab 2.<br />
          This is for testing only and is not a login screen.
        </p>

        {loading && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)' }}>
            <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
            <div>Loading active requesters...</div>
          </div>
        )}

        {error && (
          <div className="callout callout-error">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button onClick={fetchRequesters} className="btn btn-tertiary" style={{ marginLeft: 'auto', padding: '2px 8px' }}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="select-form-body">
            {/* Dropdown Field */}
            <div className="form-field">
              <label className="form-label" htmlFor="requester-dropdown">
                Development Requester <span className="required-asterisk">*</span>
              </label>
              <select
                id="requester-dropdown"
                className="form-select"
                value={selectedId}
                onChange={(e) => setSelectedId(Number(e.target.value))}
              >
                {requesters.map((req) => (
                  <option key={req.id} value={req.id}>
                    {req.name} ({req.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Callout 1: Active requesters info */}
            <div className="callout callout-info">
              <Info size={18} color="#006B3C" style={{ flexShrink: 0 }} />
              <span>Only active development requesters are shown.</span>
            </div>

            {/* Callout 2: Authentication warning in Lab 3 */}
            <div className="callout callout-warning">
              <Shield size={20} color="#5C6B73" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div className="callout-title">Authentication coming in Lab 3</div>
                <div className="callout-desc">
                  In Lab 3, this selection will be replaced with secure authentication so you can access the system with your own account.
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => onCancel?.()}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleContinue}
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
