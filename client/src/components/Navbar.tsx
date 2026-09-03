import React from 'react';
import { useRequester } from '../context/RequesterContext';
import { Clock, FileText, PlusCircle, User, ChevronDown } from 'lucide-react';

interface NavbarProps {
  activeTab?: 'my-tickets' | 'create-ticket' | 'select-requester';
  onNavigate?: (tab: 'my-tickets' | 'create-ticket' | 'select-requester') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = 'select-requester', onNavigate }) => {
  const { activeRequester } = useRequester();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <a 
          href="#" 
          className="navbar-brand"
          onClick={(e) => { e.preventDefault(); onNavigate?.('select-requester'); }}
        >
          <div className="logo-icon-box">
            <Clock size={20} color="#FFFFFF" />
          </div>
          <span className="brand-title">TokTickIT</span>
        </a>

        <nav className="nav-links">
          <button 
            className={`nav-link ${activeTab === 'my-tickets' ? 'active' : ''}`}
            onClick={() => onNavigate?.('my-tickets')}
          >
            <FileText size={16} />
            <span>My Tickets</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'create-ticket' ? 'active' : ''}`}
            onClick={() => onNavigate?.('create-ticket')}
          >
            <PlusCircle size={16} />
            <span>Create Ticket</span>
          </button>
        </nav>
      </div>

      <div className="navbar-right">
        <button 
          className="profile-dropdown-btn"
          onClick={() => onNavigate?.('select-requester')}
        >
          <div className="avatar-icon">
            <User size={16} color="#FFFFFF" />
          </div>
          <span>{activeRequester ? activeRequester.name : 'Profile'}</span>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
};
