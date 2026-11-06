import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRequester } from '../context/RequesterContext';
import {
  Search,
  PlusCircle,
  RefreshCw,
  Tag,
  AlertCircle,
  HardDrive
} from 'lucide-react';

export interface Category {
  id: number;
  name: string;
}

export interface TicketItem {
  id: number;
  ticketNumber: string;
  summary: string;
  category?: { id: number; name: string };
  relatedSystem?: { id: number; name: string };
  requestedPriority: 'LOW' | 'MEDIUM' | 'HIGH';
  currentStatus: string;
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
  initialFilter?: string | null;
  onNavigateToCreateTicket?: () => void;
  onSelectTicket?: (ticketId: number) => void;
}

export const MyTicketsPage: React.FC<MyTicketsPageProps> = ({
  initialFilter,
  onNavigateToCreateTicket,
  onSelectTicket,
}) => {
  const { user } = useAuth();
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

  // Dashboard filter banner state
  const [dashboardFilter, setDashboardFilter] = useState<string | null>(() => {
    if (!initialFilter) return null;
    if (initialFilter.toUpperCase() === 'OPEN') return 'open tickets';
    if (initialFilter.toUpperCase() === 'WAITING_FOR_REQUESTER') return 'tickets waiting for you';
    if (initialFilter.toUpperCase() === 'RESOLVED') return 'recently resolved tickets';
    return initialFilter;
  });

  // Filters & Sorting state
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>(() => {
    if (initialFilter?.toUpperCase() === 'OPEN') return 'open';
    if (initialFilter) return initialFilter;
    return '';
  });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Fetch active categories
  useEffect(() => {
    fetch('/api/categories', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      })
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  const fetchTickets = useCallback(() => {
    const effectiveUserId = user?.id || activeRequester?.id;
    if (!effectiveUserId) {
      setTickets([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const queryParams = new URLSearchParams();
    if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());
    if (selectedCategory) queryParams.set('category', selectedCategory);
    if (selectedPriority) queryParams.set('requestedPriority', selectedPriority);
    if (selectedStatus) queryParams.set('status', selectedStatus);
    queryParams.set('sortBy', 'createdAt');
    queryParams.set('sortOrder', 'desc');
    queryParams.set('page', String(page));
    queryParams.set('pageSize', String(pageSize));

    fetch(`/api/tickets?${queryParams.toString()}`, {
      credentials: 'include',
      headers: {
        'X-Requester-Id': String(effectiveUserId),
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
              totalItems: (data.data.items || []).length,
              totalPages: 1,
            }
          );
        } else {
          setError(data.error?.message || 'Failed to load tickets');
          setTickets([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching tickets:', err);
        setError('Network error: Unable to load tickets');
        setTickets([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user?.id, activeRequester?.id, searchQuery, selectedCategory, selectedPriority, selectedStatus, page, pageSize]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleClearDashboardFilter = () => {
    setDashboardFilter(null);
    setSelectedStatus('');
    setSearchInput('');
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedPriority('');
    setPage(1);
  };

  const formatDateThai = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const day = d.getDate();
      const year = d.getFullYear() + 543;
      let hours = d.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${month} ${day}, ${year}, ${hours}:${mins} ${ampm}`;
    } catch {
      return isoString;
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'URGENT':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            {priority}
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            LOW
          </span>
        );
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'REOPENED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
            Reopened
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
            In Progress
          </span>
        );
      case 'OPEN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Open
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Resolved
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Closed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const requesterDisplayName = user?.name || activeRequester?.name || 'Sarah Johnson';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Tickets</h1>
          <p className="text-xs text-slate-500 mt-1">
            View and track all IT support tickets submitted by <strong>{requesterDisplayName}</strong>.
          </p>
        </div>

        <button
          onClick={onNavigateToCreateTicket}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006B3C] hover:bg-[#004D2B] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          + Create Ticket
        </button>
      </div>

      {/* Active Dashboard Filter Banner (Image 2: "Drill-down") */}
      {dashboardFilter && (
        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-950 shadow-xs">
          <div>
            Dashboard filter active: <strong className="font-bold">{dashboardFilter}</strong>.
          </div>
          <button
            onClick={handleClearDashboardFilter}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Clear dashboard filter
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-center">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket number or summary..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Categories Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Priorities Dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="">All Priorities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>

          {/* Statuses Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setDashboardFilter(e.target.value ? `status: ${e.target.value}` : null);
              setPage(1);
            }}
            className="w-full md:w-auto px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="">All Statuses</option>
            <option value="open">Open tickets</option>
            <option value="NEW">NEW</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="REOPENED">REOPENED</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <button
            type="submit"
            className="w-full md:w-auto px-4 py-1.5 bg-[#006B3C] hover:bg-[#004D2B] text-white text-xs font-semibold rounded-lg shadow-xs"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Ticket Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin text-emerald-700" /> Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <p>No matching tickets found.</p>
            {dashboardFilter && (
              <button
                onClick={handleClearDashboardFilter}
                className="px-3 py-1 text-xs text-emerald-700 font-semibold underline"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Ticket No.</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">System</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTicket?.(t.id)}
                    className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDateThai(t.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {t.summary}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {t.category?.name || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {t.relatedSystem?.name || '—'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderPriorityBadge(t.requestedPriority)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderStatusBadge(t.currentStatus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer (matches Image 2 bottom) */}
        {!isLoading && tickets.length > 0 && (
          <div className="p-3 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, meta.totalItems)} of {meta.totalItems} tickets
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-white disabled:opacity-40 text-xs"
              >
                ← Previous
              </button>
              <span className="px-2.5 py-1 bg-emerald-800 text-white font-bold rounded text-xs">
                {page}
              </span>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-white disabled:opacity-40 text-xs"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
