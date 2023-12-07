export type UpdateGeneral = {
  health: ProjectHealth
  introduction: string
  highlights: string
  blockers: string
  next_steps: string
  additional_notes: string
}

export type UpdateFinancialRecord = {
  token_type: string
  concept: string
  description: string
  amount: number
  receiver: string
  link: string
}

export type UpdateFinancial = {
  records: UpdateFinancialRecord[]
}

export type UpdateAttributes = Partial<UpdateGeneral> &
  Partial<UpdateFinancial> & {
    id: string
    proposal_id: string
    author?: string
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

export const UpdateGeneralSchema: Record<keyof UpdateGeneral, Record<string, unknown>> = {
  health: {
    type: 'string',
  },
  introduction: {
    type: 'string',
    minLength: 1,
    maxLength: 500,
  },
  highlights: {
    type: 'string',
    minLength: 1,
    maxLength: 3500,
  },
  blockers: {
    type: 'string',
    minLength: 1,
    maxLength: 3500,
  },
  next_steps: {
    type: 'string',
    minLength: 1,
    maxLength: 3500,
  },
  additional_notes: {
    type: 'string',
    minLength: 1,
    maxLength: 3500,
  },
}

export const UpdateSchema = {
  type: 'object',
  additionalProperties: false,
  required: [...Object.keys(UpdateGeneralSchema)],
  properties: {
    ...UpdateGeneralSchema,
  },
}
