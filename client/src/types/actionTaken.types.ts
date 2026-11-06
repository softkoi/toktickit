export interface ActionTakenPerformer {
  id: number;
  name: string;
  email?: string;
  role: string;
}

export type ActionStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ActionTakenItem {
  id: number;
  ticketId: number;
  description: string;
  result: string;
  performedById: number;
  performedBy: ActionTakenPerformer;
  followUpRequired: boolean;
  followUpNote: string | null;
  attachmentNotes: string | null;
  createdAt: string;
  updatedAt: string;
  status?: ActionStatus;
  assigneeName?: string;
  actionDateTime?: string;
}

export interface CreateActionTakenDto {
  description: string;
  result: string;
  followUpRequired?: boolean;
  followUpNote?: string | null;
  attachmentNotes?: string | null;
  status?: ActionStatus;
  assigneeName?: string;
  actionDateTime?: string;
}

export interface UpdateActionTakenDto {
  description?: string;
  result?: string;
  followUpRequired?: boolean;
  followUpNote?: string | null;
  attachmentNotes?: string | null;
  status?: ActionStatus;
  assigneeName?: string;
  actionDateTime?: string;
}

export function parseActionNotes(rawNotes: string | null) {
  let notes = rawNotes || '';
  let status: ActionStatus = 'PLANNED';
  let assignee = 'Unassigned';
  let actionDateTime = '';

  const statusMatch = notes.match(/\[status:(PLANNED|IN_PROGRESS|COMPLETED|CANCELLED)\]/);
  if (statusMatch) {
    status = statusMatch[1] as ActionStatus;
    notes = notes.replace(statusMatch[0], '').trim();
  }

  const assigneeMatch = notes.match(/\[assignee:([^\]]+)\]/);
  if (assigneeMatch) {
    assignee = assigneeMatch[1];
    notes = notes.replace(assigneeMatch[0], '').trim();
  }

  const dateMatch = notes.match(/\[date:([^\]]+)\]/);
  if (dateMatch) {
    actionDateTime = dateMatch[1];
    notes = notes.replace(dateMatch[0], '').trim();
  }

  return { cleanNotes: notes, status, assignee, actionDateTime };
}

export function formatActionNotes(
  cleanNotes: string | null,
  status: ActionStatus,
  assignee: string,
  actionDateTime?: string
) {
  const parts: string[] = [];
  if (status) parts.push(`[status:${status}]`);
  if (assignee) parts.push(`[assignee:${assignee}]`);
  if (actionDateTime) parts.push(`[date:${actionDateTime}]`);
  if (cleanNotes && cleanNotes.trim()) parts.push(cleanNotes.trim());
  return parts.join(' ').trim() || null;
}
