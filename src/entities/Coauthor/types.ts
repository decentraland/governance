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

export function isCoauthorStatusType(value: string | null | undefined): boolean {
  switch (value) {
    case CoauthorStatus.APPROVED:
    case CoauthorStatus.REJECTED:
    case CoauthorStatus.PENDING:
      return true

    default:
      return false
  }
}

export function toCoauthorStatusType(value: string | null | undefined): CoauthorStatus | undefined {
  return isCoauthorStatusType(value) ? (value as CoauthorStatus) : undefined
}
