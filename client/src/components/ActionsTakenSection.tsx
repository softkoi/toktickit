import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ActionTakenItem, CreateActionTakenDto, UpdateActionTakenDto } from '../types/actionTaken.types';
import { getActionsTaken, createActionTaken, updateActionTaken } from '../services/actionTaken.service';
import { ActionsTakenList } from './ActionsTakenList';
import { ActionTakenForm } from './ActionTakenForm';
import { Wrench, Plus, AlertCircle } from 'lucide-react';

export interface ActionsTakenSectionProps {
  ticketId: number;
}

export const ActionsTakenSection: React.FC<ActionsTakenSectionProps> = ({ ticketId }) => {
  const { user } = useAuth();
  const [actions, setActions] = useState<ActionTakenItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionTakenItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManage = user?.role === 'IT_STAFF' || user?.role === 'ADMINISTRATOR';

  const loadActions = useCallback(async () => {
    if (!ticketId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getActionsTaken(ticketId);
      setActions(data);
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

  return (
    <div
      data-testid="actions-taken-section"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              color: '#0f5132',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Wrench size={18} />
            Actions Taken
            <span
              style={{
                backgroundColor: '#e8f5e9',
                color: '#0f5132',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '10px',
              }}
            >
              {actions.length}
            </span>
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            {canManage
              ? 'Record and track technical operations and resolution steps performed on this ticket.'
              : 'Work log and operational steps recorded by the IT support team.'}
          </p>
        </div>

        {canManage && !isFormOpen && (
          <button
            type="button"
            onClick={handleOpenCreateForm}
            data-testid="add-action-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0f5132',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <Plus size={15} />
            Record Action
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container (IT Staff / Admin only) */}
      {canManage && isFormOpen && (
        <div style={{ marginBottom: '20px' }}>
          <ActionTakenForm
            initialData={editingAction}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Timeline List */}
      <ActionsTakenList
        actions={actions}
        isLoading={isLoading}
        canEdit={canManage}
        onEdit={handleEditAction}
      />
    </div>
  );
};
