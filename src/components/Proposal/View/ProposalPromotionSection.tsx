import React, { useCallback } from 'react'

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

const getPromotedProposalType = (type: ProposalType) => {
  switch (type) {
    case ProposalType.Poll:
      return ProposalType.Draft
    case ProposalType.Draft:
      return ProposalType.Governance
    case ProposalType.Pitch:
      return ProposalType.Tender
  }
}

export default function ProposalPromotionSection({ proposal, loading }: Props) {
  const t = useFormatMessage()
  const { id, type } = proposal

  const handlePromoteClick = () => {
    const promotedProposalType = getPromotedProposalType(type)
    if (promotedProposalType) {
      navigate(locations.submit(promotedProposalType, { linked_proposal_id: id }), { replace: true })
    }
  }

  const getDescription = useCallback(() => {
    switch (type) {
      case ProposalType.Poll:
        return t('page.proposal_detail.promotion.draft_text')
      case ProposalType.Draft:
        return t('page.proposal_detail.promotion.governance_text')
      case ProposalType.Pitch:
        return t('page.proposal_detail.promotion.tender_text')
      default:
        return ''
    }
  }, [type, t])

  const getButtonLabel = useCallback(() => {
    switch (type) {
      case ProposalType.Poll:
        return t('page.proposal_detail.promotion.promote_to_draft_label')
      case ProposalType.Draft:
        return t('page.proposal_detail.promotion.promote_to_governance_label')
      case ProposalType.Pitch:
        return t('page.proposal_detail.promotion.promote_to_tender_label')
      default:
        return ''
    }
  }, [type, t])

  return (
    <div className="ProposalPromotionSection">
      <Pill color="green" style="shiny">
        {t('page.proposal_detail.promotion.opportunity_label')}
      </Pill>
      <Markdown className="smallMarkdown">{getDescription()}</Markdown>
      <Button primary size="small" loading={loading} onClick={() => handlePromoteClick()}>
        {getButtonLabel()}
      </Button>
      {(type === ProposalType.Poll || type === ProposalType.Draft) && (
        <Markdown className="tinyMarkdown">{t('page.proposal_detail.promotion.info_text') || ''}</Markdown>
      )}
    </div>
  )
}
