import React from 'react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'dashboard' | 'my-tickets' | 'create-ticket' | 'staff-queue' | 'user-management';

interface NavbarProps {
  activeTab?: NavTab;
  onNavigate?: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = 'dashboard', onNavigate }) => {
  const { user, logout } = useAuth();

  const handleNavigate = (tab: NavTab) => {
    onNavigate?.(tab);
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMINISTRATOR': return 'ADMIN';
      case 'IT_STAFF': return 'IT STAFF';
      case 'REQUESTER': return 'REQUESTER';
      default: return 'USER';
    }
  };

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <header className="toktick-navbar" style={{ background: '#006B3C', color: '#fff', width: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        
        {/* Left: Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleNavigate('dashboard'); }}
            style={{ color: '#fff', textDecoration: 'none', fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            TokTickIT
          </a>

          {/* Desktop/Tablet Nav Links */}
          <nav className="navbar-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Requester Links */}
            {(user?.role === 'REQUESTER' || !user) && (
              <>
                <button
                  className="nav-btn"
                  onClick={() => handleNavigate('dashboard')}
                  data-testid="nav-requester-dashboard"
                  style={{
                    background: activeTab === 'dashboard' ? '#004D2B' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: activeTab === 'dashboard' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                >
                  Dashboard
                </button>
                <button
                  className="nav-btn"
                  onClick={() => handleNavigate('my-tickets')}
                  data-testid="nav-my-tickets"
                  style={{
                    background: activeTab === 'my-tickets' ? '#004D2B' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: activeTab === 'my-tickets' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                >
                  My Tickets
                </button>
                <button
                  className="nav-btn"
                  onClick={() => handleNavigate('create-ticket')}
                  data-testid="nav-create-ticket"
                  style={{
                    background: activeTab === 'create-ticket' ? '#004D2B' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: activeTab === 'create-ticket' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                >
                  Create Ticket
                </button>
              </>
            )}

            {/* IT Staff Links */}
            {user?.role === 'IT_STAFF' && (
              <>
                <button
                  className="nav-btn"
                  onClick={() => handleNavigate('dashboard')}
                  data-testid="nav-staff-dashboard"
                  style={{
                    background: activeTab === 'dashboard' ? '#004D2B' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: activeTab === 'dashboard' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                >
                  Dashboard
                </button>
                <button
                  className="nav-btn"
                  onClick={() => handleNavigate('staff-queue')}
                  data-testid="nav-staff-queue"
                  style={{
                    background: activeTab === 'staff-queue' ? '#004D2B' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: activeTab === 'staff-queue' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                >
                  Ticket Queue
                </button>
                <button
                  className="nav-btn"
                  onClick={() => handleNavigate('create-ticket')}
                  style={{
                    background: activeTab === 'create-ticket' ? '#004D2B' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: activeTab === 'create-ticket' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                >
                  Create Ticket
                </button>
              </>
            )}

            {/* Admin Links */}
            {user?.role === 'ADMINISTRATOR' && (
              <>
                <button
                  className="nav-btn"
                  onClick={() => handleNavigate('dashboard')}
                  data-testid="nav-admin-dashboard"
                  style={{
                    background: activeTab === 'dashboard' ? '#004D2B' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: activeTab === 'dashboard' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                >
                  Dashboard
                </button>
                <button
                  className="nav-btn"
                  onClick={() => handleNavigate('staff-queue')}
                  style={{
                    background: activeTab === 'staff-queue' ? '#004D2B' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: activeTab === 'staff-queue' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                >
                  Ticket Queue
                </button>
                <button
                  className="nav-btn"
                  onClick={() => handleNavigate('user-management')}
                  style={{
                    background: activeTab === 'user-management' ? '#004D2B' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: activeTab === 'user-management' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                >
                  Users
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Right: User Profile & Sign out */}
        <div className="navbar-user-section" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Circle avatar with initial */}
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 12,
                  color: '#fff'
                }}
              >
                {initial}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.1, color: '#fff' }}>
                  {user.name}
                </span>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#A8D0B9', letterSpacing: '0.04em' }}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => logout()}
            data-testid="nav-sign-out"
            style={{
              background: 'rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              color: '#fff',
              borderRadius: 9999,
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.15)')}
          >
            Sign out
          </button>
        </div>

      </div>

      {/* Responsive mobile styling */}
      <style>{`
        @media (max-width: 640px) {
          .toktick-navbar > div {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
            padding: 12px 14px !important;
          }
          .navbar-nav-links {
            width: 100% !important;
            overflow-x: auto !important;
            padding-bottom: 2px !important;
          }
          .navbar-user-section {
            width: 100% !important;
            justify-content: space-between !important;
            border-top: 1px solid rgba(255, 255, 255, 0.15) !important;
            padding-top: 8px !important;
          }
        }
      `}</style>
    </header>
  );
};
