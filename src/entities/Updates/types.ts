export type UpdateAttributes = {
  id: string
  proposal_id: string
  title?: string
  description?: string,
  status: UpdateStatus
  due_date?: Date
  completion_date?: Date
  created_at: Date
  updated_at: Date
}

export enum UpdateStatus {
  Pending = 'pending',
  Late = 'late',
  Done = 'done',
}

