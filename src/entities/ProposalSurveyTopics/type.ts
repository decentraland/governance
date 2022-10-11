import { ProposalType } from '../Proposal/types'

export type ProposalSurveyTopicAttributes = {
  id: string
  topic_id: string
  proposal_type: ProposalType
  proposal_sub_types: string | null
  created_at: Date
  updated_at: Date
}
