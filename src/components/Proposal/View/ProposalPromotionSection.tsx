import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { ProposalAttributes, ProposalType } from '../../../entities/Proposal/types'
import locations from '../../../modules/locations'
import Pill from '../../Common/Pill'

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
        pillLabel: 'page.proposal_detail.promotion.coming_soon_label',
        description: 'page.proposal_detail.promotion.tender_text',
        buttonLabel: 'page.proposal_detail.promotion.promote_to_tender_label',
        promotedType: ProposalType.Tender,
      }
    case ProposalType.Tender:
      return {
        pillLabel: 'page.proposal_detail.promotion.coming_soon_label',
        description: 'page.proposal_detail.promotion.submit_bid_proposal_text',
        buttonLabel: 'page.proposal_detail.promotion.submit_bid_proposal_label',
        promotedType: null,
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

  const { pillLabel, description, buttonLabel, promotedType } = getSectionConfig(type)

  const handlePromoteClick = () => {
    if (promotedType) {
      navigate(locations.submit(promotedType, { linked_proposal_id: id }), { replace: true })
    }
  }

  return (
    <div className="ProposalPromotionSection">
      <Pill color="green" style="shiny">
        {t(pillLabel)}
      </Pill>
      <Markdown className="smallMarkdown">{t(description)}</Markdown>
      <Button
        primary
        size="small"
        loading={loading}
        onClick={() => handlePromoteClick()}
        disabled={type === ProposalType.Tender}
      >
        {t(buttonLabel)}
      </Button>
      {(type === ProposalType.Poll || type === ProposalType.Draft) && (
        <Markdown className="tinyMarkdown">{t('page.proposal_detail.promotion.info_text') || ''}</Markdown>
      )}
    </div>
  )
}
