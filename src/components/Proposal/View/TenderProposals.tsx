import React from 'react'

import { ProposalAttributes } from '../../../entities/Proposal/types'

import CompetingProposal from './Budget/CompetingProposal'

import './ProposalProcess.css'
import Section from './Section'

interface Props {
  proposals: ProposalAttributes[]
}

export default function TenderProposals({ proposals }: Props) {
  return (
    <Section title="Escalated Tender Proposals" isNew>
      {proposals.map((proposal) => {
        // TODO: Refactor CompetingProposal to ProposalCard inside Proposal/View folder
        return <CompetingProposal key={proposal.id} proposal={proposal} />
      })}
    </Section>
  )
}
