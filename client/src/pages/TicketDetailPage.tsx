import React, { useState, useEffect, useCallback } from 'react';
import { useRequester } from '../context/RequesterContext';
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

export interface TicketDetailData {
  id: number;
  ticketNumber: string;
  summary: string;
  description: string;
  requestedPriority: 'LOW' | 'MEDIUM' | 'HIGH';
  currentStatus: 'NEW' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  category: { id: number; name: string };
  relatedSystem: { id: number; name: string };
  requester: { id: number; name: string; email: string };
  attachments: AttachmentDetail[];
}

interface TicketDetailPageProps {
  ticketId: number;
  onBack: () => void;
}

export const TicketDetailPage: React.FC<TicketDetailPageProps> = ({ ticketId, onBack }) => {
  const { activeRequester } = useRequester();

  const [ticket, setTicket] = useState<TicketDetailData | null>(null);
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
    if (!activeRequester || !ticketId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(`/api/tickets/${ticketId}`, {
      headers: {
        'X-Requester-Id': String(activeRequester.id),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setTicket(data.data);
        } else {
          setError(data.error?.message || 'Failed to load ticket details');
        }
      })
      .catch((err) => {
        console.error('Error loading ticket detail:', err);
        setError('Network error: Unable to load ticket details');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [activeRequester, ticketId]);

  useEffect(() => {
    fetchTicketDetail();
  }, [fetchTicketDetail]);

  const handleDownloadAttachment = (att: AttachmentDetail) => {
    if (!activeRequester || att.isRemoved) return;

    fetch(`/api/attachments/${att.id}/download`, {
      headers: {
        'X-Requester-Id': String(activeRequester.id),
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || 'Download failed');
        }
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = att.fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        alert(err.message || 'Failed to download attachment');
      });
  };

  const handleConfirmRemove = () => {
    if (!selectedAttachmentToRemove || !activeRequester) return;

    const trimmed = removalReason.trim();
    if (trimmed.length < 5) {
      setRemovalError('Reason must be at least 5 characters long.');
      return;
    }

    setIsRemoving(true);
    setRemovalError(null);

    fetch(`/api/attachments/${selectedAttachmentToRemove.id}/remove`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Requester-Id': String(activeRequester.id),
      },
      body: JSON.stringify({ removalReason: trimmed }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setActionSuccess(`Attachment "${selectedAttachmentToRemove.fileName}" was soft-removed.`);
          setSelectedAttachmentToRemove(null);
          setRemovalReason('');
          fetchTicketDetail();
        } else {
          setRemovalError(data.error?.message || 'Failed to remove attachment');
        }
      })
      .catch((err) => {
        console.error('Remove error:', err);
        setRemovalError('Network error: Unable to remove attachment');
      })
      .finally(() => {
        setIsRemoving(false);
      });
  };

  const renderPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-priority-high-bg)',
              color: 'var(--color-priority-high-text)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            HIGH PRIORITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-priority-medium-bg)',
              color: 'var(--color-priority-medium-text)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            MEDIUM PRIORITY
          </span>
        );
      case 'LOW':
      default:
        return (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-priority-low-bg)',
              color: 'var(--color-priority-low-text)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            LOW PRIORITY
          </span>
        );
    }
  };

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'NEW':
        return (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-status-new-bg)',
              color: 'var(--color-status-new-text)',
              border: '1px solid var(--color-status-new-border)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            STATUS: NEW
          </span>
        );
      case 'OPEN':
        return (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#ECFDF5',
              color: '#047857',
              border: '1px solid #A7F3D0',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            STATUS: OPEN
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              border: '1px solid #BFDBFE',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            STATUS: IN PROGRESS
          </span>
        );
      case 'RESOLVED':
        return (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#F0FDF4',
              color: '#15803D',
              border: '1px solid #BBF7D0',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            STATUS: RESOLVED
          </span>
        );
      case 'CLOSED':
      default:
        return (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#F1F5F9',
              color: '#475569',
              border: '1px solid #CBD5E1',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            STATUS: {status}
          </span>
        );
    }
  };

  const activeAttachments = ticket?.attachments.filter((a) => !a.isRemoved) || [];
  const removedAttachments = ticket?.attachments.filter((a) => a.isRemoved) || [];

  if (isLoading) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', textAlign: 'center', padding: '60px' }}>
        <RefreshCw size={32} className="spin" style={{ color: 'var(--color-primary-600)', marginBottom: '12px' }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading ticket details...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary-700)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '20px',
          }}
        >
          <ArrowLeft size={18} /> Back to My Tickets
        </button>

        <div
          style={{
            padding: '24px',
            backgroundColor: 'var(--color-error-bg)',
            border: '1px solid var(--color-error-base)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--color-error-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertCircle size={24} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Unable to display ticket</h3>
            <p style={{ fontSize: '0.875rem' }}>{error || 'Ticket not found or access denied.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '950px', margin: '30px auto', padding: '0 20px' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-primary-700)',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '20px',
          fontSize: '0.9rem',
        }}
      >
        <ArrowLeft size={18} /> Back to My Tickets
      </button>

      {/* Action Success Alert */}
      {actionSuccess && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            color: '#15803D',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803D' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Header Box */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-divider)',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--color-primary-700)',
                backgroundColor: 'var(--color-primary-50)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {ticket.ticketNumber}
            </span>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '10px' }}>
              {ticket.summary}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {renderPriorityBadge(ticket.requestedPriority)}
            {renderStatusBadge(ticket.currentStatus)}
          </div>
        </div>

        {/* Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-divider)',
            fontSize: '0.85rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>Category</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Tag size={14} style={{ color: 'var(--color-primary-600)' }} />
              {ticket.category?.name || 'Uncategorized'}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>Related System</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <HardDrive size={14} style={{ color: '#D97706' }} />
              {ticket.relatedSystem?.name || 'Unspecified System'}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>Requester</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <User size={14} style={{ color: 'var(--color-primary-700)' }} />
              {ticket.requester?.name} ({ticket.requester?.email})
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>Created Date</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} style={{ color: 'var(--color-text-muted)' }} />
              {formatDate(ticket.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-divider)',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
          Issue Description
        </h2>
        <div
          style={{
            fontSize: '0.9rem',
            lineHeight: '1.6',
            color: 'var(--color-text-primary)',
            whiteSpace: 'pre-wrap',
            backgroundColor: '#FAFDFB',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-divider)',
          }}
        >
          {ticket.description}
        </div>
      </div>

      {/* Active Attachments Section */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-divider)',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '14px' }}>
          Active File Attachments ({activeAttachments.length}/5)
        </h2>

        {activeAttachments.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>No active attachments for this ticket.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeAttachments.map((att) => {
              const isImage = att.mimeType.startsWith('image/');
              return (
                <div
                  key={att.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#FAFDFB',
                    border: '1px solid var(--color-divider)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                    {isImage ? (
                      <ImageIcon size={22} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                    ) : (
                      <FileText size={22} style={{ color: '#D97706', flexShrink: 0 }} />
                    )}
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '350px' }}>
                        {att.fileName}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {formatFileSize(att.sizeBytes)} • Uploaded {formatDate(att.uploadedAt)}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleDownloadAttachment(att)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-primary-200)',
                        color: 'var(--color-primary-700)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Download size={14} /> Download
                    </button>

                    <button
                      onClick={() => {
                        setSelectedAttachmentToRemove(att);
                        setRemovalReason('');
                        setRemovalError(null);
                      }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #FECACA',
                        color: 'var(--color-error-text)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Soft-Removed Attachments History Section */}
      {removedAttachments.length > 0 && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-divider)',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '14px' }}>
            Soft-Removed Attachments History ({removedAttachments.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {removedAttachments.map((att) => (
              <div
                key={att.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#F8FAFC',
                  border: '1px dashed #CBD5E1',
                  borderRadius: 'var(--radius-md)',
                  opacity: 0.85,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                  <FileText size={22} style={{ color: '#94A3B8', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748B', textDecoration: 'line-through', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '350px' }}>
                      {att.fileName}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      Removed on {formatDate(att.removedAt)} • Reason: <em>"{att.removalReason}"</em>
                    </p>
                  </div>
                </div>

                <button
                  disabled
                  title="Cannot download a soft-removed attachment"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    color: '#94A3B8',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Download size={14} /> Download (Disabled)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Soft Removal Reason Modal Dialog */}
      {selectedAttachmentToRemove && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Soft-Remove Attachment
              </h3>
              <button
                onClick={() => setSelectedAttachmentToRemove(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '14px' }}>
              You are about to soft-remove file <strong>"{selectedAttachmentToRemove.fileName}"</strong>. Please provide a reason for removal (minimum 5 characters).
            </p>

            <textarea
              rows={3}
              value={removalReason}
              onChange={(e) => setRemovalReason(e.target.value)}
              placeholder="e.g. Uploaded incorrect document version..."
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '0.875rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${removalError ? 'var(--color-error-base)' : 'var(--color-divider)'}`,
                outline: 'none',
                resize: 'vertical',
                marginBottom: '8px',
              }}
            />

            {removalError && (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-error-text)', marginBottom: '12px' }}>
                {removalError}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setSelectedAttachmentToRemove(null)}
                className="btn btn-outline"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-error-base)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: isRemoving ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isRemoving ? 'Removing...' : 'Confirm Soft Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
