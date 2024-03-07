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
  return { status: ProcessStatus.Passed, statusText: 'page.proposal_bidding_tendering.initiative_passed_title' }
}

const getTenderConfig = () => {
  return { status: ProcessStatus.Passed, statusText: 'page.proposal_bidding_tendering.initiative_passed_title' }
}

const getOpenForBidsConfig = (hasUnpublishedBid: boolean, hasBidProposals: boolean) => {
  if (hasBidProposals) {
    return { status: ProcessStatus.Passed, statusText: 'page.proposal_bidding_tendering.open_for_bids_closed' }
  }

  if (hasUnpublishedBid) {
    return { status: ProcessStatus.Active, statusText: 'page.proposal_bidding_tendering.open_for_bids_begins' }
  }

  return { status: ProcessStatus.Default, statusText: 'page.proposal_bidding_tendering.open_for_bids_requires' }
}

const getProjectAssignationConfig = (status: ProposalStatus) => {
  if (status === ProposalStatus.Passed || status === ProposalStatus.Enacted) {
    return { status: ProcessStatus.Passed, statusText: 'page.proposal_bidding_tendering.initiative_passed' }
  }

  if (status === ProposalStatus.Rejected) {
    return { status: ProcessStatus.Rejected, statusText: 'page.proposal_bidding_tendering.initiative_rejected' }
  }

  if (status === ProposalStatus.Active) {
    return { status: ProcessStatus.Active, statusText: 'page.proposal_bidding_tendering.voting_ends' }
  }

  return { status: ProcessStatus.Default, statusText: 'page.proposal_bidding_tendering.tbd' }
}

export default function AboutBidProcess({ proposal }: Props) {
  const t = useFormatMessage()
  const { start_at, finish_at, configuration, status } = proposal
  const tenderProposalId = configuration.linked_proposal_id
  const { proposal: tenderProposal } = useProposal(tenderProposalId)
  const { proposal: pitchProposal } = useProposal(tenderProposal?.configuration.linked_proposal_id)
  const { tenderProposals, winnerTenderProposal } = useTenderProposals(pitchProposal?.id, pitchProposal?.type)
  const bidsInfo = useBidsInfoOnTender(winnerTenderProposal?.id)
  const { bidProposals } = useBidProposals(winnerTenderProposal?.id, winnerTenderProposal?.type)
  const pitchConfig = getPitchConfig()
  const tenderConfig = getTenderConfig()
  const openForBidsConfig = getOpenForBidsConfig(!!bidsInfo?.publishAt, Number(bidProposals?.total) > 0)
  const projectAssignationConfig = getProjectAssignationConfig(status)
  const formattedProposalEndDate = Time(finish_at).fromNow()
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
          title: winnerTenderProposal?.title,
          date: Time(start_at).fromNow(),
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
        statusText: t(projectAssignationConfig.statusText, { proposalEndDate: formattedProposalEndDate }),
      },
    ],
    [
      start_at,
      bidsInfo,
      winnerTenderProposal,
      formattedProposalEndDate,
      openForBidsConfig,
      pitchConfig,
      bidProposals?.data,
      tenderConfig,
      t,
      tenderProposals,
      projectAssignationConfig,
      pitchProposal,
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
