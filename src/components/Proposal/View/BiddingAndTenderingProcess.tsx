import React, { useMemo } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { ProposalAttributes, ProposalStatus, ProposalType } from '../../../entities/Proposal/types'
import useProposal from '../../../hooks/useProposal'

import ProposalProcess, { ProcessStatus, ProcessType } from './ProposalProcess'

interface Props {
  proposalId?: ProposalAttributes['id']
  proposalType: ProposalType
  proposalStatus: ProposalStatus
  proposalFinishAt: ProposalAttributes['finish_at']
  linkedProposalId?: string
  tenderProposalsTotal?: number
}

const getPitchConfig = (type: ProposalType, status: ProposalStatus) => {
  if (type === ProposalType.Pitch) {
    if (status === ProposalStatus.Active) {
      return { status: ProcessStatus.Active, statusText: 'page.proposal_bidding_tendering.voting_ends' }
    }

    if (status === ProposalStatus.Rejected) {
      return { status: ProcessStatus.Rejected, statusText: 'page.proposal_bidding_tendering.initiative_rejected' }
    }

    if (ProposalStatus.Passed) {
      return { status: ProcessStatus.Passed, statusText: 'page.proposal_bidding_tendering.initiative_passed' }
    }
  }

  if (type === ProposalType.Tender && ProposalStatus.Active) {
    return { status: ProcessStatus.Passed, statusText: 'page.proposal_bidding_tendering.initiative_passed_title' }
  }

  return { status: ProcessStatus.Default, statusText: '' }
}

const getTenderConfig = (type: ProposalType, status: ProposalStatus, tenderProposalsTotal?: number) => {
  if (type === ProposalType.Pitch && status === ProposalStatus.Passed) {
    return {
      status: ProcessStatus.Pending,
      statusText:
        !!tenderProposalsTotal && tenderProposalsTotal > 0
          ? 'page.proposal_bidding_tendering.tender_proposal_submitted'
          : 'page.proposal_bidding_tendering.tender_proposal_pending',
    }
  }

  if (type === ProposalType.Tender) {
    if (status === ProposalStatus.Active) {
      return { status: ProcessStatus.Active, statusText: 'page.proposal_bidding_tendering.voting_ends' }
    }

    if (status === ProposalStatus.Passed) {
      return { status: ProcessStatus.Passed, statusText: 'page.proposal_bidding_tendering.initiative_passed' }
    }

    if (status === ProposalStatus.Rejected) {
      return { status: ProcessStatus.Rejected, statusText: 'page.proposal_bidding_tendering.initiative_rejected' }
    }
  }

  return { status: ProcessStatus.Default, statusText: 'page.proposal_bidding_tendering.tender_proposal_requires' }
}

const getOpenForBidsConfig = (type: ProposalType, status: ProposalStatus) => {
  if (type === ProposalType.Tender && status === ProposalStatus.Passed) {
    return { status: ProcessStatus.Pending, statusText: 'page.proposal_bidding_tendering.open_for_bids_soon' }
  }

  return { status: ProcessStatus.Default, statusText: 'page.proposal_bidding_tendering.open_for_bids_requires' }
}

export default function BiddingAndTenderingProcess({
  proposalType,
  proposalStatus,
  proposalFinishAt,
  linkedProposalId,
  tenderProposalsTotal,
}: Props) {
  const t = useFormatMessage()
  const [pitchProposal] = useProposal(linkedProposalId)

  const finishAt = linkedProposalId ? pitchProposal?.finish_at : proposalFinishAt
  const pitchConfig = getPitchConfig(proposalType, proposalStatus)
  const tenderConfig = getTenderConfig(proposalType, proposalStatus, tenderProposalsTotal)
  const openForBidsConfig = getOpenForBidsConfig(proposalType, proposalStatus)
  const formattedDate = Time(finishAt).fromNow()
  const formattedProposalDate = Time(proposalFinishAt).fromNow()

  const items = useMemo(
    () => [
      {
        title: t('page.proposal_bidding_tendering.pitch_proposal_title'),
        description: t('page.proposal_bidding_tendering.pitch_proposal_description'),
        status: pitchConfig.status,
        statusText: t(pitchConfig.statusText, {
          title: pitchProposal?.title,
          date: formattedDate,
          proposalEndDate: formattedProposalDate,
        }),
      },
      {
        title: t('page.proposal_bidding_tendering.tender_proposal_title'),
        description: t('page.proposal_bidding_tendering.tender_proposal_description'),
        status: tenderConfig.status,
        statusText: t(tenderConfig.statusText, {
          title: pitchProposal?.title,
          date: formattedDate,
          proposalEndDate: formattedProposalDate,
          total: tenderProposalsTotal,
        }),
      },
      {
        title: t('page.proposal_bidding_tendering.open_for_bids_title'),
        description: t('page.proposal_bidding_tendering.open_for_bids_description'),
        status: openForBidsConfig.status,
        statusText: t(openForBidsConfig.statusText),
      },
      {
        title: t('page.proposal_bidding_tendering.project_assignation_title'),
        description: t('page.proposal_bidding_tendering.project_assignation_description'),
        status: ProcessStatus.Default,
        statusText: t('page.proposal_bidding_tendering.tbd'),
      },
    ],
    [
      pitchConfig,
      tenderConfig,
      openForBidsConfig,
      t,
      pitchProposal?.title,
      formattedDate,
      tenderProposalsTotal,
      formattedProposalDate,
    ]
  )

  return (
    <ProposalProcess
      title={t('page.proposal_bidding_tendering.title')}
      items={items}
      isNew
      type={ProcessType.BiddingAndTendering}
    />
  )
}
