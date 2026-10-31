import React from 'react';
import { Clock, User, CheckCircle2, Paperclip, Edit3, AlertCircle } from 'lucide-react';
import { ActionTakenItem } from '../types/actionTaken.types';

export interface ActionsTakenListProps {
  actions: ActionTakenItem[];
  isLoading?: boolean;
  canEdit?: boolean;
  onEdit?: (action: ActionTakenItem) => void;
}

export const ActionsTakenList: React.FC<ActionsTakenListProps> = ({
  actions,
  isLoading = false,
  canEdit = false,
  onEdit,
}) => {
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString('en-US', {
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

  if (isLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#6c757d' }}>
        <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #e8f5e9', borderTopColor: '#0f5132', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>Loading actions taken...</p>
      </div>
    );
  }

  if (!actions || actions.length === 0) {
    return (
      <div
        data-testid="actions-taken-empty"
        style={{
          padding: '32px 16px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px dashed #ced4da',
          borderRadius: '8px',
          color: '#6c757d',
        }}
      >
        <Clock size={32} style={{ margin: '0 auto 8px', color: '#adb5bd' }} />
        <p style={{ margin: 0, fontWeight: 500 }}>No actions taken recorded yet.</p>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
          When IT staff perform work on this ticket, timeline logs will appear here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} data-testid="actions-taken-list">
      {actions.map((action, index) => (
        <div
          key={action.id}
          data-testid={`action-taken-item-${action.id}`}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #dee2e6',
            borderLeft: '4px solid #198754',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            position: 'relative',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '8px',
              paddingBottom: '12px',
              borderBottom: '1px solid #f1f3f5',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#e8f5e9',
                  color: '#0f5132',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                <User size={12} />
                {action.performedBy?.name || 'IT Staff'}
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#6c757d',
                  fontSize: '0.8rem',
                }}
              >
                <Clock size={12} />
                {formatDate(action.createdAt)}
              </span>

              {action.updatedAt !== action.createdAt && (
                <span style={{ fontSize: '0.75rem', color: '#adb5bd', fontStyle: 'italic' }}>
                  (edited)
                </span>
              )}
            </div>

            {canEdit && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(action)}
                data-testid={`edit-action-btn-${action.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: '#0f5132',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e8f5e9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Edit3 size={13} />
                Edit
              </button>
            )}
          </div>

          {/* Description & Result */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6c757d', fontWeight: 600, marginBottom: '2px' }}>
                Action Description
              </div>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#212529', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                {action.description}
              </p>
            </div>

            <div style={{ backgroundColor: '#f8f9fa', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#198754', fontWeight: 600, marginBottom: '2px' }}>
                <CheckCircle2 size={13} />
                Result
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#2b2f33', whiteSpace: 'pre-line', lineHeight: 1.45 }}>
                {action.result}
              </p>
            </div>

            {/* Follow-up Note & Attachment Notes */}
            {(action.followUpRequired || action.attachmentNotes) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', fontSize: '0.85rem' }}>
                {action.followUpRequired && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '6px',
                      padding: '8px 10px',
                      backgroundColor: '#fff9db',
                      border: '1px solid #ffe066',
                      borderRadius: '6px',
                      color: '#856404',
                    }}
                  >
                    <AlertCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontWeight: 600 }}>Follow-up Required: </strong>
                      <span>{action.followUpNote || 'Follow-up noted.'}</span>
                    </div>
                  </div>
                )}

                {action.attachmentNotes && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '6px',
                      padding: '6px 10px',
                      backgroundColor: '#f1f3f5',
                      borderRadius: '6px',
                      color: '#495057',
                    }}
                  >
                    <Paperclip size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontWeight: 600 }}>Attachment Reference: </strong>
                      <span>{action.attachmentNotes}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
