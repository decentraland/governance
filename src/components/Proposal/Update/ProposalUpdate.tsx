import React from 'react'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { ProjectHealth, UpdateAttributes } from '../../../entities/Updates/types'
import CancelIcon from '../../Icon/Cancel'
import CheckIcon from '../../Icon/Check'
import QuestionCircleIcon from '../../Icon/QuestionCircle'
import WarningIcon from '../../Icon/Warning'

import CollapsedProposalUpdate from './CollapsedProposalUpdate'
import EmptyProposalUpdate from './EmptyProposalUpdate'
import ExpandedProposalUpdate from './ExpandedProposalUpdate'
import './ProposalUpdate.css'

interface Props {
  proposal: ProposalAttributes
  update: UpdateAttributes | null
  expanded: boolean
  index?: number
}

export const getStatusIcon = (
  health: UpdateAttributes['health'],
  completion_date: UpdateAttributes['completion_date']
) => {
  if (!completion_date) {
    return QuestionCircleIcon
  }

  switch (health) {
    case ProjectHealth.OnTrack:
      return CheckIcon
    case ProjectHealth.AtRisk:
      return WarningIcon
    case ProjectHealth.OffTrack:
    default:
      return CancelIcon
  }
}

const ProposalUpdate = ({ proposal, update, expanded, index }: Props) => {
  if (!update) {
    return <EmptyProposalUpdate />
  }

  if (expanded && update.completion_date) {
    return <ExpandedProposalUpdate update={update} index={index} />
  }

  return <CollapsedProposalUpdate proposal={proposal} update={update} index={index} />
}

export default ProposalUpdate
