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
  const [queueFilters, setQueueFilters] = useState<{ status?: string; assignment?: string; priority?: string }>({});
  const [requesterTicketFilter, setRequesterTicketFilter] = useState<string | null>(null);

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

  const handleNavigateToQueue = (filter?: { status?: string; assignment?: string; priority?: string } | string) => {
    if (typeof filter === 'string') {
      if (filter === 'unassigned' || filter === 'my-assigned') {
        setQueueFilters({ assignment: filter });
      } else if (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(filter)) {
        setQueueFilters({ priority: filter });
      } else {
        setQueueFilters({ status: filter });
      }
    } else if (filter) {
      setQueueFilters(filter);
    } else {
      setQueueFilters({});
    }
    setActiveTab('staff-queue');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Navbar
        activeTab={activeTab}
        onNavigate={(tab) => {
          if (tab === 'my-tickets') {
            setRequesterTicketFilter(null);
          }
          if (tab === 'staff-queue') {
            setQueueFilters({});
          }
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
                  onNavigateToMyTickets={(statusFilter?: string) => {
                    setRequesterTicketFilter(statusFilter || 'open');
                    setActiveTab('my-tickets');
                  }}
                  onSelectTicket={handleSelectTicket}
                />
              ) : (
                <StaffDashboard
                  onNavigateToQueue={handleNavigateToQueue}
                  onNavigateToCreateTicket={() => setActiveTab('create-ticket')}
                  onSelectTicket={handleSelectTicket}
                />
              )
            )}

            {activeTab === 'my-tickets' && (
              <MyTicketsPage
                key={requesterTicketFilter || 'all'}
                initialFilter={requesterTicketFilter}
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
                key={JSON.stringify(queueFilters)}
                initialFilters={queueFilters}
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
