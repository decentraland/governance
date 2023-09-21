import React from 'react'

import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { ProposalAttributes } from '../../entities/Proposal/types'
import CategoryPill from '../Category/CategoryPill'
import Text from '../Common/Typography/Text'
import StatusPill from '../Status/StatusPill'

import './ProposalHero.css'

interface Props {
  proposal: ProposalAttributes | null
}

export default function ProposalHero({ proposal }: Props) {
  return (
    <div className="ProposalHero__Container">
      <div className="ProposalHero__Banner ProposalHero__UpperLayer"></div>
      <div className="ProposalHero__Banner ProposalHero__BottomLayer" />
      <div className="ProposalHero__Text">
        <p className="ProposalHero__Title">{proposal?.title || ''}</p>
        <Loader active={!proposal} />
        <div className="ProposalDetailPage__Labels">
          {proposal && <StatusPill isLink status={proposal.status} />}
          {proposal && <CategoryPill isLink proposalType={proposal.type} />}
        </div>
      </div>
    </div>
  )
}
