import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface DashboardMetrics {
  totalOpenTickets: number;
  inProgressTickets: number;
  waitingForRequesterTickets: number;
  resolvedTickets: number;
  closedTickets: number;
}

interface RecentTicketItem {
  id: number;
  ticketNumber: string;
  summary: string;
  status: string;
  currentStatus: string;
  requestedPriority: string;
  itPriority?: string;
  updatedAt: string;
  category?: { id: number; name: string };
}

interface RequesterDashboardProps {
  onNavigateToCreateTicket: () => void;
  onNavigateToMyTickets: (statusFilter?: string) => void;
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

export const RequesterDashboard: React.FC<RequesterDashboardProps> = ({
  onNavigateToCreateTicket,
  onNavigateToMyTickets,
  onSelectTicket,
}) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentTickets, setRecentTickets] = useState<RecentTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/requester', { credentials: 'include' });
      if (!res.ok) {
        setError('Dashboard is unavailable. Please try again.');
        return;
      }
      const data = await res.json();
      setMetrics(data.metrics);
      setRecentTickets(data.recentTickets || []);
    } catch {
      setError('Dashboard is unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openCount = metrics ? metrics.totalOpenTickets : 0;
  const waitingCount = metrics?.waitingForRequesterTickets ?? 0;
  const recentlyUpdatedCount = recentTickets.length;
  const resolvedCount = metrics?.resolvedTickets ?? 0;

  const needsAttention = recentTickets.filter((t) =>
    ['IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'REOPENED', 'OPEN', 'NEW'].includes(
      t.currentStatus || t.status
    )
  );
  const recentlyResolved = recentTickets.filter((t) =>
    ['RESOLVED', 'CLOSED'].includes(t.currentStatus || t.status)
  );

  return (
    <div data-testid="requester-dashboard" style={{ minHeight: '100vh', background: '#f5f7f6' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 48px' }}>
        
        {/* Header */}
        <div
          className="requester-dash-header"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2d23', marginBottom: 3 }}>
              My Dashboard
            </h1>
            <p style={{ fontSize: 13, color: '#789082' }}>
              Only your support tickets appear here.
            </p>
          </div>
          <button
            onClick={onNavigateToCreateTicket}
            data-testid="quick-action-create-ticket"
            className="create-ticket-top-btn"
            style={{
              background: '#006B3C',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#004D2B')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#006B3C')}
          >
            Create Ticket
          </button>
        </div>

        {/* Loading */}
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

        {/* Error */}
        {error && (
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
            <div style={{ marginBottom: 12 }}>{error}</div>
            <button
              onClick={fetchDashboardData}
              style={{
                background: '#006B3C',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 16px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Retry dashboard
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* 4 Metric Cards */}
            <div
              className="requester-metric-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 14,
                marginBottom: 22,
              }}
            >
              <MetricCard
                testId="metric-open-tickets"
                label="Open Tickets"
                value={openCount}
                linkLabel="View matching tickets →"
                onClick={() => onNavigateToMyTickets('OPEN')}
              />
              <MetricCard
                testId="metric-waiting"
                label="Waiting for You"
                value={waitingCount}
                linkLabel="View matching tickets →"
                onClick={() => onNavigateToMyTickets('WAITING_FOR_REQUESTER')}
              />
              <MetricCard
                testId="metric-recently-updated"
                label="Recently Updated"
                value={recentlyUpdatedCount}
                linkLabel="View matching tickets →"
                onClick={() => onNavigateToMyTickets()}
              />
              <MetricCard
                testId="metric-resolved"
                label="Recently Resolved"
                value={resolvedCount}
                linkLabel="View matching tickets →"
                onClick={() => onNavigateToMyTickets('RESOLVED')}
              />
            </div>

            {/* Bottom 2-Column Grid */}
            <div
              className="requester-bottom-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
              }}
            >
              {/* Needs attention */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 10,
                  border: '1px solid #e2ede6',
                  padding: '18px 18px 14px',
                }}
              >
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#1a2d23', marginBottom: 14 }}>
                  Needs attention / recently updated
                </h2>
                {needsAttention.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#789082' }}>No matching tickets right now.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {needsAttention.slice(0, 5).map((t) => (
                      <RequesterTicketRow
                        key={t.id}
                        ticket={t}
                        onClick={() => onSelectTicket(t.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Recently resolved */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 10,
                  border: '1px solid #e2ede6',
                  padding: '18px 18px 14px',
                }}
              >
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#1a2d23', marginBottom: 14 }}>
                  Recently resolved
                </h2>
                {recentlyResolved.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#789082' }}>No matching tickets right now.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recentlyResolved.slice(0, 5).map((t) => (
                      <RequesterTicketRow
                        key={t.id}
                        ticket={t}
                        onClick={() => onSelectTicket(t.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Responsive media queries */}
      <style>{`
        @media (max-width: 767px) {
          .requester-dash-header {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .create-ticket-top-btn {
            width: fit-content !important;
          }
          .requester-metric-grid {
            grid-template-columns: 1fr !important;
          }
          .requester-bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .requester-metric-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
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

function RequesterTicketRow({
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
        padding: '8px 10px',
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
          fontSize: 12,
          fontWeight: 700,
          color: '#006B3C',
          textDecoration: hovered ? 'underline' : 'none',
          display: 'block',
          marginBottom: 3,
        }}
      >
        {ticket.ticketNumber}: {ticket.summary}
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 11, color: '#789082' }}>
        <StatusBadge status={status} />
        <span>· IT priority <strong style={{ color: '#1a2d23' }}>{priority}</strong></span>
        <span>
          · Updated{' '}
          {(() => {
            try {
              const d = new Date(ticket.updatedAt);
              const day = d.getDate();
              const month = d.getMonth() + 1;
              const year = d.getFullYear() + 543;
              return `${day}/${month}/${year}`;
            } catch {
              return '';
            }
          })()}
        </span>
      </div>
    </div>
  );
}
