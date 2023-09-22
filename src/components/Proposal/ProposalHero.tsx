import React from 'react'

import classNames from 'classnames'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { ProposalAttributes } from '../../entities/Proposal/types'
import CategoryPill from '../Category/CategoryPill'
import { PillColor } from '../Common/Pill'
import StatusPill from '../Status/StatusPill'

import './ProposalHero.css'

interface Props {
  proposal: ProposalAttributes | null
}

export default function ProposalHero({ proposal }: Props) {
  return (
    <div className="ProposalHero__Container">
      <div className={classNames('ProposalHero__Banner', 'ProposalHero__UpperLayer')}></div>
      <div className={classNames('ProposalHero__Banner', 'ProposalHero__BottomLayer')} />
      <div className="ProposalHero__Text">
        <p className="ProposalHero__Title">{proposal?.title || ''}</p>
        <Loader active={!proposal} />
        <div className="ProposalDetailPage__Labels">
          {proposal && <StatusPill isLink status={proposal.status} color={PillColor.White} />}
          {proposal && <CategoryPill isLink proposalType={proposal.type} transparent />}
        </div>
      </div>
    </div>
  )
}
