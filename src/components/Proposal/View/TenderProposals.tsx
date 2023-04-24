import React from 'react'

import { ProposalAttributes } from '../../../entities/Proposal/types'

import ProposalCard from './ProposalCard'
import './ProposalProcess.css'
import Section from './Section'

interface Props {
  proposals: ProposalAttributes[]
}

export default function TenderProposals({ proposals }: Props) {
  return (
    <Section title="Escalated Tender Proposals" isNew>
      {proposals.map((proposal) => {
        return <ProposalCard key={proposal.id} proposal={proposal} />
      })}
    </Section>
  )
}
