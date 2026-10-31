import React, { useState, useEffect } from 'react';
import { ActionTakenItem, CreateActionTakenDto, UpdateActionTakenDto } from '../types/actionTaken.types';
import { PlusCircle, CheckCircle, X, AlertCircle } from 'lucide-react';

export interface ActionTakenFormProps {
  initialData?: ActionTakenItem | null;
  onSubmit: (data: CreateActionTakenDto | UpdateActionTakenDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ActionTakenForm: React.FC<ActionTakenFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const isEditing = Boolean(initialData);

  const [description, setDescription] = useState(initialData?.description || '');
  const [result, setResult] = useState(initialData?.result || '');
  const [followUpRequired, setFollowUpRequired] = useState(initialData?.followUpRequired || false);
  const [followUpNote, setFollowUpNote] = useState(initialData?.followUpNote || '');
  const [attachmentNotes, setAttachmentNotes] = useState(initialData?.attachmentNotes || '');

  const [errors, setErrors] = useState<{
    description?: string;
    result?: string;
    followUpNote?: string;
    general?: string;
  }>({});

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description || '');
      setResult(initialData.result || '');
      setFollowUpRequired(initialData.followUpRequired || false);
      setFollowUpNote(initialData.followUpNote || '');
      setAttachmentNotes(initialData.attachmentNotes || '');
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!description.trim()) {
      newErrors.description = 'Action description is required';
    }

    if (!result.trim()) {
      newErrors.result = 'Result is required';
    }

    // BR-04 & AC-05: When followUpRequired is true, followUpNote is mandatory
    if (followUpRequired && !followUpNote.trim()) {
      newErrors.followUpNote = 'Follow-up note is required when follow-up is requested';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    try {
      await onSubmit({
        description: description.trim(),
        result: result.trim(),
        followUpRequired,
        followUpNote: followUpRequired ? followUpNote.trim() : null,
        attachmentNotes: attachmentNotes.trim() || null,
      });
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        general: err?.message || 'Failed to save action taken',
      }));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="action-taken-form"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          borderBottom: '1px solid #e9ecef',
          paddingBottom: '12px',
        }}
      >
        <h4 style={{ margin: 0, color: '#0f5132', fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? <CheckCircle size={18} /> : <PlusCircle size={18} />}
          {isEditing ? 'Edit Action Taken' : 'Record New Action Taken'}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          style={{ background: 'none', border: 'none', color: '#6c757d', cursor: 'pointer', padding: '4px' }}
          aria-label="Close form"
        >
          <X size={18} />
        </button>
      </div>

      {errors.general && (
        <div
          data-testid="form-general-error"
          style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px 12px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Description */}
      <div style={{ marginBottom: '14px' }}>
        <label
          htmlFor="action-description"
          style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 600, color: '#212529' }}
        >
          Action Description <span style={{ color: '#dc3545' }}>*</span>
        </label>
        <textarea
          id="action-description"
          name="description"
          data-testid="input-action-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what work was performed (e.g. Cleared cache, updated driver...)"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: `1px solid ${errors.description ? '#dc3545' : '#ced4da'}`,
            fontSize: '0.9rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {errors.description && (
          <p data-testid="error-description" style={{ margin: '4px 0 0', color: '#dc3545', fontSize: '0.8rem' }}>
            {errors.description}
          </p>
        )}
      </div>

      {/* Result */}
      <div style={{ marginBottom: '14px' }}>
        <label
          htmlFor="action-result"
          style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 600, color: '#212529' }}
        >
          Result / Outcome <span style={{ color: '#dc3545' }}>*</span>
        </label>
        <textarea
          id="action-result"
          name="result"
          data-testid="input-action-result"
          rows={2}
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="State the outcome of the action (e.g. Issue resolved, pending reboot...)"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: `1px solid ${errors.result ? '#dc3545' : '#ced4da'}`,
            fontSize: '0.9rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {errors.result && (
          <p data-testid="error-result" style={{ margin: '4px 0 0', color: '#dc3545', fontSize: '0.8rem' }}>
            {errors.result}
          </p>
        )}
      </div>

      {/* Follow-up Required Toggle */}
      <div style={{ marginBottom: '14px' }}>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            color: '#212529',
          }}
        >
          <input
            type="checkbox"
            name="followUpRequired"
            data-testid="input-followup-required"
            checked={followUpRequired}
            onChange={(e) => setFollowUpRequired(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#0f5132', cursor: 'pointer' }}
          />
          Follow-up Required?
        </label>
      </div>

      {/* Follow-up Note (conditionally displayed or required) */}
      {followUpRequired && (
        <div style={{ marginBottom: '14px', paddingLeft: '8px', borderLeft: '3px solid #ffc107' }}>
          <label
            htmlFor="action-followup-note"
            style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 600, color: '#212529' }}
          >
            Follow-up Note <span style={{ color: '#dc3545' }}>*</span>
          </label>
          <input
            type="text"
            id="action-followup-note"
            name="followUpNote"
            data-testid="input-followup-note"
            value={followUpNote}
            onChange={(e) => setFollowUpNote(e.target.value)}
            placeholder="Specify what follow-up is needed..."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: `1px solid ${errors.followUpNote ? '#dc3545' : '#ced4da'}`,
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.followUpNote && (
            <p data-testid="error-followup-note" style={{ margin: '4px 0 0', color: '#dc3545', fontSize: '0.8rem' }}>
              {errors.followUpNote}
            </p>
          )}
        </div>
      )}

      {/* Attachment Notes */}
      <div style={{ marginBottom: '20px' }}>
        <label
          htmlFor="action-attachment-notes"
          style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 600, color: '#212529' }}
        >
          Attachment Notes <span style={{ fontSize: '0.78rem', color: '#6c757d', fontWeight: 400 }}>(Optional)</span>
        </label>
        <input
          type="text"
          id="action-attachment-notes"
          name="attachmentNotes"
          data-testid="input-attachment-notes"
          value={attachmentNotes}
          onChange={(e) => setAttachmentNotes(e.target.value)}
          placeholder="e.g. Refer to crash_log.txt or screenshot_error.png"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ced4da',
            fontSize: '0.9rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #dee2e6',
            backgroundColor: '#ffffff',
            color: '#495057',
            fontSize: '0.88rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          data-testid="submit-action-btn"
          style={{
            padding: '8px 18px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: isSubmitting ? '#6c757d' : '#0f5132',
            color: '#ffffff',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Action' : 'Save Action'}
        </button>
      </div>
    </form>
  );
};
