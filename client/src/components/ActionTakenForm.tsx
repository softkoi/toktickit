import React, { useState, useEffect } from 'react';
import {
  ActionTakenItem,
  CreateActionTakenDto,
  UpdateActionTakenDto,
  ActionStatus,
  parseActionNotes,
  formatActionNotes,
} from '../types/actionTaken.types';

export interface ActionTakenFormProps {
  initialData?: ActionTakenItem | null;
  onSubmit: (data: CreateActionTakenDto | UpdateActionTakenDto) => Promise<void>;
  onCancel: () => void;
  onReload?: () => void;
  isSubmitting?: boolean;
}

export const ActionTakenForm: React.FC<ActionTakenFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onReload,
  isSubmitting = false,
}) => {
  const isEditing = Boolean(initialData);

  const parsed = parseActionNotes(initialData?.attachmentNotes || null);

  const nowFormatted = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  };

  const [actionDateTime, setActionDateTime] = useState(
    parsed.actionDateTime || (initialData ? nowFormatted() : nowFormatted())
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [result, setResult] = useState(
    initialData?.result && initialData.result !== 'No result recorded yet.' ? initialData.result : ''
  );
  const [assignee, setAssignee] = useState(parsed.assignee || 'Mary Support (IT STAFF)');
  const [followUpRequired, setFollowUpRequired] = useState(initialData?.followUpRequired || false);
  const [followUpNote, setFollowUpNote] = useState(initialData?.followUpNote || '');
  const [attachmentNotes, setAttachmentNotes] = useState(parsed.cleanNotes || '');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      const p = parseActionNotes(initialData.attachmentNotes || null);
      setDescription(initialData.description || '');
      setResult(initialData.result && initialData.result !== 'No result recorded yet.' ? initialData.result : '');
      setFollowUpRequired(initialData.followUpRequired || false);
      setFollowUpNote(initialData.followUpNote || '');
      setAttachmentNotes(p.cleanNotes || '');
      setAssignee(p.assignee || 'Mary Support (IT STAFF)');
      setActionDateTime(p.actionDateTime || nowFormatted());
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation 1: Action description
    if (!description.trim()) {
      setErrorMessage('Action description is required.');
      return;
    }

    // Validation 2: Follow-up note when enabled
    if (followUpRequired && !followUpNote.trim()) {
      setErrorMessage('Follow-up note is required when follow-up is enabled.');
      return;
    }

    setErrorMessage(null);

    // Determine status
    let status: ActionStatus = parsed.status || 'PLANNED';
    if (result.trim()) {
      status = 'COMPLETED';
    } else if (status === 'COMPLETED' && !result.trim()) {
      status = 'PLANNED';
    }

    const formattedNotes = formatActionNotes(attachmentNotes, status, assignee, actionDateTime);
    const finalResult = result.trim() ? result.trim() : 'No result recorded yet.';

    try {
      await onSubmit({
        description: description.trim(),
        result: finalResult,
        followUpRequired,
        followUpNote: followUpRequired ? followUpNote.trim() : null,
        attachmentNotes: formattedNotes,
        status,
        assigneeName: assignee,
        actionDateTime,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save action taken.');
    }
  };

  const handleReload = () => {
    setErrorMessage(null);
    if (onReload) {
      onReload();
    }
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 10,
        border: '1px solid #c7e3d2',
        padding: '24px 22px',
        marginBottom: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Form Title */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#006B3C', margin: 0 }}>
          {isEditing ? 'Edit Action Taken' : 'Add Action Taken'}
        </h2>

        {/* Validation Error Banner */}
        {errorMessage && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 6,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              color: '#dc2626',
              fontSize: 13,
            }}
          >
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={handleReload}
              style={{
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: 4,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Reload latest action
            </button>
          </div>
        )}

        {/* Action date and time */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#1a2d23' }}>
            Action date and time
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={actionDateTime}
              onChange={(e) => setActionDateTime(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 34px 8px 12px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#64748b',
                fontSize: 14,
              }}
            >
              📅
            </span>
          </div>
        </div>

        {/* Action description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#1a2d23' }}>
            Action description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#1a2d23' }}>
              Result
            </label>
            <span style={{ fontSize: 11, color: '#789082' }}>
              (required when completing)
            </span>
          </div>
          <textarea
            rows={3}
            value={result}
            onChange={(e) => setResult(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Assignee */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#1a2d23' }}>
            Assignee
          </label>
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              background: '#fff',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          >
            <option value="Mary Support (IT STAFF)">Mary Support (IT STAFF)</option>
            <option value="Niran Engineer (IT STAFF)">Niran Engineer (IT STAFF)</option>
            <option value="IT Staff One (IT STAFF)">IT Staff One (IT STAFF)</option>
            <option value="IT Staff Two (IT STAFF)">IT Staff Two (IT STAFF)</option>
            <option value="Unassigned">Unassigned</option>
          </select>
        </div>

        {/* Follow-up required */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            id="followUpRequired"
            checked={followUpRequired}
            onChange={(e) => setFollowUpRequired(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#006B3C', cursor: 'pointer' }}
          />
          <label
            htmlFor="followUpRequired"
            style={{ fontSize: 12, fontWeight: 700, color: '#1a2d23', cursor: 'pointer' }}
          >
            Follow-up required
          </label>
        </div>

        {/* Follow-up note */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#1a2d23' }}>
            Follow-up note
          </label>
          <textarea
            rows={3}
            value={followUpNote}
            onChange={(e) => setFollowUpNote(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Attachment notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#1a2d23' }}>
              Attachment notes
            </label>
            <span style={{ fontSize: 11, color: '#789082' }}>(optional)</span>
          </div>
          <textarea
            rows={3}
            value={attachmentNotes}
            onChange={(e) => setAttachmentNotes(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Submit & Cancel Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: '#006B3C',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#004D2B')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#006B3C')}
          >
            Save Action
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: '#fff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
