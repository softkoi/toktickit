export interface ActionTakenPerformer {
  id: number;
  name: string;
  email?: string;
  role: string;
}

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
}

export interface CreateActionTakenDto {
  description: string;
  result: string;
  followUpRequired?: boolean;
  followUpNote?: string | null;
  attachmentNotes?: string | null;
}

export interface UpdateActionTakenDto {
  description?: string;
  result?: string;
  followUpRequired?: boolean;
  followUpNote?: string | null;
  attachmentNotes?: string | null;
}
