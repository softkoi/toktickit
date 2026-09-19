import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, FileText, PlusCircle, Users, Shield, LogOut, Menu, X } from 'lucide-react';

export type NavTab = 'my-tickets' | 'create-ticket' | 'staff-queue' | 'user-management';

interface NavbarProps {
  activeTab?: NavTab;
  onNavigate?: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = 'my-tickets', onNavigate }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (tab: NavTab) => {
    onNavigate?.(tab);
    setIsMobileMenuOpen(false);
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMINISTRATOR': return 'Admin';
      case 'IT_STAFF': return 'IT Staff';
      case 'REQUESTER': return 'Requester';
      default: return 'User';
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMINISTRATOR': return 'bg-purple-700 text-white';
      case 'IT_STAFF': return 'bg-amber-600 text-white';
      default: return 'bg-emerald-600 text-white';
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar">
        <div className="navbar-left">
          <a 
            href="#" 
            className="navbar-brand"
            onClick={(e) => {
              e.preventDefault();
              if (user?.role === 'ADMINISTRATOR') handleNavigate('user-management');
              else if (user?.role === 'IT_STAFF') handleNavigate('staff-queue');
              else handleNavigate('my-tickets');
            }}
          >
            <div className="logo-icon-box">
              <Clock size={20} color="#FFFFFF" />
            </div>
            <span className="brand-title">TokTickIT</span>
          </a>

          {/* Desktop Navigation Links based on Role */}
          <nav className="nav-links desktop-nav">
            {(user?.role === 'REQUESTER' || !user) && (
              <>
                <button 
                  className={`nav-link ${activeTab === 'my-tickets' ? 'active' : ''}`}
                  onClick={() => handleNavigate('my-tickets')}
                >
                  <FileText size={16} />
                  <span>My Tickets</span>
                </button>
                <button 
                  className={`nav-link ${activeTab === 'create-ticket' ? 'active' : ''}`}
                  onClick={() => handleNavigate('create-ticket')}
                >
                  <PlusCircle size={16} />
                  <span>Create Ticket</span>
                </button>
              </>
            )}

            {user?.role === 'IT_STAFF' && (
              <>
                <button 
                  className={`nav-link ${activeTab === 'staff-queue' ? 'active' : ''}`}
                  onClick={() => handleNavigate('staff-queue')}
                >
                  <FileText size={16} />
                  <span>Ticket Queue</span>
                </button>
                <button 
                  className={`nav-link ${activeTab === 'create-ticket' ? 'active' : ''}`}
                  onClick={() => handleNavigate('create-ticket')}
                >
                  <PlusCircle size={16} />
                  <span>Create Ticket</span>
                </button>
              </>
            )}

            {user?.role === 'ADMINISTRATOR' && (
              <>
                <button 
                  className={`nav-link ${activeTab === 'user-management' ? 'active' : ''}`}
                  onClick={() => handleNavigate('user-management')}
                >
                  <Users size={16} />
                  <span>User Management</span>
                </button>
                <button 
                  className={`nav-link ${activeTab === 'staff-queue' ? 'active' : ''}`}
                  onClick={() => handleNavigate('staff-queue')}
                >
                  <Shield size={16} />
                  <span>Ticket Queue</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Desktop User Profile & Logout */}
        <div className="navbar-right">
          <div className="desktop-nav">
            {user && (
              <div 
                className="user-profile-badge" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '6px 12px', 
                  backgroundColor: 'rgba(0, 54, 30, 0.4)', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(255, 255, 255, 0.2)' 
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>{user.name}</span>
                <span 
                  style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    padding: '2px 8px', 
                    borderRadius: '9999px',
                    backgroundColor: user.role === 'ADMINISTRATOR' ? '#7E22CE' : user.role === 'IT_STAFF' ? '#D97706' : '#148A52',
                    color: '#FFFFFF'
                  }}
                >
                  {getRoleLabel(user.role)}
                </span>
              </div>
            )}
            <button 
              onClick={() => logout()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>

          <div className="mobile-nav-toggle-area">
            <span className="mobile-user-name" style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 600 }}>
              {user ? user.name.split(' ')[0] : 'User'}
            </span>
            <button 
              className="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {isMobileMenuOpen ? <X size={22} color="#FFFFFF" /> : <Menu size={22} color="#FFFFFF" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-menu">
          <div className="mobile-requester-box">
            <div className="mobile-requester-info">
              <span className="mobile-requester-label">Authenticated User:</span>
              <span className="mobile-requester-name">{user ? `${user.name} (${getRoleLabel(user.role)})` : 'Not Signed In'}</span>
            </div>
            <button 
              className="change-requester-btn bg-red-600 hover:bg-red-700 text-white"
              onClick={() => { setIsMobileMenuOpen(false); logout(); }}
            >
              Logout
            </button>
          </div>

          <div className="mobile-nav-links">
            {(user?.role === 'REQUESTER' || !user) && (
              <>
                <button 
                  className={`mobile-nav-item ${activeTab === 'my-tickets' ? 'active' : ''}`}
                  onClick={() => handleNavigate('my-tickets')}
                >
                  <FileText size={18} />
                  <span>My Tickets</span>
                </button>
                <button 
                  className={`mobile-nav-item ${activeTab === 'create-ticket' ? 'active' : ''}`}
                  onClick={() => handleNavigate('create-ticket')}
                >
                  <PlusCircle size={18} />
                  <span>Create Ticket</span>
                </button>
              </>
            )}

            {user?.role === 'IT_STAFF' && (
              <>
                <button 
                  className={`mobile-nav-item ${activeTab === 'staff-queue' ? 'active' : ''}`}
                  onClick={() => handleNavigate('staff-queue')}
                >
                  <FileText size={18} />
                  <span>Ticket Queue</span>
                </button>
                <button 
                  className={`mobile-nav-item ${activeTab === 'create-ticket' ? 'active' : ''}`}
                  onClick={() => handleNavigate('create-ticket')}
                >
                  <PlusCircle size={18} />
                  <span>Create Ticket</span>
                </button>
              </>
            )}

            {user?.role === 'ADMINISTRATOR' && (
              <>
                <button 
                  className={`mobile-nav-item ${activeTab === 'user-management' ? 'active' : ''}`}
                  onClick={() => handleNavigate('user-management')}
                >
                  <Users size={18} />
                  <span>User Management</span>
                </button>
                <button 
                  className={`mobile-nav-item ${activeTab === 'staff-queue' ? 'active' : ''}`}
                  onClick={() => handleNavigate('staff-queue')}
                >
                  <Shield size={18} />
                  <span>Ticket Queue</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
