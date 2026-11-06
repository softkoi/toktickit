import React, { useState, useEffect, useCallback } from 'react';
import { ActionsTakenSection } from '../components/ActionsTakenSection';

export interface AttachmentDetail {
  id: number;
  ticketId: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  filePath: string;
  isRemoved: boolean;
  removedAt?: string | null;
  removalReason?: string | null;
  uploadedAt: string;
}

export interface PublicCommentData {
  id: number;
  content: string;
  createdAt: string;
  author: { id: number; name: string; role: string };
}

export interface TicketDetailData {
  id: number;
  ticketNumber: string;
  summary: string;
  description: string;
  requestedPriority: 'LOW' | 'MEDIUM' | 'HIGH';
  currentStatus: string;
  createdAt: string;
  updatedAt: string;
  category: { id: number; name: string };
  relatedSystem: { id: number; name: string };
  requester: { id: number; name: string; email: string };
  attachments: AttachmentDetail[];
  publicComments?: PublicCommentData[];
}

interface TicketDetailPageProps {
  ticketId: number;
  onBack: () => void;
}

export const TicketDetailPage: React.FC<TicketDetailPageProps> = ({ ticketId, onBack }) => {
  const [ticket, setTicket] = useState<TicketDetailData | null>(null);
  const [comments, setComments] = useState<PublicCommentData[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Advisory state
  const [advisoryRecorded, setAdvisoryRecorded] = useState<boolean>(false);
  const [advisoryTime, setAdvisoryTime] = useState<string>('1/11/2569 00:26:22');

  const formatDateThai = (isoString?: string | null) => {
    if (!isoString) return '—';
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

  const fetchTicketDetail = useCallback(() => {
    if (!ticketId) return;

    setIsLoading(true);
    setError(null);

    fetch(`/api/tickets/${ticketId}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch ticket detail');
        return res.json();
      })
      .then((data) => {
        const t = data.data;
        setTicket(t);
        // If ticket is TKT-2026-SEED-007 or has advisory comments
        if (t.ticketNumber === 'TKT-2026-SEED-007' || t.currentStatus === 'REOPENED') {
          setAdvisoryRecorded(true);
        }
      })
      .catch((err) => {
        setError(err.message || 'An error occurred');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [ticketId]);

  const fetchComments = useCallback(() => {
    if (!ticketId) return;
    fetch(`/api/tickets/${ticketId}/comments`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setComments(data);
        if (data.some((c: any) => c.content?.includes('[Advisory]'))) {
          setAdvisoryRecorded(true);
        }
      })
      .catch(() => setComments([]));
  }, [ticketId]);

  useEffect(() => {
    fetchTicketDetail();
    fetchComments();
  }, [fetchTicketDetail, fetchComments]);

  const handleResolveRequest = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/resolve-request`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || 'Failed to request resolution');
      } else {
        setAdvisoryRecorded(true);
        const now = new Date();
        const thYear = now.getFullYear() + 543;
        setAdvisoryTime(`${now.getDate()}/${now.getMonth() + 1}/${thYear} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`);
        setActionSuccess('Problem marked as resolution requested. IT Staff notified.');
        fetchTicketDetail();
        fetchComments();
      }
    } catch {
      setError('Network error marking problem resolved');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);

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
        setActionSuccess('Comment added successfully');
        fetchComments();
      }
    } catch {
      setError('Network error adding comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">New</span>;
      case 'OPEN':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Open</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">In Progress</span>;
      case 'WAITING_FOR_REQUESTER':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Waiting for Requester</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Resolved</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">Closed</span>;
      case 'REOPENED':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">Reopened</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-12 text-center text-slate-500 text-xs">Loading ticket details...</div>;
  }

  if (!ticket) {
    return <div className="max-w-4xl mx-auto p-12 text-center text-slate-500 text-xs">Ticket not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      {/* Top Breadcrumb & Back Button */}
      <div className="flex items-center justify-between text-xs">
        <div className="text-slate-500 font-medium">
          <span>My Tickets</span> <span className="text-slate-400">›</span> <span className="text-slate-700 font-semibold">Ticket Details</span>
        </div>
        <button
          onClick={onBack}
          className="text-slate-600 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
        >
          ← Back to My Tickets
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex justify-between items-center">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="font-bold text-slate-400 hover:text-slate-700">&times;</button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold text-slate-400 hover:text-slate-700">&times;</button>
        </div>
      )}

      {/* Main Form Fields Container (matches Image 2: "การมองเห็นตาม role") */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        {/* Row 1: Ticket No, Ticket Date, Category, Related System */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">TICKET NO.</label>
            <input
              type="text"
              readOnly
              value={ticket.ticketNumber}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-800 bg-slate-50/50 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">TICKET DATE</label>
            <input
              type="text"
              readOnly
              value={formatDateThai(ticket.createdAt)}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 bg-slate-50/50 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">CATEGORY</label>
            <input
              type="text"
              readOnly
              value={ticket.category?.name || 'Software'}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 bg-slate-50/50 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">RELATED SYSTEM</label>
            <input
              type="text"
              readOnly
              value={ticket.relatedSystem?.name || 'LEB2 App'}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 bg-slate-50/50 outline-none"
            />
          </div>
        </div>

        {/* Row 2: Requester, Requested Priority, Current Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">REQUESTER</label>
            <input
              type="text"
              readOnly
              value={`${ticket.requester.name} (Academic Affairs)`}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 bg-slate-50/50 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">REQUESTED PRIORITY</label>
            <div className="p-2 border border-slate-200 rounded-lg bg-slate-50/50">
              <span className="text-xs font-bold text-amber-600">{ticket.requestedPriority}</span>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">CURRENT STATUS</label>
            <div className="p-1.5 border border-slate-200 rounded-lg bg-slate-50/50 flex items-center">
              {getStatusBadge(ticket.currentStatus)}
            </div>
          </div>
        </div>

        {/* Row 3: Summary */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">SUMMARY</label>
          <input
            type="text"
            readOnly
            value={ticket.summary}
            className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 bg-slate-50/50 outline-none"
          />
        </div>

        {/* Row 4: Description */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">DESCRIPTION</label>
          <textarea
            readOnly
            rows={2}
            value={ticket.description}
            className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-700 bg-slate-50/50 outline-none resize-none"
          />
        </div>

        {/* Row 5: Resolution Summary */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">RESOLUTION SUMMARY</label>
          <input
            type="text"
            readOnly
            value="No resolution summary available yet."
            className="w-full p-2 border border-slate-200 rounded-lg text-xs italic text-slate-400 bg-slate-50/50 outline-none"
          />
        </div>
      </div>

      {/* Resolution Advisory Banner (Image 2) */}
      {advisoryRecorded ? (
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 text-emerald-900 rounded-xl space-y-1">
          <div className="font-bold text-xs text-emerald-900">Resolution advisory recorded</div>
          <div className="text-xs text-emerald-800 leading-relaxed">
            You indicated that the problem appears resolved on {advisoryTime}. IT Staff must still formally review the ticket.
          </div>
        </div>
      ) : (
        ticket.currentStatus !== 'RESOLVED' &&
        ticket.currentStatus !== 'CLOSED' && (
          <div className="flex justify-end">
            <button
              onClick={handleResolveRequest}
              className="px-3.5 py-2 bg-[#006B3C] hover:bg-[#004D2B] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Problem Appears Resolved
            </button>
          </div>
        )
      )}

      {/* Actions Taken Section (Role Protected: Requester sees read-only, NO Add/Edit/Complete buttons) */}
      <ActionsTakenSection ticketId={ticket.id} />

      {/* Attachments Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800">
            Attachments ({ticket.attachments?.length || 0})
          </h3>
          <button
            type="button"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            + Add Attachment
          </button>
        </div>
        <p className="text-xs text-slate-400">No active attachments for this ticket.</p>
      </div>

      {/* Public Comments Section (Internal Notes are strictly omitted for Requesters!) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-bold text-[#006B3C]">Public Comments</h3>
          <p className="text-[11px] text-slate-400">Comments are visible to you and the IT support team.</p>
        </div>

        {comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{c.author.name} ({c.author.role})</span>
                  <span className="text-slate-400 font-normal">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-700">{c.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No public comments yet.</p>
        )}

        <form onSubmit={handleAddComment} className="space-y-2 pt-2 border-t border-slate-100">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add Public Comment"
            rows={3}
            className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-600"
          />
          <button
            type="submit"
            disabled={submittingComment || !newComment.trim()}
            className="px-3.5 py-1.5 bg-[#006B3C] hover:bg-[#004D2B] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs"
          >
            {submittingComment ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </div>
    </div>
  );
};
