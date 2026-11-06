import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface StaffMetrics {
  newCount: number;
  openCount: number;
  inProgressCount: number;
  waitingForRequesterCount: number;
  resolvedCount: number;
  closedCount: number;
  reopenedCount?: number;
  cancelledCount?: number;
  myAssignedCount: number;
  unassignedCount: number;
  urgentActiveCount?: number;
  lowPriorityCount?: number;
  mediumPriorityCount?: number;
  highPriorityCount?: number;
  urgentPriorityCount?: number;
  userAccountsCount: number;
}

interface RecentTicketItem {
  id: number;
  ticketNumber: string;
  summary: string;
  status: string;
  currentStatus: string;
  itPriority?: string;
  requestedPriority?: string;
  updatedAt: string;
  requester?: { id: number; name: string; email: string };
  assignedTo?: { id: number; name: string } | null;
}

interface StaffDashboardProps {
  onNavigateToQueue: (filter?: { status?: string; assignment?: string; priority?: string } | string) => void;
  onNavigateToCreateTicket?: () => void;
  onSelectTicket: (ticketId: number) => void;
}

const STATUS_LABEL: Record<string, string> = {
  NEW: 'NEW',
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN PROGRESS',
  WAITING_FOR_REQUESTER: 'WAITING FOR REQUESTER',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
  CANCELLED: 'CANCELLED',
};

