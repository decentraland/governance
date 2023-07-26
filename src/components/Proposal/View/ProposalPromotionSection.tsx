import React from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { ProposalAttributes, ProposalType } from '../../../entities/Proposal/types'
import useBidsInfoOnTender from '../../../hooks/useBidsInfoOnTender'
import useCountdown from '../../../hooks/useCountdown'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { useTenderProposals } from '../../../hooks/useTenderProposals'
import Time from '../../../utils/date/Time'
import locations, { navigate } from '../../../utils/locations'
import Pill from '../../Common/Pill'
import Markdown from '../../Common/Typography/Markdown'
import Text from '../../Common/Typography/Text'

import './ProposalPromotionSection.css'

interface Props {
  proposal: ProposalAttributes
  loading?: boolean
}

const getSectionConfig = (type: ProposalType) => {
  switch (type) {
    case ProposalType.Poll:
      return {
        pillLabel: 'page.proposal_detail.promotion.opportunity_label',
        description: 'page.proposal_detail.promotion.draft_text',
        buttonLabel: 'page.proposal_detail.promotion.promote_to_draft_label',
        promotedType: ProposalType.Draft,
      }
    case ProposalType.Draft:
      return {
        pillLabel: 'page.proposal_detail.promotion.opportunity_label',
        description: 'page.proposal_detail.promotion.governance_text',
        buttonLabel: 'page.proposal_detail.promotion.promote_to_governance_label',
        promotedType: ProposalType.Governance,
      }
    case ProposalType.Pitch:
      return {
        pillLabel: 'page.proposal_detail.promotion.open_for_tenders_label',
        description: 'page.proposal_detail.promotion.tender_text',
        buttonLabel: 'page.proposal_detail.promotion.promote_to_tender_label',
        promotedType: ProposalType.Tender,
      }
    case ProposalType.Tender:
      return {
        pillLabel: 'page.proposal_detail.promotion.open_for_bids_label',
        description: 'page.proposal_detail.promotion.submit_bid_proposal_text',
        buttonLabel: 'page.proposal_detail.promotion.submit_bid_proposal_label',
        promotedType: ProposalType.Bid,
      }
    default:
      return {
        pillLabel: '',
        description: '',
        buttonLabel: '',
        promotedType: null,
      }
  }
}

function Countdown({ startAt }: { startAt: string | Date }) {
  const t = useFormatMessage()
  const { hours, minutes, seconds, time } = useCountdown(Time(startAt))

  if (time <= 0) {
    return null
  }

  return (
    <Text className="ProposalPromotionSection__Text ProposalPromotionSection__Countdown" size="xs">
      {t('page.proposal_detail.promotion.submit_countdown', { value: `${hours}:${minutes}:${seconds}` })}
    </Text>
  )
}

export default function ProposalPromotionSection({ proposal, loading }: Props) {
  const t = useFormatMessage()
  const { id, type } = proposal
  const { tenderProposals, hasTenderProcessStarted } = useTenderProposals(id, type)
  const bidsInfo = useBidsInfoOnTender(id)
  const hasBidProcessStarted = !!bidsInfo?.publishAt && Time().isBefore(bidsInfo?.publishAt)
  const { pillLabel, description, buttonLabel, promotedType } = getSectionConfig(type)

  const handlePromoteClick = () => {
    if (promotedType) {
      navigate(locations.submit(promotedType, { linked_proposal_id: id }), { replace: true })
    }
  }

  const isPromoteDisabled =
    (type === ProposalType.Pitch && hasTenderProcessStarted) ||
    (type === ProposalType.Tender && bidsInfo.isSubmissionWindowFinished)

  const showTenderCountdown =
    type === ProposalType.Pitch && hasTenderProcessStarted && tenderProposals?.data[0].start_at
  const showBidCountdown = type === ProposalType.Tender && hasBidProcessStarted && bidsInfo?.publishAt

  return (
    <div className="ProposalPromotionSection">
      <Pill color="green" style="shiny">
        {t(pillLabel)}
      </Pill>
      <Markdown className="ProposalPromotionSection__Text" size="sm">
        {t(description)}
      </Markdown>
      <Button primary size="small" loading={loading} onClick={() => handlePromoteClick()} disabled={isPromoteDisabled}>
        {t(buttonLabel)}
      </Button>
      {(type === ProposalType.Poll || type === ProposalType.Draft) && (
        <Markdown className="ProposalPromotionSection__Text" size="xs">
          {t('page.proposal_detail.promotion.info_text')}
        </Markdown>
      )}
      {showTenderCountdown && <Countdown startAt={tenderProposals?.data[0].start_at} />}
      {showBidCountdown && bidsInfo?.publishAt && <Countdown startAt={bidsInfo.publishAt} />}
    </div>
  )
}
