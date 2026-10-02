import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle, AlertTriangle, Send, Lock, User, Shield } from 'lucide-react';

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
  requesterResolution?: string;
  requester: { id: number; name: string; email: string };
  owner: { id: number; name: string; email?: string; role: string } | null;
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

  // Form states
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('MEDIUM');
  const [selectedStatus, setSelectedStatus] = useState<string>('IN_PROGRESS');

  const [newComment, setNewComment] = useState('');
  const [newNote, setNewNote] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  // Available IT Staff & Admin list for reassignment
  const [staffUsers, setStaffUsers] = useState<{ id: number; name: string; email: string; role: string }[]>([]);

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
      const t: TicketDetail = data.ticket;
      setTicket(t);
      setSelectedOwnerId(t.owner?.id ? String(t.owner.id) : '');
      setSelectedPriority(t.itPriority || t.requestedPriority || 'MEDIUM');
      setSelectedStatus(t.currentStatus || 'NEW');
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
      // Fallback
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchStaffList();
  }, [ticketId]);

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

  const handleSavePriority = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/staff/tickets/${ticketId}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itPriority: selectedPriority })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || 'Failed to update priority');
      } else {
        setActionSuccess(`IT Priority updated to ${selectedPriority}`);
        fetchTicket();
      }
    } catch {
      setError('Network error updating priority');
    }
  };

  const handleUpdateStatus = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/staff/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: selectedStatus })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || 'Invalid status transition');
      } else {
        setActionSuccess(`Status updated to ${selectedStatus}`);
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

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'CLOSED': return 'bg-slate-100 text-slate-800 border-slate-300';
      default: return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) return <div className="max-w-6xl mx-auto p-12 text-center text-slate-500">Loading ticket detail...</div>;
  if (!ticket) return <div className="max-w-6xl mx-auto p-12 text-center text-slate-500">Ticket not found.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Back to Queue */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800 hover:text-emerald-900 hover:underline"
        >
          ← Back to My Queue
        </button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2 font-medium"><CheckCircle size={16} /> {actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="font-bold text-slate-500 hover:text-slate-800">&times;</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2 font-medium"><AlertTriangle size={16} /> {error}</span>
          <button onClick={() => setError(null)} className="font-bold text-slate-500 hover:text-slate-800">&times;</button>
        </div>
      )}

      {/* Card 1: Top Ticket Header & Metadata */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">{ticket.ticketNumber}</span>
          <span className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${getStatusBadgeStyle(ticket.currentStatus)}`}>
            {ticket.currentStatus.replace('_', ' ')}
          </span>
        </div>

        <h1 className="text-xl font-bold text-slate-900">{ticket.summary}</h1>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 text-xs">
          <div>
            <span className="block text-slate-400 font-medium mb-1">Requester</span>
            <span className="font-semibold text-slate-800 block">{ticket.requester.name}</span>
            <span className="text-slate-400 text-[11px] block">{ticket.requester.email}</span>
          </div>

          <div>
            <span className="block text-slate-400 font-medium mb-1">Category</span>
            <span className="font-semibold text-slate-800">{ticket.category?.name || '—'}</span>
          </div>

          <div>
            <span className="block text-slate-400 font-medium mb-1">Related System</span>
            <span className="font-semibold text-slate-800">{ticket.relatedSystem?.name || '—'}</span>
          </div>

          <div>
            <span className="block text-slate-400 font-medium mb-1">Created</span>
            <span className="font-semibold text-slate-800">{new Date(ticket.createdAt).toLocaleString()}</span>
          </div>

          <div>
            <span className="block text-slate-400 font-medium mb-1">Requested Priority</span>
            <span className={`inline-block px-2.5 py-0.5 font-bold rounded border ${getPriorityBadgeStyle(ticket.requestedPriority)}`}>
              {ticket.requestedPriority}
            </span>
          </div>

          <div>
            <span className="block text-slate-400 font-medium mb-1">Last Updated</span>
            <span className="font-semibold text-slate-800">{new Date(ticket.updatedAt).toLocaleString()}</span>
          </div>

          <div className="col-span-2">
            <span className="block text-slate-400 font-medium mb-1">Requester resolution</span>
            <span className="font-semibold text-slate-800">{ticket.requesterResolution || 'Not reported'}</span>
          </div>
        </div>
      </div>

      {/* Card 2: IT Operations Control Panel (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Owner Control */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Ticket Owner</h3>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Owner</label>
            <select
              value={selectedOwnerId}
              onChange={(e) => {
                setSelectedOwnerId(e.target.value);
                handleAssign(e.target.value);
              }}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">-- Unassigned --</option>
              {staffUsers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.email ? `— ${s.email}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* IT Priority Control */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <h3 className="text-sm font-bold text-slate-800">IT Priority</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">IT Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
            <button
              onClick={handleSavePriority}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              Save priority
            </button>
          </div>
        </div>

        {/* Formal Status Control */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Formal Status</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Next permitted status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="NEW">NEW</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS (current)</option>
                <option value="WAITING_FOR_REQUESTER">WAITING_FOR_REQUESTER</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="REOPENED">REOPENED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <button
              onClick={handleUpdateStatus}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              Update status
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: Description & Attachments */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-2">Description</h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap min-h-[60px]">
            {ticket.description || 'No description provided.'}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">Attachments</h3>
          {(!ticket.attachments || ticket.attachments.length === 0) ? (
            <p className="text-xs text-slate-400">No attachments.</p>
          ) : (
            <div className="space-y-2 pt-2">
              {ticket.attachments.map((att) => (
                <div key={att.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="font-medium text-slate-700">{att.fileName} ({(att.sizeBytes / 1024).toFixed(1)} KB)</span>
                  <a href={`/api/attachments/${att.id}/download`} download className="text-emerald-700 font-bold hover:underline">Download</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card 4: Side-by-Side Public Comments & Internal Notes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Public Comments (Left Column) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Public Comments</h3>
            <p className="text-xs text-slate-500 mb-4">Visible to the Requester, IT Staff, and Administrator.</p>

            <form onSubmit={handleAddPublicComment} className="space-y-3 mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a public update..."
                rows={3}
                maxLength={2000}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{newComment.length}/2000</span>
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                >
                  {submittingComment ? 'Posting...' : 'Post comment'}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {(!ticket.publicComments || ticket.publicComments.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No public comments yet.</p>
              ) : (
                ticket.publicComments.map((c) => (
                  <div key={c.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        {c.author.name}
                        <span className="px-2 py-0.5 text-[10px] bg-slate-200 text-slate-700 font-extrabold rounded uppercase">
                          {c.author.role}
                        </span>
                      </span>
                      <span className="text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Internal Notes (Right Column) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Internal Notes</h3>
            <p className="text-xs text-amber-700 font-semibold mb-4">Internal — visible to IT Staff and Administrators only</p>

            <form onSubmit={handleAddInternalNote} className="space-y-3 mb-6">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add an internal diagnostic note..."
                rows={3}
                maxLength={2000}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{newNote.length}/2000</span>
                <button
                  type="submit"
                  disabled={submittingNote || !newNote.trim()}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                >
                  {submittingNote ? 'Saving...' : 'Post internal note'}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {(!ticket.internalNotes || ticket.internalNotes.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No internal notes recorded yet.</p>
              ) : (
                ticket.internalNotes.map((n) => (
                  <div key={n.id} className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        {n.author.name}
                        <span className="px-2 py-0.5 text-[10px] bg-amber-200 text-amber-900 font-extrabold rounded uppercase">
                          {n.author.role}
                        </span>
                      </span>
                      <span className="text-slate-400">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">{n.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
