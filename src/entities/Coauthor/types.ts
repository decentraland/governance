export enum CoauthorStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}

export type CoauthorAttributes = {
  proposal_id: string
  address: string
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

export function toCoauthorStatusType(value: string | null | undefined): CoauthorStatus | undefined {
  if (!value) {
    return
  }

  const upperValue = value.toUpperCase()
  switch (upperValue) {
    case CoauthorStatus.APPROVED:
    case CoauthorStatus.REJECTED:
    case CoauthorStatus.PENDING:
      return upperValue as CoauthorStatus

    default:
      throw new Error('Invalid status')
  }
}
