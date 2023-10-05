import React from 'react'

import classNames from 'classnames'

import { ProposalAttributes } from '../../entities/Proposal/types'
import CategoryPill from '../Category/CategoryPill'
import WiderContainer from '../Common/WiderContainer'
import StatusPill from '../Status/StatusPill'

import './FloatingHeader.css'

interface FloatingHeaderProps {
  isVisible: boolean
  proposal: ProposalAttributes
}

const FloatingHeader = ({ isVisible, proposal }: FloatingHeaderProps) => {
  return (
    <div className={classNames('FloatingHeader', !isVisible && 'FloatingHeader--hidden')}>
      <WiderContainer className="FloatingHeader__Content">
        <div className="FloatingHeader__Title">{proposal?.title}</div>
        <div className="FloatingHeader__Status">
          <StatusPill isLink status={proposal.status} />
          <CategoryPill isLink proposalType={proposal.type} />
        </div>
      </WiderContainer>
      <div className="FloatingHeader__Shadow"></div>
    </div>
  )
}

export default FloatingHeader
