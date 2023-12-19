import { z } from 'zod'

export type GeneralUpdate = {
  health: ProjectHealth
  introduction: string
  highlights: string
  blockers: string
  next_steps: string
  additional_notes: string
}

export type FinancialUpdateRecord = z.infer<typeof FinancialUpdateRecordSchema>

export type FinancialUpdate = z.infer<typeof FinancialUpdateSchema>

export type UpdateAttributes = Partial<GeneralUpdate> &
  Partial<FinancialUpdate> & {
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

export const GeneralUpdateSchema: Record<keyof GeneralUpdate, Record<string, unknown>> = {
  health: {
    type: 'string',
    enum: Object.values(ProjectHealth),
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
  required: [...Object.keys(GeneralUpdateSchema)],
  properties: {
    ...GeneralUpdateSchema,
  },
}

const FinancialUpdateRecordSchema = z.object({
  concept: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().min(1),
  token_type: z.string().min(3).max(4),
  receiver: z.string().min(1),
  link: z.string().url(),
})

export const FinancialUpdateSchema = z.object({
  records: z.array(FinancialUpdateRecordSchema).min(1),
})
