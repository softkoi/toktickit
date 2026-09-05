import React, { useState } from 'react';
import { RequesterProvider } from './context/RequesterContext';
import { Navbar } from './components/Navbar';
import { RequesterSwitcher } from './components/RequesterSwitcher';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { MyTicketsPage } from './pages/MyTicketsPage';

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
          <MyTicketsPage
            onNavigateToCreateTicket={() => setActiveTab('create-ticket')}
          />
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
