import React, { useState, useEffect } from 'react';

interface StaffTicketItem {
  id: number;
  ticketNumber: string;
  summary: string;
  requestedPriority: string;
  itPriority: string;
  currentStatus: string;
  createdAt: string;
  updatedAt: string;
  requester: { id: number; name: string; email: string };
  owner: { id: number; name: string; role: string } | null;
  category: { id: number; name: string };
  relatedSystem: { id: number; name: string };
}

interface StaffQueueProps {
  initialFilters?: {
    status?: string;
    assignment?: string;
    priority?: string;
  };
  onSelectTicket?: (id: number) => void;
}

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
        padding: '2px 8px',
        borderRadius: 4,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export const StaffQueuePage: React.FC<StaffQueueProps> = ({
  initialFilters,
  onSelectTicket,
}) => {
  const [tickets, setTickets] = useState<StaffTicketItem[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  // Filter Form State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [requestedPriorityFilter, setRequestedPriorityFilter] = useState('');
  const [itPriorityFilter, setItPriorityFilter] = useState(initialFilters?.priority || '');
  const [statusFilter, setStatusFilter] = useState(initialFilters?.status || '');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState(initialFilters?.assignment || '');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Applied Filters State (what is actually queried)
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    category: '',
    requestedPriority: '',
    itPriority: initialFilters?.priority || '',
    status: initialFilters?.status || '',
    owner: '',
    assignment: initialFilters?.assignment || '',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  // Fetch categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setCategories(data.data);
      })
      .catch(() => {});
  }, []);

  const fetchTickets = async (page = 1, currentFilters = appliedFilters) => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        page: String(page),
        pageSize: '10',
        sortBy: currentFilters.sortBy,
        sortOrder: currentFilters.sortOrder,
        ...(currentFilters.search ? { search: currentFilters.search } : {}),
        ...(currentFilters.category ? { category: currentFilters.category } : {}),
        ...(currentFilters.requestedPriority ? { requestedPriority: currentFilters.requestedPriority } : {}),
        ...(currentFilters.itPriority ? { itPriority: currentFilters.itPriority } : {}),
        ...(currentFilters.status ? { status: currentFilters.status } : {}),
        ...(currentFilters.owner ? { ownerId: currentFilters.owner } : {}),
        ...(currentFilters.assignment ? { assignment: currentFilters.assignment } : {}),
      });

      const res = await fetch(`/api/staff/tickets?${query.toString()}`, { credentials: 'include' });
      if (!res.ok) {
        setError('Failed to fetch ticket queue.');
        return;
      }

      const resData = await res.json();
      setTickets(resData.data || []);
      setPagination(resData.pagination || { total: 0, page: 1, pageSize: 10, totalPages: 1 });
    } catch {
      setError('Queue is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(1, appliedFilters);
  }, [appliedFilters]);

  const handleApplyFilters = () => {
    const nextFilters = {
      search,
      category: categoryFilter,
      requestedPriority: requestedPriorityFilter,
      itPriority: itPriorityFilter,
      status: statusFilter,
      owner: ownerFilter,
      assignment: assignmentFilter,
      sortBy,
      sortOrder,
    };
    setAppliedFilters(nextFilters);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setRequestedPriorityFilter('');
    setItPriorityFilter('');
    setStatusFilter('');
    setOwnerFilter('');
    setAssignmentFilter('');
    setSortBy('updatedAt');
    setSortOrder('desc');

    const clearedFilters = {
      search: '',
      category: '',
      requestedPriority: '',
      itPriority: '',
      status: '',
      owner: '',
      assignment: '',
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    };
    setAppliedFilters(clearedFilters);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7f6' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 48px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2d23', marginBottom: 4 }}>
              Ticket Queue
            </h1>
            <p style={{ fontSize: 13, color: '#789082' }}>
              {pagination.total} tickets match the current queue filters.
            </p>
          </div>
          <button
            onClick={() => fetchTickets(pagination.page, appliedFilters)}
            style={{
              background: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            Refresh
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              marginBottom: 20,
              padding: '14px 18px',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              color: '#991b1b',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* Filter Panel */}
        <div
          style={{
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #e2ede6',
            padding: '20px',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            
            {/* Row 1: Search, Category, Requested Priority, IT Priority */}
            <div className="filter-row-grid-4">
              <div>
                <input
                  type="text"
                  placeholder="Search ticket, requester, or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    background: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={requestedPriorityFilter}
                  onChange={(e) => setRequestedPriorityFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    background: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">All requested priorities</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              <div>
                <select
                  value={itPriorityFilter}
                  onChange={(e) => setItPriorityFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    background: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">All IT priorities</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
            </div>

            {/* Row 2: Status, Owner, Assignment, Sort by */}
            <div className="filter-row-grid-4">
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    background: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">All statuses</option>
                  <option value="NEW">NEW</option>
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="WAITING_FOR_REQUESTER">WAITING_FOR_REQUESTER</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="REOPENED">REOPENED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <select
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    background: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">All owners</option>
                </select>
              </div>

              <div>
                <select
                  value={assignmentFilter}
                  onChange={(e) => setAssignmentFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    background: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">All assignments</option>
                  <option value="unassigned">Unassigned</option>
                  <option value="assigned">Assigned</option>
                  <option value="my-assigned">My owned</option>
                </select>
              </div>

              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    background: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="updatedAt">Last updated</option>
                  <option value="createdAt">Created date</option>
                  <option value="itPriority">IT Priority</option>
                  <option value="ticketNumber">Ticket #</option>
                </select>
              </div>
            </div>

            {/* Row 3: Sort order, Apply, Clear */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ width: 180 }}>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    background: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>

              <button
                onClick={handleApplyFilters}
                style={{
                  background: '#006B3C',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#004D2B')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#006B3C')}
              >
                Apply filters
              </button>

              <button
                onClick={handleClearFilters}
                style={{
                  background: '#fff',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '8px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
              >
                Clear filters
              </button>
            </div>

          </div>
        </div>

        {/* Tickets Cards List */}
        {loading ? (
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2ede6', padding: '32px 20px', textAlign: 'center', color: '#789082', fontSize: 13 }}>
            Loading queue tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2ede6', padding: '36px 20px', textAlign: 'center', color: '#789082', fontSize: 13 }}>
            No tickets match the current filters.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tickets.map((t) => (
              <div
                key={t.id}
                style={{
                  background: '#fff',
                  borderRadius: 10,
                  border: '1px solid #e2ede6',
                  padding: '18px 20px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                {/* Top: Ticket Number Link & Status Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectTicket?.(t.id);
                    }}
                    style={{
                      color: '#006B3C',
                      fontWeight: 800,
                      fontSize: 13,
                      textDecoration: 'none',
                      letterSpacing: '-0.01em',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    {t.ticketNumber}
                  </a>
                  <StatusBadge status={t.currentStatus} />
                </div>

                {/* Summary / Title */}
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2d23', marginBottom: 6 }}>
                  {t.summary}
                </div>

                {/* Metadata lines */}
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 3 }}>
                  Requester: {t.requester?.name} ({t.requester?.email})
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 3 }}>
                  Category: {t.category?.name || 'General'} · Requested: {t.requestedPriority} · IT: {t.itPriority}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
                  Owner: {t.owner ? t.owner.name : 'Unassigned'}
                </div>

                {/* Bottom Action Button */}
                <button
                  onClick={() => onSelectTicket?.(t.id)}
                  style={{
                    background: '#006B3C',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '7px 16px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#004D2B')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#006B3C')}
                >
                  View operational detail
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, padding: '12px 0', fontSize: 12, color: '#64748b' }}>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchTickets(pagination.page - 1)}
                style={{
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: pagination.page <= 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchTickets(pagination.page + 1)}
                style={{
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                  opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      <style>{`
        .filter-row-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 767px) {
          .filter-row-grid-4 {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .filter-row-grid-4 {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
