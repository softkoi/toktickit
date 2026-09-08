import React, { useState } from 'react';
import { useRequester } from '../context/RequesterContext';
import { Clock, FileText, PlusCircle, User, ChevronDown, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab?: 'my-tickets' | 'create-ticket' | 'select-requester';
  onNavigate?: (tab: 'my-tickets' | 'create-ticket' | 'select-requester') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = 'select-requester', onNavigate }) => {
  const { activeRequester } = useRequester();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (tab: 'my-tickets' | 'create-ticket' | 'select-requester') => {
    onNavigate?.(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="navbar-container">
      <div className="navbar">
        <div className="navbar-left">
          <a 
            href="#" 
            className="navbar-brand"
            onClick={(e) => { e.preventDefault(); handleNavigate('select-requester'); }}
          >
            <div className="logo-icon-box">
              <Clock size={20} color="#FFFFFF" />
            </div>
            <span className="brand-title">TokTickIT</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="nav-links desktop-nav">
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
          </nav>
        </div>

        {/* Desktop Profile / Mobile Menu Controls */}
        <div className="navbar-right">
          <div className="desktop-nav">
            <button 
              className="profile-dropdown-btn"
              onClick={() => handleNavigate('select-requester')}
            >
              <div className="avatar-icon">
                <User size={16} color="#FFFFFF" />
              </div>
              <span>{activeRequester ? activeRequester.name : 'Profile'}</span>
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="mobile-nav-toggle-area">
            <span className="mobile-user-name">
              <User size={14} style={{ marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }} />
              {activeRequester ? activeRequester.name.split(' ')[0] : 'User'}
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

      {/* Mobile Drawer Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-menu">
          <div className="mobile-requester-box">
            <div className="mobile-requester-info">
              <span className="mobile-requester-label">Current Requester:</span>
              <span className="mobile-requester-name">{activeRequester ? activeRequester.name : 'None Selected'}</span>
            </div>
            <button 
              className="change-requester-btn"
              onClick={() => handleNavigate('select-requester')}
            >
              Change Requester
            </button>
          </div>

          <div className="mobile-nav-links">
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
          </div>
        </div>
      )}
    </header>
  );
};
