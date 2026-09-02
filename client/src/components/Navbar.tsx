import React from 'react';
import { useRequester } from '../context/RequesterContext';
import { ShieldCheck, UserSwitch, Ticket } from 'lucide-react';

interface NavbarProps {
  onOpenSwitcher: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSwitcher }) => {
  const { activeRequester } = useRequester();

  return (
    <nav className="navbar">
      <a href="#" className="navbar-brand">
        <Ticket className="w-6 h-6" />
        <span>TokTickIT</span>
        <span className="theme-badge">Zen Green</span>
      </a>

      <div className="navbar-user">
        {activeRequester ? (
          <div className="user-badge">
            <ShieldCheck size={16} color="#A8D0B9" />
            <span>{activeRequester.name}</span>
          </div>
        ) : (
          <span style={{ fontSize: '14px', color: '#A8D0B9' }}>No Requester Selected</span>
        )}

        <button className="btn btn-secondary" onClick={onOpenSwitcher} style={{ padding: '6px 12px' }}>
          <UserSwitch size={16} />
          <span>Switch Requester</span>
        </button>
      </div>
    </nav>
  );
};
