import React, { useState } from 'react';
import {
  ActionTakenItem,
  ActionStatus,
  parseActionNotes,
} from '../types/actionTaken.types';

export interface ActionsTakenListProps {
  actions: ActionTakenItem[];
  isLoading?: boolean;
  canEdit?: boolean;
  onEdit?: (action: ActionTakenItem) => void;
  onCompleteAction?: (actionId: number, resultText: string) => Promise<void>;
  onUpdateStatus?: (actionId: number, nextStatus: ActionStatus) => Promise<void>;
}

const STATUS_BADGE_STYLE: Record<ActionStatus, React.CSSProperties> = {
  PLANNED: { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' },
  IN_PROGRESS: { background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' },
  COMPLETED: { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' },
  CANCELLED: { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' },
};

export const ActionsTakenList: React.FC<ActionsTakenListProps> = ({
  actions,
  isLoading = false,
  canEdit = false,
  onEdit,
  onCompleteAction,
  onUpdateStatus,
}) => {
  const [completingActionId, setCompletingActionId] = useState<number | null>(null);
  const [completionResult, setCompletionResult] = useState('');
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);

  const formatDateThai = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear() + 543;
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const secs = String(d.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${mins}:${secs}`;
    } catch {
      return isoString;
    }
  };

  const handleOpenComplete = (action: ActionTakenItem) => {
    setCompletingActionId(action.id);
    setCompletionResult(
      action.result && action.result !== 'No result recorded yet.'
        ? action.result
        : 'Repair verified; requester confirmed a successful submission.'
    );
  };

  const handleConfirmComplete = async (actionId: number) => {
    if (!onCompleteAction) return;
    setIsSubmittingComplete(true);
    try {
      await onCompleteAction(actionId, completionResult.trim());
      setCompletingActionId(null);
      setCompletionResult('');
    } finally {
      setIsSubmittingComplete(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', color: '#789082', fontSize: 13 }}>
        Loading actions taken...
      </div>
    );
  }

  if (!actions || actions.length === 0) {
    return (
      <div
        data-testid="actions-taken-empty"
        style={{
          padding: '36px 16px',
          textAlign: 'center',
          background: '#fff',
          border: '1px solid #e2ede6',
          borderRadius: 8,
          color: '#789082',
          fontSize: 13,
        }}
      >
        No actions recorded yet for this ticket.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} data-testid="actions-taken-list">
      {actions.map((action) => {
        const { cleanNotes, status, assignee } = parseActionNotes(action.attachmentNotes);
        const effectiveStatus: ActionStatus = action.status || status;
        const isCompleted = effectiveStatus === 'COMPLETED';
        const isCancelled = effectiveStatus === 'CANCELLED';
        const isInProgress = effectiveStatus === 'IN_PROGRESS';
        const isPlanned = effectiveStatus === 'PLANNED';

        const isEdited =
          new Date(action.updatedAt).getTime() - new Date(action.createdAt).getTime() > 2000;

        const hasResult =
          action.result &&
          action.result !== 'No result recorded yet.' &&
          action.result.trim().length > 0;

        const badgeStyle = STATUS_BADGE_STYLE[effectiveStatus] || STATUS_BADGE_STYLE.PLANNED;

        return (
          <div
            key={action.id}
            data-testid={`action-taken-item-${action.id}`}
            style={{
              background: '#fff',
              border: '1px solid #e2ede6',
              borderRadius: 8,
              padding: '18px 20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              position: 'relative',
            }}
          >
            {/* Top row: Date & Status Badge */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2d23' }}>
                  {formatDateThai(action.createdAt)}
                </div>
                <div style={{ fontSize: 10, color: '#789082', marginTop: 1 }}>
                  UTC: {new Date(action.createdAt).toISOString()}
                </div>
              </div>

              <span
                style={{
                  ...badgeStyle,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 4,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {effectiveStatus.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Action Description */}
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2d23', marginBottom: 8 }}>
              {action.description}
            </div>

            {/* Details list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#4a6053', marginBottom: 10 }}>
              {/* Result */}
              <div>
                <strong style={{ color: '#1a2d23' }}>Result: </strong>
                {hasResult ? (
                  <span>{action.result}</span>
                ) : (
                  <span style={{ fontStyle: 'italic', color: '#789082' }}>No result recorded yet.</span>
                )}
              </div>

              {/* Assignee */}
              <div>
                <strong style={{ color: '#1a2d23' }}>Assignee: </strong>
                <span>{assignee || 'Unassigned'}</span>
              </div>

              {/* Performed by */}
              <div>
                <strong style={{ color: '#1a2d23' }}>Performed by: </strong>
                {isCompleted ? (
                  <span>{action.performedBy?.name || 'Niran Engineer'} ({action.performedBy?.role || 'IT STAFF'})</span>
                ) : (
                  <span style={{ color: '#789082' }}>Not completed yet</span>
                )}
              </div>

              {/* Follow-up */}
              <div>
                <strong style={{ color: '#1a2d23' }}>Follow-up: </strong>
                <span>{action.followUpRequired ? 'Follow-up required' : 'No follow-up required'}</span>
              </div>

              {/* Follow-up note */}
              {action.followUpRequired && action.followUpNote && (
                <div>
                  <strong style={{ color: '#1a2d23' }}>Follow-up note: </strong>
                  <span>{action.followUpNote}</span>
                </div>
              )}

              {/* Attachment notes */}
              {cleanNotes && (
                <div>
                  <strong style={{ color: '#1a2d23' }}>Attachment notes: </strong>
                  <span>{cleanNotes}</span>
                </div>
              )}
            </div>

            {/* Sub-footer Attribution */}
            <div style={{ fontSize: 11, color: '#789082', marginBottom: canEdit ? 12 : 0 }}>
              Created by {action.performedBy?.name || 'Niran Engineer'} ({action.performedBy?.role || 'IT STAFF'})
              {isEdited && ' · Edited after creation'}
            </div>

            {/* Action Buttons for IT Staff / Admin */}
            {canEdit && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => onEdit?.(action)}
                  style={{
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 5,
                    padding: '5px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                >
                  Edit Action
                </button>

                {isPlanned && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus?.(action.id, 'IN_PROGRESS')}
                    style={{
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 5,
                      padding: '5px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                  >
                    Start
                  </button>
                )}

                {(isPlanned || isInProgress) && (
                  <button
                    type="button"
                    onClick={() => handleOpenComplete(action)}
                    style={{
                      background: '#006B3C',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 5,
                      padding: '5px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#004D2B')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#006B3C')}
                  >
                    Complete
                  </button>
                )}

                {(isPlanned || isInProgress) && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus?.(action.id, 'CANCELLED')}
                    style={{
                      background: '#fff',
                      border: '1px solid #fed7aa',
                      borderRadius: 5,
                      padding: '5px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#c2410c',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fff7ed')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                  >
                    Cancel Action
                  </button>
                )}
              </div>
            )}

            {/* Inline Complete Box */}
            {canEdit && completingActionId === action.id && (
              <div
                style={{
                  marginTop: 14,
                  padding: '14px 16px',
                  background: '#f8fbf9',
                  border: '1px solid #c7e3d2',
                  borderRadius: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <label style={{ fontSize: 12, fontWeight: 700, color: '#1a2d23' }}>
                  Completion result
                </label>
                <textarea
                  rows={2}
                  value={completionResult}
                  onChange={(e) => setCompletionResult(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <button
                    type="button"
                    disabled={isSubmittingComplete}
                    onClick={() => handleConfirmComplete(action.id)}
                    style={{
                      background: '#006B3C',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 5,
                      padding: '6px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: isSubmittingComplete ? 'not-allowed' : 'pointer',
                      opacity: isSubmittingComplete ? 0.6 : 1,
                    }}
                  >
                    Confirm completion
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompletingActionId(null)}
                    style={{
                      background: '#fff',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      borderRadius: 5,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
