import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Shield, MessageSquare, Lock, AlertTriangle, Send, CheckCircle, RefreshCw } from 'lucide-react';

interface CommentItem {
  id: number;
  content: string;
  createdAt: string;
  author: { id: number; name: string; role: string };
}

interface NoteItem {
  id: number;
  content: string;
  createdAt: string;
  author: { id: number; name: string; role: string };
}

interface TicketDetail {
  id: number;
  ticketNumber: string;
  summary: string;
  description: string;
  requestedPriority: string;
  itPriority: string;
  currentStatus: string;
  createdAt: string;
  updatedAt: string;
  requester: { id: number; name: string; email: string };
  owner: { id: number; name: string; role: string } | null;
  category: { id: number; name: string };
  relatedSystem: { id: number; name: string };
  attachments: { id: number; fileName: string; sizeBytes: number; mimeType: string }[];
  publicComments: CommentItem[];
  internalNotes: NoteItem[];
}

interface StaffTicketDetailProps {
  ticketId: number;
  onBack: () => void;
}

export const StaffTicketDetailPage: React.FC<StaffTicketDetailProps> = ({ ticketId, onBack }) => {
  const { user } = useAuth();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Active Tab: 'public' or 'internal'
  const [activeTab, setActiveTab] = useState<'public' | 'internal'>('public');

  // Comment & Note forms
  const [newComment, setNewComment] = useState('');
  const [newNote, setNewNote] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  // Available IT Staff & Admin list for reassignment
  const [staffUsers, setStaffUsers] = useState<{ id: number; name: string; role: string }[]>([]);

  const fetchTicket = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/staff/tickets/${ticketId}`, { credentials: 'include' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || 'Failed to load ticket detail');
        return;
      }
      const data = await res.json();
      setTicket(data.ticket);
    } catch {
      setError('Network error fetching ticket detail');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const res = await fetch('/api/admin/users?pageSize=100', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const filtered = (data.data || []).filter((u: any) => u.isActive && (u.role === 'IT_STAFF' || u.role === 'ADMINISTRATOR'));
        setStaffUsers(filtered);
      }
    } catch {
      // Fallback if user is not admin
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchStaffList();
  }, [ticketId]);

  const handleClaim = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/staff/tickets/${ticketId}/claim`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || 'Failed to claim ticket');
      } else {
        setActionSuccess('You claimed this ticket successfully');
        fetchTicket();
      }
    } catch {
      setError('Network error claiming ticket');
    }
  };

  const handleAssign = async (newOwnerId: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/staff/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ownerId: newOwnerId ? Number(newOwnerId) : null })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || 'Failed to reassign ticket');
      } else {
        setActionSuccess('Ticket ownership updated');
        fetchTicket();
      }
    } catch {
      setError('Network error reassigning ticket');
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/staff/tickets/${ticketId}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itPriority: newPriority })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || 'Failed to update priority');
      } else {
        setActionSuccess(`IT Priority updated to ${newPriority}`);
        fetchTicket();
      }
    } catch {
      setError('Network error updating priority');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/staff/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || 'Invalid status transition');
      } else {
        setActionSuccess(`Status updated to ${newStatus}`);
        fetchTicket();
      }
    } catch {
      setError('Network error updating status');
    }
  };

  const handleAddPublicComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    setError(null);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newComment })
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || 'Failed to add comment');
      } else {
        setNewComment('');
        setActionSuccess('Public comment added');
        fetchTicket();
      }
    } catch {
      setError('Network error posting comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    setError(null);

    try {
      const res = await fetch(`/api/staff/tickets/${ticketId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newNote })
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || 'Failed to add internal note');
      } else {
        setNewNote('');
        setActionSuccess('Internal note added');
        fetchTicket();
      }
    } catch {
      setError('Network error posting internal note');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto p-12 text-center text-slate-500">Loading ticket detail...</div>;
  if (!ticket) return <div className="max-w-5xl mx-auto p-12 text-center text-slate-500">Ticket not found.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-800 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Queue
      </button>

      {/* Banners */}
      {actionSuccess && (
        <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm rounded flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle size={16} /> {actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="font-bold">&times;</button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded flex items-center justify-between">
          <span className="flex items-center gap-2"><AlertTriangle size={16} /> {error}</span>
          <button onClick={() => setError(null)} className="font-bold">&times;</button>
        </div>
      )}

      {/* Ticket Header & Operations Control Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              {ticket.ticketNumber}
            </span>
            <h1 className="text-xl font-bold text-slate-800 mt-2">{ticket.summary}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Status:</span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full border border-emerald-300">
              {ticket.currentStatus}
            </span>
          </div>
        </div>

        {/* Quick Operations Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-2">
          {/* Claim Button */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">Owner Claim</span>
            <button
              onClick={handleClaim}
              className="py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
            >
              Claim Ticket (Assign to Me)
            </button>
          </div>

          {/* Reassign Owner */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">Reassign Owner</span>
            <select
              value={ticket.owner?.id || ''}
              onChange={(e) => handleAssign(e.target.value)}
              className="py-2 px-3 border border-slate-300 rounded-lg text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Unassigned --</option>
              {staffUsers.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
              ))}
            </select>
          </div>

          {/* IT Priority Selector */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">IT Priority</span>
            <select
              value={ticket.itPriority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="py-2 px-3 border border-slate-300 rounded-lg text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>

          {/* Status State Machine Transition */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">Change Status</span>
            <select
              value={ticket.currentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="py-2 px-3 border border-slate-300 rounded-lg text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
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
        </div>
      </div>

      {/* Ticket Details Body */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4 pb-2 border-b border-slate-100">Ticket Description & Info</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-xs">
          <div><span className="text-slate-400">Requester:</span> <span className="font-semibold text-slate-800">{ticket.requester.name}</span></div>
          <div><span className="text-slate-400">Category:</span> <span className="font-semibold text-slate-800">{ticket.category.name}</span></div>
          <div><span className="text-slate-400">System:</span> <span className="font-semibold text-slate-800">{ticket.relatedSystem.name}</span></div>
          <div><span className="text-slate-400">Requested Priority:</span> <span className="font-semibold text-slate-800">{ticket.requestedPriority}</span></div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
          {ticket.description}
        </div>
      </div>

      {/* Tabbed Communication Section: Public Comments vs Internal Notes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('public')}
            className={`flex-1 py-3 px-4 font-semibold text-sm flex items-center justify-center gap-2 transition-colors border-b-2 ${
              activeTab === 'public'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageSquare size={16} />
            <span>Public Comments ({ticket.publicComments?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('internal')}
            className={`flex-1 py-3 px-4 font-semibold text-sm flex items-center justify-center gap-2 transition-colors border-b-2 ${
              activeTab === 'internal'
                ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Lock size={16} className="text-amber-600" />
            <span className="text-amber-900 font-bold">Internal Notes ({ticket.internalNotes?.length || 0})</span>
            <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Private</span>
          </button>
        </div>

        {/* Tab Content: Public Comments */}
        {activeTab === 'public' && (
          <div className="p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Public Ticket Conversation (Visible to Requester)</h3>
            <div className="space-y-4 mb-6">
              {(!ticket.publicComments || ticket.publicComments.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No public comments yet.</p>
              ) : (
                ticket.publicComments.map((c) => (
                  <div key={c.id} className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-900">{c.author.name} ({c.author.role})</span>
                      <span className="text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Public Comment Form */}
            <form onSubmit={handleAddPublicComment} className="space-y-3 pt-4 border-t border-slate-100">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a public comment for the requester..."
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5"
              >
                <Send size={13} /> {submittingComment ? 'Posting...' : 'Post Public Comment'}
              </button>
            </form>
          </div>
        )}

        {/* Tab Content: Internal Notes */}
        {activeTab === 'internal' && (
          <div className="p-6 bg-amber-50/20">
            <div className="mb-4 p-3 bg-amber-100/70 border-l-4 border-amber-500 text-amber-900 text-xs rounded-lg flex items-center gap-2 font-medium">
              <Lock size={14} className="text-amber-700" />
              <span>PRIVATE INTERNAL NOTES: Restricted strictly to IT Staff and Administrators. Requesters can NEVER view or access notes in this section.</span>
            </div>

            <div className="space-y-4 mb-6">
              {(!ticket.internalNotes || ticket.internalNotes.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No internal notes recorded yet.</p>
              ) : (
                ticket.internalNotes.map((n) => (
                  <div key={n.id} className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl space-y-1 shadow-sm">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <Shield size={12} className="text-amber-600" /> {n.author.name} ({n.author.role})
                      </span>
                      <span className="text-amber-700 text-[11px]">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{n.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Internal Note Form */}
            <form onSubmit={handleAddInternalNote} className="space-y-3 pt-4 border-t border-amber-200">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a private internal note for IT Staff/Admin..."
                rows={3}
                className="w-full p-3 border border-amber-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                required
              />
              <button
                type="submit"
                disabled={submittingNote || !newNote.trim()}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Lock size={13} /> {submittingNote ? 'Saving...' : 'Add Internal Note'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
