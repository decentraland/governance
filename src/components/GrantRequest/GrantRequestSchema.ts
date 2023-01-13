import { GRANT_PROPOSAL_MAX_BUDGET, GRANT_PROPOSAL_MIN_BUDGET } from '../../entities/Grant/constants'

export const GrantRequestGeneralInfoSchema = {
  description: { type: 'string', minLength: 20, maxLength: 3500 },
}

export const GrantRequestFundingSchema = {
  funding: {
    type: 'integer',
    minimum: Number(GRANT_PROPOSAL_MIN_BUDGET || 0),
    maximum: Number(GRANT_PROPOSAL_MAX_BUDGET || 0),
  },
}

export const GrantRequestSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'funding', 'description'],
  properties: {
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 80,
    },
    ...GrantRequestFundingSchema,
    ...GrantRequestGeneralInfoSchema,
  },
}
