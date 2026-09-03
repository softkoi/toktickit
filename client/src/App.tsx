import React, { useState } from 'react';
import { RequesterProvider } from './context/RequesterContext';
import { Navbar } from './components/Navbar';
import { RequesterSwitcher } from './components/RequesterSwitcher';
import { CreateTicketPage } from './pages/CreateTicketPage';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'select-requester' | 'my-tickets' | 'create-ticket'>('select-requester');

  return (
    <div>
      <Navbar 
        activeTab={activeTab} 
        onNavigate={(tab) => setActiveTab(tab)} 
      />

      <main>
        {activeTab === 'select-requester' && (
          <RequesterSwitcher 
            onContinue={() => setActiveTab('my-tickets')}
            onCancel={() => setActiveTab('select-requester')}
          />
        )}

        {activeTab === 'my-tickets' && (
          <div style={{ maxWidth: '1000px', margin: '40px auto', textAlign: 'center', padding: '40px' }} className="card">
            <h2 style={{ fontSize: '20px', color: '#1A2D23', marginBottom: '8px' }}>My Tickets Screen (Issue 4)</h2>
            <p style={{ color: '#5C6B73', marginBottom: '20px' }}>This screen will be built in Issue 4.</p>
            <button className="btn btn-primary" onClick={() => setActiveTab('create-ticket')}>
              + Create Ticket
            </button>
          </div>
        )}

        {activeTab === 'create-ticket' && (
          <CreateTicketPage
            onNavigateToTickets={() => setActiveTab('my-tickets')}
            onCancel={() => setActiveTab('my-tickets')}
          />
        )}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <RequesterProvider>
      <AppContent />
    </RequesterProvider>
  );
};

export default App;
