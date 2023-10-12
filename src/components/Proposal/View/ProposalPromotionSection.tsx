import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { ProposalAttributes, ProposalType, ProposalTypes } from '../../../entities/Proposal/types'
import useBidsInfoOnTender from '../../../hooks/useBidsInfoOnTender'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { useTenderProposals } from '../../../hooks/useTenderProposals'
import useUserBid from '../../../hooks/useUserBid'
import Time from '../../../utils/date/Time'
import locations from '../../../utils/locations'
import Pill from '../../Common/Pill'
import Link from '../../Common/Typography/Link'
import Markdown from '../../Common/Typography/Markdown'

import ProposalPromotionCountdown from './ProposalPromotionCountdown'
import './ProposalPromotionSection.css'

interface Props {
  proposal: ProposalAttributes
  loading?: boolean
}

const getSectionConfig = (type: ProposalTypes) => {
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

export default function ProposalPromotionSection({ proposal, loading }: Props) {
  const t = useFormatMessage()
  const { id, type } = proposal
  const { tenderProposals, hasTenderProcessStarted } = useTenderProposals(id, type)
  const bidsInfo = useBidsInfoOnTender(id)
  const userBid = useUserBid(id)
  const hasBidProcessStarted = !!bidsInfo?.publishAt && Time().isBefore(bidsInfo?.publishAt)
  const { pillLabel, description, buttonLabel, promotedType } = getSectionConfig(type)

  const isPromoteDisabled =
    (type === ProposalType.Pitch && hasTenderProcessStarted) ||
    (type === ProposalType.Tender && (bidsInfo.isSubmissionWindowFinished || !!userBid))

  const showTenderCountdown =
    type === ProposalType.Pitch && Number(tenderProposals?.total) > 0 && tenderProposals?.data[0].start_at
  const showBidCountdown = type === ProposalType.Tender && hasBidProcessStarted && bidsInfo?.publishAt

  return (
    <div className="ProposalPromotionSection">
      <Pill color="green" style="shiny">
        {t(pillLabel)}
      </Pill>
      <Markdown className="ProposalPromotionSection__Text" size="sm">
        {t(description)}
      </Markdown>
      <Button
        as={Link}
        primary
        href={promotedType ? locations.submit(promotedType, { linked_proposal_id: id }) : undefined}
        size="small"
        loading={loading}
        disabled={isPromoteDisabled}
      >
        {t(buttonLabel)}
      </Button>
      {(type === ProposalType.Poll || type === ProposalType.Draft) && (
        <Markdown className="ProposalPromotionSection__Text" size="xs">
          {t('page.proposal_detail.promotion.info_text')}
        </Markdown>
      )}
      {showTenderCountdown && <ProposalPromotionCountdown startAt={tenderProposals?.data[0].start_at} />}
      {showBidCountdown && bidsInfo?.publishAt && <ProposalPromotionCountdown startAt={bidsInfo.publishAt} />}
    </div>
  )
}
