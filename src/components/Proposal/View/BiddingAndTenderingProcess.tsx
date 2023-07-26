import React, { useMemo } from 'react'

import { ProposalAttributes, ProposalStatus, ProposalType } from '../../../entities/Proposal/types'
import useBidsInfoOnTender from '../../../hooks/useBidsInfoOnTender'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useProposal from '../../../hooks/useProposal'
import Time from '../../../utils/date/Time'

import ProposalProcess, { ProcessStatus, ProcessType } from './ProposalProcess'

interface Props {
  proposal: ProposalAttributes
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

  if (type === ProposalType.Bid) {
    return { status: ProcessStatus.Passed, statusText: 'page.proposal_bidding_tendering.initiative_passed_title' }
  }

  return { status: ProcessStatus.Default, statusText: '' }
}

const getTenderConfig = (
  type: ProposalType,
  status: ProposalStatus,
  startAt: ProposalAttributes['start_at'],
  tenderProposalsTotal?: number
) => {
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
      const timeKey = Time().isAfter(startAt) ? 'voting_ends' : 'voting_starts'
      return { status: ProcessStatus.Active, statusText: `page.proposal_bidding_tendering.${timeKey}` }
    }

    if (status === ProposalStatus.Passed) {
      return { status: ProcessStatus.Passed, statusText: 'page.proposal_bidding_tendering.initiative_passed' }
    }

    if (status === ProposalStatus.Rejected) {
      return { status: ProcessStatus.Rejected, statusText: 'page.proposal_bidding_tendering.initiative_rejected' }
    }
  }

  if (type === ProposalType.Bid) {
    return { status: ProcessStatus.Passed, statusText: 'page.proposal_bidding_tendering.initiative_passed_title' }
  }

  return { status: ProcessStatus.Default, statusText: 'page.proposal_bidding_tendering.tender_proposal_requires' }
}

const getOpenForBidsConfig = (
  type: ProposalType,
  status: ProposalStatus,
  startAt: Date | string | undefined,
  isSubmissionWindowFinished?: boolean
) => {
  if (type === ProposalType.Tender && status === ProposalStatus.Passed) {
    if (startAt && !isSubmissionWindowFinished) {
      return { status: ProcessStatus.Pending, statusText: 'page.proposal_bidding_tendering.open_for_bids_soon' }
    }
    return { status: ProcessStatus.Pending, statusText: 'page.proposal_bidding_tendering.open_for_bids_soon' }
  }

  if (type === ProposalType.Bid) {
    return { status: ProcessStatus.Passed, statusText: 'page.proposal_bidding_tendering.open_for_bids_inbound' }
  }

  return { status: ProcessStatus.Default, statusText: 'page.proposal_bidding_tendering.open_for_bids_requires' }
}

const getProjectAssignationConfig = (type: ProposalType, status: ProposalStatus, startAt?: Date | string) => {
  if (type === ProposalType.Bid) {
    if (status === ProposalStatus.Active) {
      const timeKey = Time().isAfter(startAt) ? 'voting_ends' : 'voting_starts'
      return { status: ProcessStatus.Active, statusText: `page.proposal_bidding_tendering.${timeKey}` }
    }

    if (status === ProposalStatus.Rejected) {
      return {
        status: ProcessStatus.Rejected,
        statusText: 'page.proposal_bidding_tendering.project_assignation_failed',
      }
    }
  }

  return { status: ProcessStatus.Default, statusText: 'page.proposal_bidding_tendering.open_for_bids_requires' }
}

export default function BiddingAndTenderingProcess({ proposal, tenderProposalsTotal }: Props) {
  const t = useFormatMessage()
  const { configuration, start_at, finish_at, type, status } = proposal
  const { linked_proposal_id } = configuration
  const { proposal: pitchProposal } = useProposal(linked_proposal_id) // TODO: This could be a tender or a bid too
  const { proposal: tenderProposal } = useProposal(pitchProposal?.configuration.linked_proposal_id) // TODO: This could be a tender or a bid too

  const bidsInfo = useBidsInfoOnTender(proposal.id)
  const finishAt = linked_proposal_id ? pitchProposal?.finish_at : finish_at
  const pitchConfig = getPitchConfig(type, status)
  const tenderConfig = getTenderConfig(type, status, start_at, tenderProposalsTotal)
  const openForBidsConfig = getOpenForBidsConfig(type, status, start_at, bidsInfo?.isSubmissionWindowFinished)
  const projectAssignationConfig = getProjectAssignationConfig(type, status, start_at)
  const formattedDate = Time(finishAt).fromNow()
  const formattedProposalDate = Time(finish_at).fromNow()

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
          title: tenderProposal?.title,
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
        status: projectAssignationConfig.status,
        statusText: t(projectAssignationConfig.statusText, { proposalEndDate: formattedProposalDate }),
      },
    ],
    [
      pitchConfig,
      tenderConfig,
      openForBidsConfig,
      tenderProposal?.title,
      projectAssignationConfig.status,
      projectAssignationConfig.statusText,
      t,
      formattedDate,
      pitchProposal?.title,
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
