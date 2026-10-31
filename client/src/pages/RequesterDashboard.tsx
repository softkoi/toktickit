import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Clock, CheckCircle2, AlertCircle, PlusCircle, ArrowRight, RefreshCw, Folder } from 'lucide-react';

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
  updatedAt: string;
  category?: { id: number; name: string };
}

interface RequesterDashboardProps {
  onNavigateToCreateTicket: () => void;
  onNavigateToMyTickets: (statusFilter?: string) => void;
  onSelectTicket: (ticketId: number) => void;
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
        const data = await res.json().catch(() => ({}));
        setError(data.error?.message || 'Failed to load dashboard metrics');
        return;
      }
      const data = await res.json();
      setMetrics(data.metrics);
      setRecentTickets(data.recentTickets || []);
    } catch {
      setError('Network error loading dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'NEW':
        return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
      case 'OPEN':
        return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
      case 'IN_PROGRESS':
        return { bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff' };
      case 'WAITING_FOR_REQUESTER':
        return { bg: '#ffedd5', color: '#9a3412', border: '#fed7aa' };
      case 'RESOLVED':
        return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
      case 'CLOSED':
        return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
      default:
        return { bg: '#f8f9fa', color: '#495057', border: '#dee2e6' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" data-testid="requester-dashboard">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, <span className="text-emerald-800">{user?.name || 'Requester'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track and monitor the status of your service requests and recent updates.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors w-fit"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Top Metric Cards Grid (4 Columns) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Card 1: My Open Tickets */}
        <div
          data-testid="metric-open-tickets"
          onClick={() => onNavigateToMyTickets('OPEN')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Open Tickets</span>
            <Folder size={18} className="text-emerald-700" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {isLoading ? '...' : metrics?.totalOpenTickets ?? 0}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1 mt-2">
            View active <ArrowRight size={11} />
          </span>
        </div>

        {/* Card 2: In Progress */}
        <div
          data-testid="metric-in-progress"
          onClick={() => onNavigateToMyTickets('IN_PROGRESS')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
            <Clock size={18} className="text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {isLoading ? '...' : metrics?.inProgressTickets ?? 0}
          </div>
          <span className="text-[11px] text-purple-700 font-medium inline-flex items-center gap-1 mt-2">
            View in progress <ArrowRight size={11} />
          </span>
        </div>

        {/* Card 3: Resolved */}
        <div
          data-testid="metric-resolved"
          onClick={() => onNavigateToMyTickets('RESOLVED')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {isLoading ? '...' : metrics?.resolvedTickets ?? 0}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1 mt-2">
            View resolved <ArrowRight size={11} />
          </span>
        </div>

        {/* Card 4: Closed */}
        <div
          data-testid="metric-closed"
          onClick={() => onNavigateToMyTickets('CLOSED')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Closed</span>
            <FileText size={18} className="text-slate-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {isLoading ? '...' : metrics?.closedTickets ?? 0}
          </div>
          <span className="text-[11px] text-slate-600 font-medium inline-flex items-center gap-1 mt-2">
            View history <ArrowRight size={11} />
          </span>
        </div>
      </div>

      {/* Bottom Split: Recent Tickets (70%) & Quick Actions (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Tickets (2 Columns wide on Desktop) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock size={16} className="text-emerald-700" />
              My Recent Tickets
            </h2>
            <button
              onClick={() => onNavigateToMyTickets()}
              className="text-xs text-emerald-800 hover:underline font-semibold"
            >
              View all
            </button>
          </div>

          {isLoading ? (
            <p className="text-xs text-slate-400 py-8 text-center">Loading recent requests...</p>
          ) : recentTickets.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200" data-testid="dashboard-empty-state">
              <Folder size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No tickets found</p>
              <p className="text-xs text-slate-400 mt-1">Submit your first service ticket to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTickets.map((t) => {
                const badge = getStatusBadgeStyle(t.currentStatus || t.status);
                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTicket(t.id)}
                    className="p-4 bg-slate-50/70 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100/60 px-2 py-0.5 rounded">
                          {t.ticketNumber}
                        </span>
                        {t.category && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            • {t.category.name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">{t.summary}</h3>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Updated: {new Date(t.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      style={{ backgroundColor: badge.bg, color: badge.color, borderColor: badge.border }}
                      className="px-2.5 py-1 text-xs font-bold rounded-full border shrink-0 uppercase tracking-wider"
                    >
                      {(t.currentStatus || t.status).replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Quick Actions Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-2">Quick Actions</h2>
            <p className="text-xs text-slate-500 mb-6">Need help or want to inspect your past requests?</p>

            <div className="space-y-3">
              <button
                onClick={onNavigateToCreateTicket}
                data-testid="quick-action-create-ticket"
                className="w-full flex items-center justify-between p-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                <span className="flex items-center gap-2">
                  <PlusCircle size={16} />
                  Submit New Request
                </span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => onNavigateToMyTickets()}
                data-testid="quick-action-view-tickets"
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText size={16} className="text-slate-600" />
                  View All My Tickets
                </span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
            <span className="font-bold block">Need immediate assistance?</span>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              For system-wide outages or critical IT emergencies, please contact the IT Helpdesk hotline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
