export enum CoauthorStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}

export type CoauthorAttributes = {
  proposal_id: string
  coauthor_address: string
  status: CoauthorStatus
}

export type UpdateStatus = Pick<CoauthorAttributes, 'status'>

export const updateStatusScheme = {
  type: 'object',
  additionalProperties: false,
  required: ['status'],
  properties: {
    status: {
      type: 'string',
      enum: Object.values(CoauthorStatus),
    },
  },
}
