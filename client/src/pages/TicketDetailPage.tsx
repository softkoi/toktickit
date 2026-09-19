import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  FileText,
  Clock,
  Tag,
  User,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  HardDrive,
  RefreshCw,
  X,
  MessageSquare,
  Send,
  Check
} from 'lucide-react';

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

  // Soft Removal Modal State
  const [selectedAttachmentToRemove, setSelectedAttachmentToRemove] = useState<AttachmentDetail | null>(null);
  const [removalReason, setRemovalReason] = useState<string>('');
  const [removalError, setRemovalError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
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
        setTicket(data.data);
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
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setComments(data))
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
        setActionSuccess('Problem marked as resolution requested. IT Staff notified.');
        fetchTicketDetail();
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

  const handleDownload = (attachment: AttachmentDetail) => {
    window.open(`/api/attachments/${attachment.id}/download`, '_blank');
  };

  const handleConfirmRemove = async () => {
    if (!selectedAttachmentToRemove) return;
    setIsRemoving(true);
    setRemovalError(null);

    try {
      const res = await fetch(`/api/attachments/${selectedAttachmentToRemove.id}/remove`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ removalReason }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRemovalError(data.error?.message || 'Failed to remove attachment');
      } else {
        setActionSuccess(`Attachment "${selectedAttachmentToRemove.fileName}" soft-removed.`);
        setSelectedAttachmentToRemove(null);
        setRemovalReason('');
        fetchTicketDetail();
      }
    } catch {
      setRemovalError('Network error removing attachment.');
    } finally {
      setIsRemoving(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OPEN': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'WAITING_FOR_REQUESTER': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-800 transition-colors"
      >
        <ArrowLeft size={16} /> Back to My Tickets
      </button>

      {actionSuccess && (
        <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm rounded flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle2 size={16} /> {actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="font-bold">&times;</button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded flex items-center justify-between">
          <span className="flex items-center gap-2"><AlertCircle size={16} /> {error}</span>
          <button onClick={() => setError(null)} className="font-bold">&times;</button>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500">Loading ticket details...</div>
      ) : !ticket ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500">Ticket not found.</div>
      ) : (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  {ticket.ticketNumber}
                </span>
                <h1 className="text-xl font-bold text-slate-800 mt-2">{ticket.summary}</h1>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadgeClass(ticket.currentStatus)}`}>
                  {ticket.currentStatus}
                </span>
                {ticket.currentStatus !== 'RESOLVED' && ticket.currentStatus !== 'CLOSED' && (
                  <button
                    onClick={handleResolveRequest}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm"
                  >
                    <Check size={14} /> Problem Appears Resolved
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs text-slate-600">
              <div><span className="text-slate-400 block">Category:</span> <span className="font-semibold text-slate-800">{ticket.category?.name}</span></div>
              <div><span className="text-slate-400 block">System:</span> <span className="font-semibold text-slate-800">{ticket.relatedSystem?.name}</span></div>
              <div><span className="text-slate-400 block">Priority:</span> <span className="font-semibold text-slate-800">{ticket.requestedPriority}</span></div>
              <div><span className="text-slate-400 block">Created:</span> <span className="font-semibold text-slate-800">{formatDate(ticket.createdAt)}</span></div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description</h2>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
                {ticket.description}
              </div>
            </div>
          </div>

          {/* Attachments Card */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <HardDrive size={16} /> Attachments ({ticket.attachments.length})
              </h2>
              <div className="space-y-3">
                {ticket.attachments.map((a) => (
                  <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className={`font-semibold ${a.isRemoved ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {a.fileName}
                      </div>
                      <div className="text-[11px] text-slate-400">{formatFileSize(a.sizeBytes)} • {a.mimeType}</div>
                      {a.isRemoved && <div className="text-[11px] text-red-600 font-medium">Soft-removed: {a.removalReason || 'No reason given'}</div>}
                    </div>
                    {!a.isRemoved && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDownload(a)} className="p-1.5 text-slate-600 hover:text-emerald-700">
                          <Download size={15} />
                        </button>
                        <button onClick={() => setSelectedAttachmentToRemove(a)} className="p-1.5 text-slate-600 hover:text-red-700">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Public Comments Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare size={16} /> Public Comments & Updates
            </h2>
            <div className="space-y-4 mb-6">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No comments posted yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-900">{c.author.name} ({c.author.role})</span>
                      <span className="text-slate-400">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="space-y-3 pt-4 border-t border-slate-100">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment or follow-up question..."
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5"
              >
                <Send size={13} /> {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Attachment Soft Removal Modal */}
      {selectedAttachmentToRemove && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-800 mb-2">Remove Attachment</h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to soft-remove <strong>{selectedAttachmentToRemove.fileName}</strong>?
            </p>
            {removalError && <div className="mb-3 p-2.5 bg-red-50 text-red-700 text-xs rounded">{removalError}</div>}
            <input
              type="text"
              value={removalReason}
              onChange={(e) => setRemovalReason(e.target.value)}
              placeholder="Reason for removal (optional)"
              className="w-full p-2.5 border rounded-lg text-xs mb-4 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button onClick={() => setSelectedAttachmentToRemove(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleConfirmRemove} disabled={isRemoving} className="px-4 py-2 bg-red-600 text-white rounded-lg">
                {isRemoving ? 'Removing...' : 'Confirm Soft Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
