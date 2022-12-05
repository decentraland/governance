import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { ProposalAttributes, ProposalType } from '../../entities/Proposal/types'
import locations from '../../modules/locations'
import Pill from '../Common/Pill'

import './ProposalPromotionSection.css'

export type ProposalPromotionSectionProps = React.HTMLAttributes<HTMLDivElement> & {
  proposal?: ProposalAttributes | null
  loading?: boolean
}

export function ProposalPromotionSection({ proposal, loading }: ProposalPromotionSectionProps) {
  const t = useFormatMessage()

  function promoteProposal(proposalType?: ProposalType) {
    const promotedProposalType = proposalType == ProposalType.Poll ? ProposalType.Draft : ProposalType.Governance
    navigate(locations.submit(promotedProposalType, { linked_proposal_id: proposal!.id }), { replace: true })
  }

  return (
    <div className="DetailsSection__Content">
      <div className="ProposalPromotionSection">
        <Pill color="green" style="shiny">
          {t('page.proposal_detail.promotion.opportunity_label')}
        </Pill>
        <Markdown className="smallMarkdown">
          {(proposal?.type == ProposalType.Poll
            ? t('page.proposal_detail.promotion.draft_text')
            : t('page.proposal_detail.promotion.governance_text')) || ''}
        </Markdown>
        <Button primary size="small" loading={loading} onClick={() => promoteProposal(proposal?.type)}>
          {proposal?.type == ProposalType.Poll
            ? t('page.proposal_detail.promotion.promote_to_draft_label')
            : t('page.proposal_detail.promotion.promote_to_governance_label')}
        </Button>
        <Markdown className="tinyMarkdown">{t('page.proposal_detail.promotion.info_text') || ''}</Markdown>
      </div>
    </div>
  )
}
