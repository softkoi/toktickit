import { ActionTakenItem, CreateActionTakenDto, UpdateActionTakenDto } from '../types/actionTaken.types';

export class ActionTakenApiError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ActionTakenApiError';
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, ActionTakenApiError.prototype);
  }
}

async function handleApiError(response: Response, fallbackMessage: string): Promise<never> {
  const data = await response.json().catch(() => ({}));
  const message = data.error?.message || fallbackMessage;
  const code = data.error?.code;
  throw new ActionTakenApiError(message, response.status, code);
}

export async function getActionsTaken(ticketId: number): Promise<ActionTakenItem[]> {
  const response = await fetch(`/api/tickets/${ticketId}/actions-taken`, {
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch actions taken');
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
    await handleApiError(response, 'Failed to create action taken');
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
    await handleApiError(response, 'Failed to update action taken');
  }

  const data = await response.json();
  return data.actionTaken;
}
