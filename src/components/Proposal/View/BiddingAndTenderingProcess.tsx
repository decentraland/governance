import React, { useMemo } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { ProposalAttributes, ProposalStatus, ProposalType } from '../../../entities/Proposal/types'

import ProposalProcess, { ProcessStatus } from './ProposalProcess'

interface Props {
  proposalType: ProposalType
  proposalStatus: ProposalStatus
  proposalFinishAt: ProposalAttributes['finish_at']
}

const getPitchConfig = (type: ProposalType, status: ProposalStatus, finishAt: string) => {
  if (type === ProposalType.Pitch && status === ProposalStatus.Active) {
    return { status: ProcessStatus.Active, statusText: `Voting ends ${finishAt}` }
  }

  if (type === ProposalType.Pitch && status === ProposalStatus.Rejected) {
    return { status: ProcessStatus.Rejected, statusText: `Pitch rejected ${finishAt}` }
  }

  if (
    (type === ProposalType.Pitch && ProposalStatus.Passed) ||
    (type === ProposalType.Tender && ProposalStatus.Active)
  ) {
    return { status: ProcessStatus.Passed, statusText: `This initiative passed ${finishAt}` }
  }

  return { status: ProcessStatus.Default, statusText: '' }
}

const getTenderConfig = (type: ProposalType, status: ProposalStatus, finishAt: string) => {
  if (type === ProposalType.Tender && status === ProposalStatus.Active) {
    return { status: ProcessStatus.Active, statusText: `Voting ends ${finishAt}` }
  }

  if (type === ProposalType.Tender && status === ProposalStatus.Passed) {
    return { status: ProcessStatus.Passed, statusText: `This tender proposal passed ${finishAt}` }
  }

  if (type === ProposalType.Tender && status === ProposalStatus.Rejected) {
    return { status: ProcessStatus.Rejected, statusText: 'Tender rejected' }
  }

  return { status: ProcessStatus.Default, statusText: 'Requires tender to pass' }
}

const getOpenForBidsConfig = (type: ProposalType, status: ProposalStatus) => {
  if (type === ProposalType.Tender && status === ProposalStatus.Passed) {
    return { status: ProcessStatus.Pending, statusText: 'Bidding Begins Soon' }
  }

  return { status: ProcessStatus.Default, statusText: 'Requires Tender to Pass' }
}

export default function BiddingAndTenderingProcess({ proposalType, proposalStatus, proposalFinishAt }: Props) {
  const t = useFormatMessage()

  const pitchConfig = getPitchConfig(proposalType, proposalStatus, Time(proposalFinishAt).fromNow())
  const tenderConfig = getTenderConfig(proposalType, proposalStatus, Time(proposalFinishAt).fromNow())
  const openForBidsConfig = getOpenForBidsConfig(proposalType, proposalStatus)

  const items = useMemo(
    () => [
      {
        title: t('page.proposal_bidding_tendering.pitch_proposal_title'),
        description: t('page.proposal_bidding_tendering.pitch_proposal_description'),
        status: pitchConfig.status,
        statusText: pitchConfig.statusText,
      },
      {
        title: t('page.proposal_bidding_tendering.tender_proposal_title'),
        description: t('page.proposal_bidding_tendering.tender_proposal_description'),
        status: tenderConfig.status,
        statusText: tenderConfig.statusText,
      },
      {
        title: t('page.proposal_bidding_tendering.open_for_bids_title'),
        description: t('page.proposal_bidding_tendering.open_for_bids_description'),
        status: openForBidsConfig.status,
        statusText: openForBidsConfig.statusText,
      },
      {
        title: t('page.proposal_bidding_tendering.project_assignation_title'),
        description: t('page.proposal_bidding_tendering.project_assignation_description'),
        status: ProcessStatus.Default,
        statusText: 'TBD',
      },
    ],
    [pitchConfig, tenderConfig, openForBidsConfig, t]
  )

  return <ProposalProcess title={t('page.proposal_bidding_tendering.title')} items={items} />
}
