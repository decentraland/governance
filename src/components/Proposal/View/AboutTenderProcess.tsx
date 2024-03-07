import { useMemo } from 'react'

import { ProposalAttributes, ProposalStatus } from '../../../entities/Proposal/types'
import { useBidProposals } from '../../../hooks/useBidProposals'
import useBidsInfoOnTender from '../../../hooks/useBidsInfoOnTender'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useProposal from '../../../hooks/useProposal'
import { useTenderProposals } from '../../../hooks/useTenderProposals'
import Time from '../../../utils/date/Time'

import ProposalProcess, { ProcessStatus, ProcessType } from './ProposalProcess'

interface Props {
  proposal: ProposalAttributes
  tenderProposalsTotal?: number
}

const getPitchConfig = () => {
  if (ProposalStatus.Passed) {
    return { status: ProcessStatus.Passed, statusText: 'page.proposal_bidding_tendering.initiative_passed_title' }
  }

  return { status: ProcessStatus.Default, statusText: '' }
}

const getTenderConfig = (status: ProposalStatus) => {
  if (status === ProposalStatus.Pending) {
    return {
      status: ProcessStatus.Pending,
      statusText: 'page.proposal_bidding_tendering.voting_starts',
    }
  }

  if (status === ProposalStatus.Passed) {
    return {
      status: ProcessStatus.Passed,
      statusText: 'page.proposal_bidding_tendering.initiative_passed',
    }
  }

  if (status === ProposalStatus.Rejected) {
    return {
      status: ProcessStatus.Rejected,
      statusText: 'page.proposal_bidding_tendering.initiative_rejected',
    }
  }

  if (status === ProposalStatus.Active) {
    return {
      status: ProcessStatus.Active,
      statusText: 'page.proposal_bidding_tendering.voting_ends',
    }
  }

  return { status: ProcessStatus.Default, statusText: 'page.proposal_bidding_tendering.tender_proposal_requires' }
}

const getOpenForBidsConfig = (status: ProposalStatus, hasUnpublishedBid: boolean, hasBidProposals: boolean) => {
  if (hasBidProposals) {
    return { status: ProcessStatus.Passed, statusText: 'page.proposal_bidding_tendering.open_for_bids_closed' }
  }

  if (hasUnpublishedBid) {
    return { status: ProcessStatus.Active, statusText: 'page.proposal_bidding_tendering.open_for_bids_begins' }
  }

  if (status === ProposalStatus.Passed && !hasBidProposals) {
    return { status: ProcessStatus.Active, statusText: 'page.proposal_bidding_tendering.open_for_bids_open' }
  }

  return { status: ProcessStatus.Default, statusText: 'page.proposal_bidding_tendering.open_for_bids_requires' }
}

const getProjectAssignationConfig = (hasBidProposals: boolean, hasWinnerBid: boolean, hasRejectedBid: boolean) => {
  if (hasBidProposals && !hasWinnerBid && !hasRejectedBid) {
    return { status: ProcessStatus.Pending, statusText: 'page.proposal_bidding_tendering.voting_ends' }
  }

  if (hasWinnerBid) {
    return { status: ProcessStatus.Active, statusText: 'page.proposal_bidding_tendering.project_assignation_passed' }
  }

  if (hasRejectedBid) {
    return { status: ProcessStatus.Rejected, statusText: 'page.proposal_bidding_tendering.project_assignation_failed' }
  }

  return { status: ProcessStatus.Default, statusText: 'page.proposal_bidding_tendering.tbd' }
}

export default function AboutTenderProcess({ proposal }: Props) {
  const t = useFormatMessage()
  const { start_at, finish_at, status, configuration } = proposal
  const pitchProposalId = configuration.linked_proposal_id
  const { proposal: pitchProposal } = useProposal(pitchProposalId)
  const { tenderProposals, winnerTenderProposal } = useTenderProposals(pitchProposalId, proposal.type)
  const { bidProposals } = useBidProposals(winnerTenderProposal?.id, winnerTenderProposal?.type)
  const hasBidProposals = Number(bidProposals?.total) > 0

  const bidsInfo = useBidsInfoOnTender(winnerTenderProposal?.id)
  const pitchConfig = getPitchConfig()
  const tenderConfig = getTenderConfig(status)
  const openForBidsConfig = getOpenForBidsConfig(proposal.status, !!bidsInfo?.publishAt, hasBidProposals)
  const projectAssignationConfig = getProjectAssignationConfig(
    hasBidProposals,
    !!bidProposals?.data.find(
      (item) => item.status === ProposalStatus.Passed || item.status === ProposalStatus.Enacted
    ),
    !!bidProposals?.data.find((item) => item.status === ProposalStatus.Rejected)
  )

  const items = useMemo(
    () => [
      {
        title: t('page.proposal_bidding_tendering.pitch_proposal_title'),
        description: t('page.proposal_bidding_tendering.pitch_proposal_description'),
        status: pitchConfig.status,
        statusText: t(pitchConfig.statusText, {
          title: pitchProposal?.title,
          date: Time(pitchProposal?.start_at).fromNow(),
          proposalEndDate: Time(pitchProposal?.finish_at).fromNow(),
        }),
      },
      {
        title: t('page.proposal_bidding_tendering.tender_proposal_title'),
        description: t('page.proposal_bidding_tendering.tender_proposal_description'),
        status: tenderConfig.status,
        statusText: t(tenderConfig.statusText, {
          title: proposal.title,
          date: Time(start_at).fromNow(),
          proposalEndDate: Time(finish_at).fromNow(),
          total: tenderProposals?.total,
        }),
      },
      {
        title: t('page.proposal_bidding_tendering.open_for_bids_title'),
        description: t('page.proposal_bidding_tendering.open_for_bids_description'),
        status: openForBidsConfig.status,
        statusText: t(openForBidsConfig.statusText, {
          date: Time(bidProposals?.data[0]?.start_at || bidsInfo?.publishAt).fromNow(),
        }),
      },
      {
        title: t('page.proposal_bidding_tendering.project_assignation_title'),
        description: t('page.proposal_bidding_tendering.project_assignation_description'),
        status: projectAssignationConfig.status,
        statusText: t(projectAssignationConfig.statusText, {
          proposalEndDate: Time(bidProposals?.data[0]?.finish_at).fromNow(),
        }),
      },
    ],
    [
      start_at,
      bidsInfo?.publishAt,
      finish_at,
      openForBidsConfig,
      pitchConfig,
      tenderConfig,
      t,
      proposal.title,
      tenderProposals,
      projectAssignationConfig,
      pitchProposal,
      bidProposals,
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
