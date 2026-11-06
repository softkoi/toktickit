import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ActionTakenItem,
  CreateActionTakenDto,
  UpdateActionTakenDto,
  ActionStatus,
  parseActionNotes,
  formatActionNotes,
} from '../types/actionTaken.types';
import { getActionsTaken, createActionTaken, updateActionTaken } from '../services/actionTaken.service';
import { ActionsTakenList } from './ActionsTakenList';
import { ActionTakenForm } from './ActionTakenForm';

export interface ActionsTakenSectionProps {
  ticketId: number;
  onActionsLoaded?: (actions: ActionTakenItem[]) => void;
}

export const ActionsTakenSection: React.FC<ActionsTakenSectionProps> = ({ ticketId, onActionsLoaded }) => {
  const { user } = useAuth();
  const [actions, setActions] = useState<ActionTakenItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionTakenItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Requesters can only view. IT Staff and Administrators can add/edit.
  const canManage = user?.role === 'IT_STAFF' || user?.role === 'ADMINISTRATOR';

  const loadActions = useCallback(async () => {
    if (!ticketId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getActionsTaken(ticketId);
      setActions(data);
      onActionsLoaded?.(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load actions taken');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  const handleOpenCreateForm = () => {
    setEditingAction(null);
    setIsFormOpen(true);
  };

  const handleEditAction = (action: ActionTakenItem) => {
    setEditingAction(action);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingAction(null);
  };

  const handleSubmitForm = async (data: CreateActionTakenDto | UpdateActionTakenDto) => {
    setIsSubmitting(true);
    try {
      if (editingAction) {
        await updateActionTaken(editingAction.id, data);
      } else {
        await createActionTaken(ticketId, data as CreateActionTakenDto);
      }
      setIsFormOpen(false);
      setEditingAction(null);
      await loadActions();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteAction = async (actionId: number, resultText: string) => {
    const existing = actions.find((a) => a.id === actionId);
    if (!existing) return;

    const parsed = parseActionNotes(existing.attachmentNotes);
    const updatedNotes = formatActionNotes(parsed.cleanNotes, 'COMPLETED', parsed.assignee, parsed.actionDateTime);

    await updateActionTaken(actionId, {
      result: resultText || 'Repair verified; requester confirmed a successful submission.',
      attachmentNotes: updatedNotes,
    });
    await loadActions();
  };

  const handleUpdateStatus = async (actionId: number, nextStatus: ActionStatus) => {
    const existing = actions.find((a) => a.id === actionId);
    if (!existing) return;

    const parsed = parseActionNotes(existing.attachmentNotes);
    const updatedNotes = formatActionNotes(parsed.cleanNotes, nextStatus, parsed.assignee, parsed.actionDateTime);

    await updateActionTaken(actionId, {
      attachmentNotes: updatedNotes,
    });
    await loadActions();
  };

  return (
    <div
      data-testid="actions-taken-section"
      style={{
        marginTop: 24,
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: '#006B3C',
              marginBottom: 3,
            }}
          >
            Actions Taken
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: '#789082' }}>
            Recorded work and its follow-up details for this ticket.
          </p>
        </div>

        {/* Add Action Taken button — visible only for IT Staff & Admin */}
        {canManage && !isFormOpen && (
          <button
            type="button"
            onClick={handleOpenCreateForm}
            data-testid="add-action-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#006B3C',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#004D2B')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#006B3C')}
          >
            Add Action Taken
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: 6,
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* Form Container (IT Staff / Admin only) */}
      {canManage && isFormOpen && (
        <ActionTakenForm
          initialData={editingAction}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
          onReload={loadActions}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Timeline List */}
      <ActionsTakenList
        actions={actions}
        isLoading={isLoading}
        canEdit={canManage}
        onEdit={handleEditAction}
        onCompleteAction={handleCompleteAction}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};
