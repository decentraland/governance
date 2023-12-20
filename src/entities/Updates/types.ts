import { z } from 'zod'

export type GeneralUpdateSection = {
  health: ProjectHealth
  introduction: string
  highlights: string
  blockers: string
  next_steps: string
  additional_notes: string
}

export type FinancialRecord = z.infer<typeof FinancialRecordSchema>

export type FinancialUpdateSection = z.infer<typeof FinancialUpdateSectionSchema>

export type UpdateAttributes = Partial<GeneralUpdateSection> &
  Partial<FinancialUpdateSection> & {
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

export const GeneralUpdateSectionSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['health', 'introduction', 'highlights', 'blockers', 'next_steps', 'additional_notes'],
  properties: {
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
  },
}

const FinancialRecordSchema = z.object({
  concept: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().min(1),
  token_type: z.string().min(3).max(4),
  receiver: z.string().min(1),
  link: z.string().url(),
})

export const FinancialUpdateSectionSchema = z.object({
  financial_records: z.array(FinancialRecordSchema).min(1),
})
