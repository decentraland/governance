import React from 'react'

import classNames from 'classnames'

import { ProposalAttributes } from '../../entities/Proposal/types'
import CategoryPill from '../Category/CategoryPill'
import WiderContainer from '../Common/WiderContainer'
import StatusPill from '../Status/StatusPill'

import './FloatingHeader.css'

interface FloatingHeaderProps {
  isVisible: boolean
  proposal?: ProposalAttributes | null
  isLoadingProposal: boolean
}

const FloatingHeader: React.FC<FloatingHeaderProps> = ({ proposal, isVisible, isLoadingProposal }) => {
  if (!proposal) return null

  return (
    <div className={classNames('FloatingHeader', !isVisible && !isLoadingProposal && 'FloatingHeader--hidden')}>
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
