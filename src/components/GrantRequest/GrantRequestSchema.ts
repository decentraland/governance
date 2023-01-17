import {
  GRANT_PROPOSAL_MAX_BUDGET,
  GRANT_PROPOSAL_MAX_PROJECT_DURATION,
  GRANT_PROPOSAL_MIN_BUDGET,
  GRANT_PROPOSAL_MIN_PROJECT_DURATION,
} from '../../entities/Grant/constants'

export const GrantRequestGeneralInfoSchema = {
  description: { type: 'string', minLength: 20, maxLength: 3500 },
  specification: {
    type: 'string',
    minLength: 20,
    maxLength: 3500,
  },
}

export const GrantRequestFundingSchema = {
  funding: {
    type: 'integer',
    minimum: Number(GRANT_PROPOSAL_MIN_BUDGET || 0),
    maximum: Number(GRANT_PROPOSAL_MAX_BUDGET || 0),
  },
  projectDuration: {
    type: 'integer',
    minimum: GRANT_PROPOSAL_MIN_PROJECT_DURATION,
    maximum: GRANT_PROPOSAL_MAX_PROJECT_DURATION,
  },
}

export const GrantRequestSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'funding', 'projectDuration', 'description', 'specification'],
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
