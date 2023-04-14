import React, { useMemo } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { ProposalType } from '../../../entities/Proposal/types'

import ProposalProcess from './ProposalProcess'

interface Props {
  proposalType: ProposalType
}

export default function BiddingAndTenderingProcess({ proposalType }: Props) {
  const t = useFormatMessage()

  const items = useMemo(
    () => [
      {
        title: t('page.proposal_bidding_tendering.pitch_proposal_title'),
        description: t('page.proposal_bidding_tendering.pitch_proposal_description'),
        isSelected: proposalType === ProposalType.Pitch,
      },
      {
        title: t('page.proposal_bidding_tendering.tender_proposal_title'),
        description: t('page.proposal_bidding_tendering.tender_proposal_description'),
        isSelected: false,
      },
      {
        title: t('page.proposal_bidding_tendering.bid_proposal_title'),
        description: t('page.proposal_bidding_tendering.bid_proposal_description'),
        isSelected: false,
      },
    ],
    [proposalType, t]
  )

  return <ProposalProcess title={t('page.proposal_bidding_tendering.title')} items={items} />
}
