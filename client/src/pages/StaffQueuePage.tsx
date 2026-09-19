import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, ChevronRight, User, Eye, RefreshCw } from 'lucide-react';

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
  onSelectTicket?: (id: number) => void;
}

export const StaffQueuePage: React.FC<StaffQueueProps> = ({ onSelectTicket }) => {
  const [tickets, setTickets] = useState<StaffTicketItem[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchTickets = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        page: String(page),
        pageSize: '10',
        search,
        sortBy,
        sortOrder,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(priorityFilter ? { priority: priorityFilter } : {}),
        ...(ownerFilter ? { ownerId: ownerFilter } : {})
      });

      const res = await fetch(`/api/staff/tickets?${query.toString()}`, { credentials: 'include' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || 'Failed to fetch ticket queue');
        return;
      }

      const resData = await res.json();
      setTickets(resData.data || []);
      setPagination(resData.pagination || { total: 0, page: 1, pageSize: 10, totalPages: 1 });
    } catch {
      setError('Network error fetching ticket queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(1);
  }, [search, statusFilter, priorityFilter, ownerFilter, sortBy, sortOrder]);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OPEN': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'WAITING_FOR_REQUESTER': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'REOPENED': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">IT Staff Ticket Queue</h1>
          <p className="text-sm text-slate-500">Operational queue for tracking, claiming, and updating helpdesk tickets</p>
        </div>
        <button
          onClick={() => fetchTickets(pagination.page)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2 self-start"
        >
          <RefreshCw size={16} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticket #, summary, or description..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
          >
            <option value="">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="WAITING_FOR_REQUESTER">WAITING_FOR_REQUESTER</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="REOPENED">REOPENED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
          >
            <option value="">All Priorities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>

          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
          >
            <option value="">All Owners</option>
            <option value="unassigned">Unassigned</option>
          </select>

          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split(':');
              setSortBy(sb);
              setSortOrder(so);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="itPriority:desc">Highest Priority</option>
            <option value="ticketNumber:asc">Ticket # (Asc)</option>
          </select>
        </div>
      </div>

      {/* Desktop Data Table */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading queue tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No tickets found in queue matching filters.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Ticket #</th>
                <th className="py-3.5 px-4">Summary & Category</th>
                <th className="py-3.5 px-4">Requester</th>
                <th className="py-3.5 px-4">IT Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Owner</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-800 text-xs">
                    {t.ticketNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 line-clamp-1">{t.summary}</div>
                    <div className="text-xs text-slate-400">{t.category?.name} • {t.relatedSystem?.name}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-800 font-medium">{t.requester?.name}</div>
                    <div className="text-xs text-slate-400">{t.requester?.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 text-xs rounded border ${getPriorityBadgeStyle(t.itPriority)}`}>
                      {t.itPriority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeStyle(t.currentStatus)}`}>
                      {t.currentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {t.owner ? (
                      <span className="font-medium text-slate-700">{t.owner.name}</span>
                    ) : (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectTicket?.(t.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Desktop Pagination */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>Showing {tickets.length} of {pagination.total} tickets</div>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchTickets(pagination.page - 1)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 font-medium"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 font-semibold text-slate-700">Page {pagination.page} of {pagination.totalPages}</span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchTickets(pagination.page + 1)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No tickets found.</div>
        ) : (
          tickets.map((t) => (
            <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-800">{t.ticketNumber}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadgeStyle(t.currentStatus)}`}>
                  {t.currentStatus}
                </span>
              </div>
              <div className="font-bold text-slate-800 text-sm">{t.summary}</div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Requester: {t.requester?.name}</span>
                <span className={`px-2 py-0.5 rounded border ${getPriorityBadgeStyle(t.itPriority)}`}>
                  IT: {t.itPriority}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Owner: {t.owner ? t.owner.name : 'Unassigned'}</span>
                <button
                  onClick={() => onSelectTicket?.(t.id)}
                  className="px-3 py-1.5 bg-emerald-700 text-white font-medium rounded-lg"
                >
                  Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
