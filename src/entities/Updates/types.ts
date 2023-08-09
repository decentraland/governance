export type UpdateAttributes = {
  id: string
  proposal_id: string
  author?: string
  health?: ProjectHealth
  introduction?: string
  highlights?: string
  blockers?: string
  next_steps?: string
  additional_notes?: string
  status: UpdateStatus
  due_date?: Date
  completion_date?: Date
  created_at: Date
  updated_at: Date
  discourse_topic_id?: number
  discourse_topic_slug?: string
}

export type IndexedUpdate = UpdateAttributes & {
  index: number
}

export enum UpdateStatus {
  Pending = 'pending',
  Late = 'late',
  Done = 'done',
}

export enum ProjectHealth {
  OnTrack = 'onTrack',
  AtRisk = 'atRisk',
  OffTrack = 'offTrack',
}

export type UpdateResponse = {
  publicUpdates: UpdateAttributes[]
  pendingUpdates: UpdateAttributes[]
  nextUpdate: UpdateAttributes
  currentUpdate: UpdateAttributes | null
}
