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
          <div className="desktop-nav flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/40 rounded-lg border border-emerald-700/50">
                <span className="text-sm font-medium text-white">{user.name}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            )}
            <button 
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-100 hover:text-white bg-emerald-800/60 hover:bg-emerald-800 rounded-lg transition-colors border border-emerald-700/50"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>

          <div className="mobile-nav-toggle-area">
            <span className="mobile-user-name">
              {user ? user.name.split(' ')[0] : 'User'}
            </span>
            <button 
              className="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile navigation menu"
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
