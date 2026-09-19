import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, NavTab } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { MandatoryPasswordChangeModal } from './components/MandatoryPasswordChangeModal';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { StaffQueuePage } from './pages/StaffQueuePage';
import { StaffTicketDetailPage } from './pages/StaffTicketDetailPage';
import { UserManagementPage } from './pages/UserManagementPage';

export const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('my-tickets');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [viewingTicketDetail, setViewingTicketDetail] = useState(false);

  // Default initial page depending on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMINISTRATOR') {
        setActiveTab('user-management');
      } else if (user.role === 'IT_STAFF') {
        setActiveTab('staff-queue');
      } else {
        setActiveTab('my-tickets');
      }
      setViewingTicketDetail(false);
    }
  }, [user?.role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">
        Loading TokTickIT Session...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleSelectTicket = (id: number) => {
    setSelectedTicketId(id);
    setViewingTicketDetail(true);
  };

  const handleBackFromDetail = () => {
    setViewingTicketDetail(false);
    setSelectedTicketId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Navbar
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setViewingTicketDetail(false);
        }}
      />

      <MandatoryPasswordChangeModal />

      <main>
        {/* Requester Ticket Detail */}
        {viewingTicketDetail && selectedTicketId && user.role === 'REQUESTER' && (
          <TicketDetailPage
            ticketId={selectedTicketId}
            onBack={handleBackFromDetail}
          />
        )}

        {/* IT Staff & Admin Ticket Detail */}
        {viewingTicketDetail && selectedTicketId && (user.role === 'IT_STAFF' || user.role === 'ADMINISTRATOR') && (
          <StaffTicketDetailPage
            ticketId={selectedTicketId}
            onBack={handleBackFromDetail}
          />
        )}

        {/* Main Tabs when not in detail view */}
        {!viewingTicketDetail && (
          <>
            {activeTab === 'my-tickets' && (
              <MyTicketsPage
                onNavigateToCreateTicket={() => setActiveTab('create-ticket')}
                onSelectTicket={handleSelectTicket}
              />
            )}

            {activeTab === 'create-ticket' && (
              <CreateTicketPage
                onNavigateToTickets={() => {
                  if (user.role === 'IT_STAFF') setActiveTab('staff-queue');
                  else setActiveTab('my-tickets');
                }}
                onCancel={() => {
                  if (user.role === 'IT_STAFF') setActiveTab('staff-queue');
                  else setActiveTab('my-tickets');
                }}
              />
            )}

            {activeTab === 'staff-queue' && (
              <StaffQueuePage
                onSelectTicket={handleSelectTicket}
              />
            )}

            {activeTab === 'user-management' && (
              <UserManagementPage />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