const STATUS_COLOR: Record<string, React.CSSProperties> = {
  NEW: { background: '#e0f2fe', color: '#0369a1' },
  OPEN: { background: '#fef3c7', color: '#92400e' },
  IN_PROGRESS: { background: '#f3e8ff', color: '#6b21a8' },
  WAITING_FOR_REQUESTER: { background: '#ffedd5', color: '#9a3412' },
  RESOLVED: { background: '#dcfce7', color: '#166534' },
  CLOSED: { background: '#f1f5f9', color: '#475569' },
  REOPENED: { background: '#fce7f3', color: '#9d174d' },
  CANCELLED: { background: '#f1f5f9', color: '#6b7280' },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_COLOR[status] || { background: '#f1f5f9', color: '#475569' };
  return (
    <span
      style={{
        ...style,
        fontWeight: 700,
        fontSize: 10,
        padding: '2px 7px',
        borderRadius: 4,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {STATUS_LABEL[status] || status.replace(/_/g, ' ')}
    </span>
  );
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  onNavigateToQueue,
  onSelectTicket,
}) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<StaffMetrics | null>(null);
  const [recentTickets, setRecentTickets] = useState<RecentTicketItem[]>([]);
  const [urgentTickets, setUrgentTickets] = useState<RecentTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('loading') === '1' || params.get('state') === 'loading') {
      setIsLoading(true);
      setError(null);
      return;
    }

    if (params.get('fail') === '1' || params.get('error') === '1' || params.get('state') === 'fail') {
      setIsLoading(false);
      setError('Dashboard is unavailable. Please try again.');
      return;
    }

    if (params.get('empty') === '1' || params.get('state') === 'empty') {
      setMetrics({
        newCount: 0,
        openCount: 0,
        inProgressCount: 0,
        waitingForRequesterCount: 0,
        resolvedCount: 0,
        closedCount: 0,
        reopenedCount: 0,
        cancelledCount: 0,
        myAssignedCount: 0,
        unassignedCount: 0,
        urgentActiveCount: 0,
        lowPriorityCount: 0,
        mediumPriorityCount: 0,
        highPriorityCount: 0,
        urgentPriorityCount: 0,
        userAccountsCount: 0,
      });
      setRecentTickets([]);
      setUrgentTickets([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/staff', { credentials: 'include' });
      if (res.status === 403) {
        setError('FORBIDDEN');
        return;
      }
      if (!res.ok) {
        setError('Dashboard is unavailable. Please try again.');
        return;
      }
      const data = await res.json();
      setMetrics(data.metrics || null);
      setRecentTickets(data.recentTickets || []);
      setUrgentTickets(data.urgentTickets || []);
    } catch {
      setError('Dashboard is unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    // If URL contains fail parameter, clear it on retry so live data loads
    if (window.location.search.includes('fail') || window.location.search.includes('error') || window.location.search.includes('state')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('fail');
      url.searchParams.delete('error');
      url.searchParams.delete('state');
      window.history.replaceState({}, '', url.pathname);
    }
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (error === 'FORBIDDEN') {
    return (
      <div data-testid="staff-dashboard-forbidden" style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 16px' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '24px 28px', color: '#991b1b', fontSize: 14 }}>
          <strong style={{ display: 'block', marginBottom: 6, fontSize: 16 }}>Access Denied</strong>
          <p style={{ fontSize: 13 }}>Operational staff access is required.</p>
        </div>
      </div>
    );
  }

  // Fallback urgent work list from recentTickets if urgentTickets not populated
  const displayUrgentWork = urgentTickets.length > 0
    ? urgentTickets
    : recentTickets.filter(
        (t) =>
          ['HIGH', 'URGENT'].includes(t.itPriority || t.requestedPriority || '') &&
          !['CLOSED', 'CANCELLED'].includes(t.currentStatus || t.status)
      );

  return (
    <div data-testid="staff-dashboard" style={{ minHeight: '100vh', background: '#f5f7f6' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 48px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2d23', marginBottom: 3 }}>
            IT Staff Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#789082' }}>
            Operational tickets and recent work.
          </p>
        </div>

        {/* Loading Banner */}
        {isLoading && (
          <div
            style={{
              background: '#fff',
              borderRadius: 10,
              border: '1px solid #e2ede6',
              padding: '24px 20px',
              color: '#64748b',
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            Loading dashboard...
          </div>
        )}

        {/* Failure / Retry Banner */}
        {error && error !== 'FORBIDDEN' && (
          <div
            style={{
              marginBottom: 20,
              padding: '18px 22px',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: 10,
              color: '#991b1b',
              fontSize: 13,
            }}
          >
            <div style={{ marginBottom: 12, fontWeight: 500 }}>
              Dashboard is unavailable. Please try again.
            </div>
            <button
              onClick={handleRetry}
              style={{
                background: '#006B3C',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '7px 18px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Retry dashboard
            </button>
          </div>
        )}

        {/* Main Dashboard Content */}
        {!isLoading && !error && (
          <>
            {/* 4 Metric Cards */}
            <div
              className="staff-metric-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 14,
                marginBottom: 18,
              }}
            >
              <MetricCard
                testId="metric-card-unassigned"
                label="Unassigned Tickets"
                value={metrics?.unassignedCount ?? 0}
                linkLabel="View matching tickets →"
                onClick={() => onNavigateToQueue('unassigned')}
              />
              <MetricCard
                testId="metric-card-myassigned"
                label="My Owned Tickets"
                value={metrics?.myAssignedCount ?? 0}
                linkLabel="View matching tickets →"
                onClick={() => onNavigateToQueue('my-assigned')}
              />
              <MetricCard
                testId="metric-card-urgent"
                label="Urgent Active Tickets"
                value={metrics?.urgentActiveCount ?? displayUrgentWork.length}
                linkLabel="View matching tickets →"
                onClick={() => onNavigateToQueue({ priority: 'URGENT' })}
              />
              <MetricCard
                testId="metric-card-recent"
                label="Recently Updated Tickets"
                value={recentTickets.length}
                linkLabel="View matching tickets →"
                onClick={() => onNavigateToQueue()}
              />
            </div>

            {/* Bottom 4-Column Grid */}
            <div
              className="staff-bottom-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 14,
              }}
            >
              {/* Column 1: Tickets by status */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 10,
                  border: '1px solid #e2ede6',
                  padding: '16px 18px',
                }}
              >
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1a2d23', marginBottom: 12 }}>
                  Tickets by status
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { label: 'NEW', count: metrics?.newCount ?? 0 },
                    { label: 'OPEN', count: metrics?.openCount ?? 0 },
                    { label: 'IN PROGRESS', count: metrics?.inProgressCount ?? 0 },
                    { label: 'WAITING FOR REQUESTER', count: metrics?.waitingForRequesterCount ?? 0 },
                    { label: 'RESOLVED', count: metrics?.resolvedCount ?? 0 },
                    { label: 'CLOSED', count: metrics?.closedCount ?? 0 },
                    { label: 'REOPENED', count: metrics?.reopenedCount ?? 0 },
                    { label: 'CANCELLED', count: metrics?.cancelledCount ?? 0 },
                  ].map(({ label, count }) => (
                    <button
                      key={label}
                      onClick={() => onNavigateToQueue({ status: label.replace(/ /g, '_') })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'none',
                        border: 'none',
                        padding: '2px 0',
                        cursor: 'pointer',
                        fontSize: 11,
                        color: '#64748b',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{label}:</span>
                      <span style={{ color: '#1a2d23', fontWeight: 800 }}>{count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Column 2: Tickets by IT priority */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 10,
                  border: '1px solid #e2ede6',
                  padding: '16px 18px',
                }}
              >
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1a2d23', marginBottom: 12 }}>
                  Tickets by IT priority
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { label: 'LOW', count: metrics?.lowPriorityCount ?? recentTickets.filter(t => (t.itPriority || t.requestedPriority) === 'LOW').length },
                    { label: 'MEDIUM', count: metrics?.mediumPriorityCount ?? recentTickets.filter(t => (t.itPriority || t.requestedPriority) === 'MEDIUM').length },
                    { label: 'HIGH', count: metrics?.highPriorityCount ?? recentTickets.filter(t => (t.itPriority || t.requestedPriority) === 'HIGH').length },
                    { label: 'URGENT', count: metrics?.urgentPriorityCount ?? (metrics?.urgentActiveCount ?? recentTickets.filter(t => (t.itPriority || t.requestedPriority) === 'URGENT').length) },
                  ].map(({ label, count }) => (
                    <button
                      key={label}
                      onClick={() => onNavigateToQueue({ priority: label })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'none',
                        border: 'none',
                        padding: '2px 0',
                        cursor: 'pointer',
                        fontSize: 11,
                        color: '#64748b',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{label}:</span>
                      <span style={{ color: '#1a2d23', fontWeight: 800 }}>{count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Column 3: Urgent work */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 10,
                  border: '1px solid #e2ede6',
                  padding: '16px 18px',
                }}
              >
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1a2d23', marginBottom: 12 }}>
                  Urgent work
                </h3>
                {displayUrgentWork.length === 0 ? (
                  <p style={{ fontSize: 11, color: '#789082' }}>No matching tickets right now.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {displayUrgentWork.slice(0, 4).map((t) => (
                      <TicketItemRow key={t.id} ticket={t} onClick={() => onSelectTicket(t.id)} />
                    ))}
                  </div>
                )}
              </div>

              {/* Column 4: Recently updated */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 10,
                  border: '1px solid #e2ede6',
                  padding: '16px 18px',
                }}
              >
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1a2d23', marginBottom: 12 }}>
                  Recently updated
                </h3>
                {recentTickets.length === 0 ? (
                  <p style={{ fontSize: 11, color: '#789082' }}>No matching tickets right now.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recentTickets.slice(0, 4).map((t) => (
                      <TicketItemRow key={t.id} ticket={t} onClick={() => onSelectTicket(t.id)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Responsive Media Queries */}
      <style>{`
        @media (max-width: 767px) {
          .staff-metric-grid { grid-template-columns: 1fr !important; }
          .staff-bottom-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .staff-metric-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .staff-bottom-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};

function MetricCard({
  label,
  value,
  linkLabel,
  onClick,
  testId,
}: {
  label: string;
  value: number;
  linkLabel: string;
  onClick: () => void;
  testId?: string;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      data-testid={testId}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 10,
        border: `1px solid ${hovered ? '#006B3C' : '#e2ede6'}`,
        padding: '16px 18px 14px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: hovered ? '0 2px 8px rgba(0,107,60,0.08)' : '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: '#789082', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#1a2d23', lineHeight: 1, marginBottom: 10 }}>
        {value}
      </div>
      <span style={{ fontSize: 11, color: '#006B3C', fontWeight: 600 }}>
        {linkLabel}
      </span>
    </div>
  );
}

function TicketItemRow({
  ticket,
  onClick,
}: {
  ticket: RecentTicketItem;
  onClick: () => void;
}) {
  const status = ticket.currentStatus || ticket.status;
  const priority = ticket.itPriority || ticket.requestedPriority || 'MEDIUM';
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        borderRadius: 6,
        padding: '6px 8px',
        background: hovered ? '#f4f9f6' : 'transparent',
        transition: 'background 0.12s',
      }}
    >
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#006B3C',
          textDecoration: hovered ? 'underline' : 'none',
          display: 'block',
          marginBottom: 3,
          lineHeight: 1.35,
        }}
      >
        {ticket.ticketNumber}: {ticket.summary}
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 10, color: '#789082' }}>
        <StatusBadge status={status} />
        <span>· IT priority <strong style={{ color: '#1a2d23' }}>{priority}</strong></span>
        <span>
          · Updated{' '}
          {new Date(ticket.updatedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}
