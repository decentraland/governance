import React, { useMemo } from 'react'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { ProposalAttributes, ProposalStatus, ProposalType } from '../../entities/Proposal/types'
import TextLabel from '../Layout/TextLabel'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'gatsby-plugin-intl'
import locations from '../../modules/locations'
import './ProposalPromotionSection.css'

export type ProposalPromotionSectionProps = React.HTMLAttributes<HTMLDivElement> & {
  proposal?: ProposalAttributes | null,
  loading?: boolean,
}

const PROMOTABLE_PROPOSALS = [ProposalType.Poll, ProposalType.Draft]

export function ProposalPromotionSection({ proposal, loading }: ProposalPromotionSectionProps) {
  const l = useFormatMessage()
  const showPromotionSection = useMemo(() =>
      proposal && proposal.status === ProposalStatus.Passed &&
      PROMOTABLE_PROPOSALS.includes(proposal.type),
    [proposal])

  function promoteProposal(proposalType?: ProposalType) {
    const promotedProposalType = proposalType == ProposalType.Poll ? ProposalType.Draft : ProposalType.Governance
    navigate(locations.submit(promotedProposalType, { linked_proposal_id: proposal!.id }), { replace: true })
  }

  return <>
    {showPromotionSection &&
    <div className="ProposalPromotionSection">
      <TextLabel text={l('page.proposal_detail.promotion.opportunity_label')} />
      <Markdown className="smallMarkdown" source={
        (proposal?.type == ProposalType.Poll ?
            l('page.proposal_detail.promotion.draft_text') :
            l('page.proposal_detail.promotion.governance_text')
        ) || ''
      } />
      <Button primary size="small"
              loading={loading}
              onClick={() => promoteProposal(proposal?.type)}
      >
        {proposal?.type == ProposalType.Poll ?
          l('page.proposal_detail.promotion.promote_to_draft_label') :
          l('page.proposal_detail.promotion.promote_to_governance_label')
        }
      </Button>
      <Markdown className="tinyMarkdown" source={l('page.proposal_detail.promotion.info_text') || ''} />
    </div>
    }
  </>
}
