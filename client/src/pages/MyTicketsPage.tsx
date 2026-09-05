import React, { useState, useEffect, useCallback } from 'react';
import { useRequester } from '../context/RequesterContext';
import {
  Search,
  PlusCircle,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  Tag,
  AlertCircle,
} from 'lucide-react';

export interface Category {
  id: number;
  name: string;
}

export interface TicketItem {
  id: number;
  ticketNumber: string;
  summary: string;
  category: { id: number; name: string };
  requestedPriority: 'LOW' | 'MEDIUM' | 'HIGH';
  currentStatus: 'NEW' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface MyTicketsPageProps {
  onNavigateToCreateTicket?: () => void;
  onSelectTicket?: (ticketId: number) => void;
}

export const MyTicketsPage: React.FC<MyTicketsPageProps> = ({
  onNavigateToCreateTicket,
  onSelectTicket,
}) => {
  const { activeRequester } = useRequester();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    pageSize: 50,
    totalItems: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting state
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Fetch active categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      })
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  useEffect(() => {
    if (!activeRequester) {
      setTickets([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    setIsLoading(true);
    setError(null);

    const queryParams = new URLSearchParams();
    if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());
    if (selectedCategory) queryParams.set('category', selectedCategory);
    if (selectedPriority) queryParams.set('requestedPriority', selectedPriority);
    if (selectedStatus) queryParams.set('status', selectedStatus);
    if (sortBy) queryParams.set('sortBy', sortBy);
    if (sortOrder) queryParams.set('sortOrder', sortOrder);
    queryParams.set('page', String(page));
    queryParams.set('pageSize', String(pageSize));

    fetch(`/api/tickets?${queryParams.toString()}`, {
      signal,
      headers: {
        'X-Requester-Id': String(activeRequester.id),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setTickets(data.data.items || []);
          setMeta(
            data.data.meta || {
              page,
              pageSize,
              totalItems: 0,
              totalPages: 0,
            }
          );
        } else {
          setError(data.error?.message || 'Failed to load tickets');
          setTickets([]);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Error fetching tickets:', err);
        setError('Network error: Unable to load tickets');
        setTickets([]);
      })
      .finally(() => {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    activeRequester,
    searchQuery,
    selectedCategory,
    selectedPriority,
    selectedStatus,
    sortBy,
    sortOrder,
    page,
    pageSize,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedPriority('');
    setSelectedStatus('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-priority-high-bg)',
              color: 'var(--color-priority-high-text)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-priority-medium-bg)',
              color: 'var(--color-priority-medium-text)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            MEDIUM
          </span>
        );
      case 'LOW':
      default:
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-priority-low-bg)',
              color: 'var(--color-priority-low-text)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            LOW
          </span>
        );
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return (
          <span
            style={{
              padding: '2px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-status-new-bg)',
              color: 'var(--color-status-new-text)',
              border: '1px solid var(--color-status-new-border)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            NEW
          </span>
        );
      case 'OPEN':
        return (
          <span
            style={{
              padding: '2px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#ECFDF5',
              color: '#047857',
              border: '1px solid #A7F3D0',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            OPEN
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span
            style={{
              padding: '2px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              border: '1px solid #BFDBFE',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            IN PROGRESS
          </span>
        );
      case 'RESOLVED':
        return (
          <span
            style={{
              padding: '2px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#F0FDF4',
              color: '#15803D',
              border: '1px solid #BBF7D0',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            RESOLVED
          </span>
        );
      case 'CLOSED':
      default:
        return (
          <span
            style={{
              padding: '2px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#F1F5F9',
              color: '#475569',
              border: '1px solid #CBD5E1',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {status}
          </span>
        );
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FileText size={24} style={{ color: 'var(--color-primary-700)' }} />
            My Tickets
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Manage and track all support tickets submitted by{' '}
            <strong>{activeRequester ? activeRequester.name : 'Unknown User'}</strong>
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={onNavigateToCreateTicket}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <PlusCircle size={18} />
          Create New Ticket
        </button>
      </div>

      {/* Toolbar / Filter Section */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '18px 20px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-divider)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Search Row */}
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search by summary or ticket number (e.g. TKT-2026-000042)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search tickets by summary or number"
              autoComplete="off"
              style={{
                width: '100%',
                paddingLeft: '38px',
                paddingRight: '12px',
                paddingTop: '9px',
                paddingBottom: '9px',
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-divider)',
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            aria-label="Submit search"
            className="btn btn-primary"
            style={{ padding: '9px 16px', fontSize: '0.875rem', fontWeight: 600 }}
          >
            Search
          </button>
        </form>

        {/* Filter Controls Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              <Filter size={16} /> Filters:
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '7px 10px',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-divider)',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '7px 10px',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-divider)',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '7px 10px',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-divider)',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>

            {(searchQuery || selectedCategory || selectedPriority || selectedStatus) && (
              <button
                type="button"
                onClick={handleClearFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary-700)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                }}
              >
                <RefreshCw size={14} /> Clear Filters
              </button>
            )}
          </div>

          {/* Sorting */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '7px 10px',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-divider)',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="createdAt">Date Created</option>
              <option value="ticketNumber">Ticket Number</option>
              <option value="updatedAt">Date Updated</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '7px 10px',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-divider)',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="desc">Desc (Newest)</option>
              <option value="asc">Asc (Oldest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-error-bg)',
            border: '1px solid var(--color-error-base)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-error-text)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Data Table / Content Section */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-divider)',
          overflow: 'hidden',
        }}
      >
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <RefreshCw size={28} className="spin" style={{ marginBottom: '12px', color: 'var(--color-primary-600)' }} />
            <p style={{ fontSize: '0.95rem' }}>Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <FileText size={48} style={{ color: 'var(--color-primary-200)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              No tickets found
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              {searchQuery || selectedCategory || selectedPriority || selectedStatus
                ? 'No tickets match your current filters. Try clearing some filters.'
                : 'You have not submitted any support tickets yet.'}
            </p>
            {searchQuery || selectedCategory || selectedPriority || selectedStatus ? (
              <button className="btn btn-outline" onClick={handleClearFilters} style={{ fontSize: '0.85rem' }}>
                Reset Filters
              </button>
            ) : (
              <button className="btn btn-primary" onClick={onNavigateToCreateTicket} style={{ fontSize: '0.85rem' }}>
                + Create Your First Ticket
              </button>
            )}
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--color-primary-50)',
                    borderBottom: '1px solid var(--color-divider)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Ticket No.</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Summary</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Priority</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTicket?.(t.id)}
                    style={{
                      borderBottom: '1px solid var(--color-divider)',
                      transition: 'background-color 150ms ease-in-out',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--color-primary-700)', fontSize: '0.875rem' }}>
                      {t.ticketNumber}
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--color-text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
                      {t.summary}
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={13} style={{ color: 'var(--color-text-muted)' }} />
                        {t.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>{renderPriorityBadge(t.requestedPriority)}</td>
                    <td style={{ padding: '16px 20px' }}>{renderStatusBadge(t.currentStatus)}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        {formatDate(t.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!isLoading && tickets.length > 0 && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--color-divider)',
              backgroundColor: '#FAFDFB',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Left: Page Size Selector & Total Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                style={{
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-divider)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.85rem',
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>per page</span>
              <span style={{ color: 'var(--color-text-muted)' }}>
                | Showing {meta.totalItems === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1} -{' '}
                {Math.min(meta.page * meta.pageSize, meta.totalItems)} of {meta.totalItems} items
              </span>
            </div>

            {/* Right: Page Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-divider)',
                  backgroundColor: page <= 1 ? '#F1F5F9' : '#FFFFFF',
                  color: page <= 1 ? '#94A3B8' : 'var(--color-text-primary)',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                <ChevronLeft size={16} /> Prev
              </button>

              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Page {meta.page} of {meta.totalPages || 1}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages || 1))}
                disabled={page >= (meta.totalPages || 1)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-divider)',
                  backgroundColor: page >= (meta.totalPages || 1) ? '#F1F5F9' : '#FFFFFF',
                  color: page >= (meta.totalPages || 1) ? '#94A3B8' : 'var(--color-text-primary)',
                  cursor: page >= (meta.totalPages || 1) ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
