import { ActionTakenItem, CreateActionTakenDto, UpdateActionTakenDto } from '../types/actionTaken.types';

export async function getActionsTaken(ticketId: number): Promise<ActionTakenItem[]> {
  const response = await fetch(`/api/tickets/${ticketId}/actions-taken`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.message || 'Failed to fetch actions taken');
  }

  const data = await response.json();
  return data.actionsTaken || [];
}

export async function createActionTaken(
  ticketId: number,
  dto: CreateActionTakenDto
): Promise<ActionTakenItem> {
  const response = await fetch(`/api/tickets/${ticketId}/actions-taken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.message || 'Failed to create action taken');
  }

  const data = await response.json();
  return data.actionTaken;
}

export async function updateActionTaken(
  actionId: number,
  dto: UpdateActionTakenDto
): Promise<ActionTakenItem> {
  const response = await fetch(`/api/actions-taken/${actionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.message || 'Failed to update action taken');
  }

  const data = await response.json();
  return data.actionTaken;
}
