import React, { useState } from 'react';
import { RequesterProvider } from './context/RequesterContext';
import { Navbar } from './components/Navbar';
import { RequesterSwitcher } from './components/RequesterSwitcher';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { TicketDetailPage } from './pages/TicketDetailPage';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'select-requester' | 'my-tickets' | 'create-ticket' | 'ticket-detail'>('select-requester');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  const handleSelectTicket = (id: number) => {
    setSelectedTicketId(id);
    setActiveTab('ticket-detail');
  };

  return (
    <div>
      <Navbar 
        activeTab={activeTab === 'ticket-detail' ? 'my-tickets' : activeTab} 
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
            onSelectTicket={handleSelectTicket}
          />
        )}

        {activeTab === 'ticket-detail' && selectedTicketId && (
          <TicketDetailPage
            ticketId={selectedTicketId}
            onBack={() => setActiveTab('my-tickets')}
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
