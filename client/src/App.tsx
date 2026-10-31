import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RequesterProvider } from './context/RequesterContext';
import { Navbar, NavTab } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { MandatoryPasswordChangeModal } from './components/MandatoryPasswordChangeModal';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { StaffQueuePage } from './pages/StaffQueuePage';
import { StaffTicketDetailPage } from './pages/StaffTicketDetailPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { RequesterDashboard } from './pages/RequesterDashboard';
import { StaffDashboard } from './pages/StaffDashboard';

export const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [viewingTicketDetail, setViewingTicketDetail] = useState(false);

  // Default initial page to dashboard
  useEffect(() => {
    if (user) {
      setActiveTab('dashboard');
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
            {activeTab === 'dashboard' && (
              user.role === 'REQUESTER' ? (
                <RequesterDashboard
                  onNavigateToCreateTicket={() => setActiveTab('create-ticket')}
                  onNavigateToMyTickets={() => setActiveTab('my-tickets')}
                  onSelectTicket={handleSelectTicket}
                />
              ) : (
                <StaffDashboard
                  onNavigateToQueue={() => setActiveTab('staff-queue')}
                  onNavigateToCreateTicket={() => setActiveTab('create-ticket')}
                  onSelectTicket={handleSelectTicket}
                />
              )
            )}

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
      <RequesterProvider>
        <AppContent />
      </RequesterProvider>
    </AuthProvider>
  );
};

export default App;
