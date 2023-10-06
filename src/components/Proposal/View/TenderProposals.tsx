import { ProposalAttributes } from '../../../entities/Proposal/types'
import useFormatMessage from '../../../hooks/useFormatMessage'

import ProposalCard from './ProposalCard'
import './ProposalProcess.css'
import Section from './Section'

interface Props {
  proposals: ProposalAttributes[]
}

export default function TenderProposals({ proposals }: Props) {
  const t = useFormatMessage()

  return (
    <Section title={t('page.proposal_bidding_tendering.escalated_tender_proposals')} isNew>
      {proposals.map((proposal) => {
        return <ProposalCard key={proposal.id} proposal={proposal} />
      })}
    </Section>
  )
}
