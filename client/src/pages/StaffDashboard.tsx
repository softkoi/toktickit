import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Clock, Users, PlusCircle, ArrowRight, RefreshCw, Folder, UserCheck, Inbox } from 'lucide-react';

interface StaffMetrics {
  newCount: number;
  openCount: number;
  inProgressCount: number;
  waitingForRequesterCount: number;
  resolvedCount: number;
  closedCount: number;
  myAssignedCount: number;
  unassignedCount: number;
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
  onNavigateToQueue: (statusFilter?: string) => void;
  onNavigateToCreateTicket: () => void;
  onSelectTicket: (ticketId: number) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  onNavigateToQueue,
  onNavigateToCreateTicket,
  onSelectTicket,
}) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<StaffMetrics | null>(null);
  const [recentTickets, setRecentTickets] = useState<RecentTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/staff', { credentials: 'include' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error?.message || 'Failed to load staff dashboard');
        return;
      }
      const data = await res.json();
      setMetrics(data.metrics);
      setRecentTickets(data.recentTickets || []);
    } catch {
      setError('Network error fetching staff dashboard');
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

  const getPriorityBadgeStyle = (priority?: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
      case 'LOW':
        return 'bg-slate-50 text-slate-600 border-slate-200 font-medium';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" data-testid="staff-dashboard">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, <span className="text-emerald-800">{user?.name || 'Staff Member'}</span>
            </h1>
            <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
              {user?.role === 'ADMINISTRATOR' ? 'Administrator' : 'IT Staff'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Operational dashboard and queue management summary.
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
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded">
          {error}
        </div>
      )}

      {/* Top 5-Column Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-8">
        {/* Card 1: New */}
        <div
          data-testid="metric-card-new"
          onClick={() => onNavigateToQueue('NEW')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">New</span>
            <Inbox size={16} className="text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {isLoading ? '...' : metrics?.newCount ?? 0}
          </div>
          <span className="text-[10px] text-sky-700 font-semibold inline-flex items-center gap-1 mt-1.5">
            View queue <ArrowRight size={10} />
          </span>
        </div>

        {/* Card 2: Open */}
        <div
          data-testid="metric-card-open"
          onClick={() => onNavigateToQueue('OPEN')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Open</span>
            <Folder size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {isLoading ? '...' : metrics?.openCount ?? 0}
          </div>
          <span className="text-[10px] text-amber-700 font-semibold inline-flex items-center gap-1 mt-1.5">
            View queue <ArrowRight size={10} />
          </span>
        </div>

        {/* Card 3: In Progress */}
        <div
          data-testid="metric-card-inprogress"
          onClick={() => onNavigateToQueue('IN_PROGRESS')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
            <Clock size={16} className="text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {isLoading ? '...' : metrics?.inProgressCount ?? 0}
          </div>
          <span className="text-[10px] text-purple-700 font-semibold inline-flex items-center gap-1 mt-1.5">
            View active <ArrowRight size={10} />
          </span>
        </div>

        {/* Card 4: Waiting for Requester */}
        <div
          data-testid="metric-card-waiting"
          onClick={() => onNavigateToQueue('WAITING_FOR_REQUESTER')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-orange-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Waiting</span>
            <Clock size={16} className="text-orange-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {isLoading ? '...' : metrics?.waitingForRequesterCount ?? 0}
          </div>
          <span className="text-[10px] text-orange-700 font-semibold inline-flex items-center gap-1 mt-1.5">
            View pending <ArrowRight size={10} />
          </span>
        </div>

        {/* Card 5: My Assigned */}
        <div
          data-testid="metric-card-myassigned"
          onClick={() => onNavigateToQueue('my-assigned')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">My Assigned</span>
            <UserCheck size={16} className="text-emerald-700" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {isLoading ? '...' : metrics?.myAssignedCount ?? 0}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold inline-flex items-center gap-1 mt-1.5">
            My tickets <ArrowRight size={10} />
          </span>
        </div>
      </div>

      {/* Bottom Split Layout: Recent Tickets Table (70%) & Quick Actions (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: Recent Tickets */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock size={16} className="text-emerald-700" />
              Recent Service Tickets
            </h2>
            <button
              onClick={() => onNavigateToQueue()}
              className="text-xs text-emerald-800 hover:underline font-semibold"
            >
              Full Queue
            </button>
          </div>

          {isLoading ? (
            <p className="text-xs text-slate-400 py-8 text-center">Loading queue tickets...</p>
          ) : recentTickets.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No active tickets found.</p>
          ) : (
            <div className="space-y-3">
              {recentTickets.map((t) => {
                const badge = getStatusBadgeStyle(t.currentStatus || t.status);
                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTicket(t.id)}
                    className="p-3.5 bg-slate-50/70 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100/60 px-2 py-0.5 rounded">
                          {t.ticketNumber}
                        </span>
                        {t.requester && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            • {t.requester.name}
                          </span>
                        )}
                        {t.assignedTo && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            • Assigned to: <strong className="text-slate-700">{t.assignedTo.name}</strong>
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">{t.summary}</h3>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Updated: {new Date(t.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {(t.itPriority || t.requestedPriority) && (
                        <span
                          data-testid={`priority-badge-${t.id}`}
                          className={`px-2 py-0.5 text-[10px] rounded-full border uppercase tracking-wider ${getPriorityBadgeStyle(t.itPriority || t.requestedPriority)}`}
                        >
                          {t.itPriority || t.requestedPriority}
                        </span>
                      )}
                      <span
                        style={{ backgroundColor: badge.bg, color: badge.color, borderColor: badge.border }}
                        className="px-2.5 py-1 text-xs font-bold rounded-full border shrink-0 uppercase tracking-wider"
                      >
                        {(t.currentStatus || t.status).replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Section: Quick Actions Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-2">Operational Actions</h2>
            <p className="text-xs text-slate-500 mb-6">Quick shortcuts to common service desk workflows.</p>

            <div className="space-y-3">
              <button
                onClick={onNavigateToCreateTicket}
                data-testid="quick-action-staff-create"
                className="w-full flex items-center justify-between p-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                <span className="flex items-center gap-2">
                  <PlusCircle size={16} />
                  Log New Ticket
                </span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => onNavigateToQueue()}
                data-testid="quick-action-staff-queue"
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Shield size={16} className="text-slate-600" />
                  Open Ticket Queue
                </span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Admin System Metrics Callout if user is Admin */}
          {user?.role === 'ADMINISTRATOR' && (
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Users size={14} />
                User Accounts
              </span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Active System Users: <strong>{metrics?.userAccountsCount ?? '—'}</strong> active accounts managed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
