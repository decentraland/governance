import { useMemo } from 'react'

import { ProposalAttributes, ProposalStatus } from '../../../entities/Proposal/types'
import { useBidProposals } from '../../../hooks/useBidProposals'
import useBidsInfoOnTender from '../../../hooks/useBidsInfoOnTender'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { useTenderProposals } from '../../../hooks/useTenderProposals'
import Time from '../../../utils/date/Time'

import ProposalProcess, { ProcessStatus, ProcessType } from './ProposalProcess'

interface Props {
  proposal: ProposalAttributes
  tenderProposalsTotal?: number
}

const getPitchConfig = (status: ProposalStatus) => {
  if (status === ProposalStatus.Active) {
    return { status: ProcessStatus.Active, statusText: 'page.proposal_bidding_tendering.voting_ends' }
  }

  if (status === ProposalStatus.Rejected) {
    return { status: ProcessStatus.Rejected, statusText: 'page.proposal_bidding_tendering.initiative_rejected' }
  }

  if (ProposalStatus.Passed) {
    return { status: ProcessStatus.Passed, statusText: 'page.proposal_bidding_tendering.initiative_passed' }
  }

  return { status: ProcessStatus.Default, statusText: '' }
}

const getTenderConfig = (
  status: ProposalStatus,
  tenderProposalsTotal: number | undefined,
  hasWinnerTenderProposal: boolean
) => {
  if (status === ProposalStatus.Passed && hasWinnerTenderProposal) {
    return {
      status: ProcessStatus.Passed,
      statusText: 'page.proposal_bidding_tendering.initiative_passed_title',
    }
  }

  if (status === ProposalStatus.Passed) {
    return {
      status: hasWinnerTenderProposal ? ProcessStatus.Passed : ProcessStatus.Pending,
      statusText:
        !!tenderProposalsTotal && tenderProposalsTotal > 0
          ? 'page.proposal_bidding_tendering.tender_proposal_submitted'
          : 'page.proposal_bidding_tendering.tender_proposal_pending',
    }
  }

  return { status: ProcessStatus.Default, statusText: 'page.proposal_bidding_tendering.tender_proposal_requires' }
}

const getOpenForBidsConfig = (
  hasWinnerTenderProposal: boolean,
  hasUnpublishedBid: boolean,
  hasBidProposals: boolean
) => {
  if (hasWinnerTenderProposal && !hasUnpublishedBid && !hasBidProposals) {
    return { status: ProcessStatus.Active, statusText: 'page.proposal_bidding_tendering.open_for_bids_open' }
  }

  if (hasBidProposals) {
    return { status: ProcessStatus.Passed, statusText: 'page.proposal_bidding_tendering.open_for_bids_closed' }
  }

  if (hasUnpublishedBid) {
    return { status: ProcessStatus.Active, statusText: 'page.proposal_bidding_tendering.open_for_bids_begins' }
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

export default function AboutPitchProcess({ proposal }: Props) {
  const t = useFormatMessage()
  const { start_at, finish_at, status } = proposal
  const { tenderProposals, winnerTenderProposal } = useTenderProposals(proposal.id, proposal.type)
  const { bidProposals } = useBidProposals(winnerTenderProposal?.id, winnerTenderProposal?.type)
  const hasBidProposals = Number(bidProposals?.total) > 0

  const bidsInfo = useBidsInfoOnTender(winnerTenderProposal?.id)
  const pitchConfig = getPitchConfig(status)
  const tenderConfig = getTenderConfig(status, tenderProposals?.total, !!winnerTenderProposal)
  const openForBidsConfig = getOpenForBidsConfig(!!winnerTenderProposal, !!bidsInfo?.publishAt, hasBidProposals)
  const projectAssignationConfig = getProjectAssignationConfig(
    hasBidProposals,
    !!bidProposals?.data.find(
      (item) => item.status === ProposalStatus.Passed || item.status === ProposalStatus.Enacted
    ),
    !!bidProposals?.data.find((item) => item.status === ProposalStatus.Rejected)
  )
  const formattedDate = Time(start_at).fromNow()
  const formattedProposalEndDate = Time(finish_at).fromNow()

  const items = useMemo(
    () => [
      {
        title: t('page.proposal_bidding_tendering.pitch_proposal_title'),
        description: t('page.proposal_bidding_tendering.pitch_proposal_description'),
        status: pitchConfig.status,
        statusText: t(pitchConfig.statusText, {
          title: proposal.title,
          date: formattedDate,
          proposalEndDate: formattedProposalEndDate,
        }),
      },
      {
        title: t('page.proposal_bidding_tendering.tender_proposal_title'),
        description: t('page.proposal_bidding_tendering.tender_proposal_description'),
        status: tenderConfig.status,
        statusText: t(tenderConfig.statusText, {
          title: winnerTenderProposal?.title,
          date: formattedDate,
          proposalEndDate: formattedProposalEndDate,
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
      formattedDate,
      bidsInfo,
      formattedProposalEndDate,
      openForBidsConfig,
      pitchConfig,
      tenderConfig,
      bidProposals,
      t,
      proposal.title,
      tenderProposals,
      projectAssignationConfig,
      winnerTenderProposal,
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
