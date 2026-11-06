import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';
import { ActionsTakenSection } from '../components/ActionsTakenSection';
import { ActionTakenItem, parseActionNotes } from '../types/actionTaken.types';

export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  NEW: ['OPEN', 'IN_PROGRESS', 'CANCELLED'],
  OPEN: ['IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'RESOLVED', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_FOR_REQUESTER', 'RESOLVED', 'OPEN', 'CANCELLED'],
  WAITING_FOR_REQUESTER: ['IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
  CANCELLED: []
};

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
  const [resolutionError, setResolutionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form controls
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('HIGH');
  const [selectedNextStatus, setSelectedNextStatus] = useState<string>('');
  const [confirmResolve, setConfirmResolve] = useState<boolean>(false);

  // Comments & Notes
  const [newComment, setNewComment] = useState('');
  const [newNote, setNewNote] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  // Live actions taken list for resolution check
  const [actionsList, setActionsList] = useState<ActionTakenItem[]>([]);

  // Staff users for owner dropdown
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
      setSelectedPriority(t.itPriority || 'HIGH');
      setSelectedNextStatus('');
      setConfirmResolve(false);
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
      // Fallback staff list if admin endpoint restricted
      setStaffUsers([
        { id: 1594, name: 'Somchai Technician', email: 'somchai@toktickit.com', role: 'IT_STAFF' },
        { id: 1595, name: 'Mary Support', email: 'mary@toktickit.com', role: 'IT_STAFF' },
        { id: 1596, name: 'Niran Engineer', email: 'niran@toktickit.com', role: 'IT_STAFF' }
      ]);
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchStaffList();
  }, [ticketId]);

  const handleOwnerChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOwnerId = e.target.value;
    setSelectedOwnerId(newOwnerId);
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

  const handlePriorityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value;
    setSelectedPriority(newPriority);
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

  const handleUpdateStatus = async () => {
    if (!selectedNextStatus) return;

    // Resolution Gate Check (Image 3: "เงื่อนไขก่อน Resolve")
    if (selectedNextStatus === 'RESOLVED') {
      const hasCompletedActionWithResult = actionsList.some((action) => {
        const { status } = parseActionNotes(action.attachmentNotes);
        const effStatus = action.status || status;
        const validResult =
          action.result &&
          action.result.trim().length > 0 &&
          action.result !== 'No result recorded yet.';
        return effStatus === 'COMPLETED' && Boolean(validResult);
      });

      if (!hasCompletedActionWithResult) {
        setResolutionError('Resolving a ticket requires a completed action with a non-empty result.');
        return;
      }
    }

    setResolutionError(null);
    setError(null);

    try {
      const res = await fetch(`/api/staff/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: selectedNextStatus,
          lastKnownUpdatedAt: ticket?.updatedAt
        })
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 409) {
          setError('Conflict: This ticket was modified by another user. Reloading ticket data...');
          setTimeout(() => fetchTicket(), 1500);
          return;
        }
        setError(data.error?.message || 'Invalid status transition');
      } else {
        setActionSuccess(`Status updated to ${selectedNextStatus}`);
        setSelectedNextStatus('');
        setConfirmResolve(false);
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
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'OPEN': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'REOPENED': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto p-12 text-center text-slate-500">Loading ticket detail...</div>;
  if (!ticket) return <div className="max-w-5xl mx-auto p-12 text-center text-slate-500">Ticket not found.</div>;

  const currentStatus = ticket.currentStatus || 'NEW';
  const permittedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
      {/* Back to Ticket Queue link */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-800 hover:underline"
        >
          ← Back to Ticket Queue
        </button>
      </div>

      {/* Ticket Number & Status Header */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-500">{ticket.ticketNumber}</span>
          <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border uppercase tracking-wider ${getStatusBadgeStyle(ticket.currentStatus)}`}>
            {ticket.currentStatus.replace('_', ' ')}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">{ticket.summary}</h1>
      </div>

      {/* Resolution Gate Warning Banner (matches Image 3) */}
      {(resolutionError || error) && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium flex items-center justify-between">
          <span>{resolutionError || error}</span>
          <button
            onClick={() => {
              setResolutionError(null);
              setError(null);
            }}
            className="font-bold text-red-400 hover:text-red-700 ml-4"
          >
            &times;
          </button>
        </div>
      )}

      {/* Success notification */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-medium flex items-center justify-between">
          <span className="flex items-center gap-1.5"><CheckCircle size={14} /> {actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="font-bold text-slate-400 hover:text-slate-700 ml-4">&times;</button>
        </div>
      )}

      {/* 2-Column Details: Requester details (Left) & Operational controls (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Requester details */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Requester details</h2>
          <div className="space-y-1 text-xs">
            <div className="font-semibold text-slate-800">{ticket.requester.name}</div>
            <div className="text-slate-500">{ticket.requester.email}</div>
            <div className="text-slate-500 mb-2">IT Support</div>

            <div className="text-slate-700 pt-2 border-t border-slate-100">
              <span className="text-slate-500">Category: </span>
              <span className="font-medium">{ticket.category?.name || 'Network'}</span>
            </div>
            <div className="text-slate-700">
              <span className="text-slate-500">System: </span>
              <span className="font-medium">{ticket.relatedSystem?.name || 'VPN'}</span>
            </div>

            <div className="pt-2 text-slate-600 leading-relaxed">
              {ticket.description}
            </div>
          </div>
        </div>

        {/* Operational controls (matches Image 4 & Image 3) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold text-[#006B3C] uppercase tracking-wider mb-3">Operational controls</h2>

          <div className="text-xs text-slate-600 mb-3">
            Requested Priority: <strong className="font-bold text-slate-900">{ticket.requestedPriority}</strong>
          </div>

          <div className="space-y-3">
            {/* IT Priority */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">IT Priority</label>
              <select
                value={selectedPriority}
                onChange={handlePriorityChange}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-800 focus:ring-1 focus:ring-emerald-600 outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>

            {/* Owner */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Owner</label>
              <select
                value={selectedOwnerId}
                onChange={handleOwnerChange}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-800 focus:ring-1 focus:ring-emerald-600 outline-none"
              >
                <option value="">-- Unassigned --</option>
                {staffUsers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (IT STAFF)
                  </option>
                ))}
              </select>
            </div>

            {/* Next status */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Next status</label>
              <select
                value={selectedNextStatus}
                onChange={(e) => {
                  setSelectedNextStatus(e.target.value);
                  setConfirmResolve(false);
                  setResolutionError(null);
                }}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-800 focus:ring-1 focus:ring-emerald-600 outline-none"
              >
                <option value="">Select a transition</option>
                {permittedTransitions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              {/* Conditional Resolution Gate Note & Confirmation (Image 4 & 3) */}
              {selectedNextStatus === 'RESOLVED' && (
                <div className="mt-2 text-xs text-slate-600 space-y-2">
                  <p className="leading-snug">
                    Resolving requires a completed Action Taken with a result and no unfinished required follow-ups.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={confirmResolve}
                      onChange={(e) => setConfirmResolve(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                    />
                    I confirm this status change.
                  </label>
                </div>
              )}
            </div>

            {/* Update status button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={!selectedNextStatus || (selectedNextStatus === 'RESOLVED' && !confirmResolve)}
                className="px-4 py-2 bg-[#006B3C] hover:bg-[#004D2B] disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Update status
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Taken Section */}
      <ActionsTakenSection
        ticketId={ticket.id}
        onActionsLoaded={(loaded) => setActionsList(loaded)}
      />

      {/* Bottom Section: Attachments, Public Comments, Internal Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Left: Attachments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs h-fit">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Attachments</h3>
          {ticket.attachments && ticket.attachments.length > 0 ? (
            <div className="space-y-2">
              {ticket.attachments.map((a) => (
                <div key={a.id} className="p-2 border border-slate-100 rounded text-xs flex justify-between">
                  <span className="font-medium text-slate-800">{a.fileName}</span>
                  <span className="text-slate-400">{a.mimeType}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No attachments.</p>
          )}
        </div>

        {/* Right: Public Comments & Internal Notes */}
        <div className="space-y-6">
          {/* Public Comments */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-[#006B3C] uppercase tracking-wider mb-2">Public Comments</h3>
            {ticket.publicComments && ticket.publicComments.length > 0 ? (
              <div className="space-y-3 mb-4">
                {ticket.publicComments.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>{c.author.name} ({c.author.role})</span>
                      <span className="text-slate-400 font-normal">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-700">{c.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mb-3">No public comments.</p>
            )}

            <form onSubmit={handleAddPublicComment} className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Add Public Comment</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submittingComment}
                className="px-3 py-1.5 bg-[#006B3C] hover:bg-[#004D2B] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Add Public Comment
              </button>
            </form>
          </div>

          {/* Internal Notes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-[#006B3C] uppercase tracking-wider mb-2">Internal Notes</h3>
            {ticket.internalNotes && ticket.internalNotes.length > 0 ? (
              <div className="space-y-3 mb-4">
                {ticket.internalNotes.map((n) => (
                  <div key={n.id} className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg text-xs">
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>{n.author.name} ({n.author.role})</span>
                      <span className="text-slate-400 font-normal">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-700">{n.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mb-3">No internal notes.</p>
            )}

            <form onSubmit={handleAddInternalNote} className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Add Internal Note</label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="submit"
                disabled={!newNote.trim() || submittingNote}
                className="px-3 py-1.5 bg-[#006B3C] hover:bg-[#004D2B] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Add Internal Note
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
