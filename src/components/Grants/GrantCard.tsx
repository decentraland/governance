import React from 'react'

import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { GrantWithUpdateAttributes, ProposalGrantCategoryColor, ProposalGrantTier } from '../../entities/Proposal/types'
import EmptyProposalUpdate from '../Proposal/EmptyProposalUpdate'
import ProposalUpdate from '../Proposal/ProposalUpdate'
import Pill from '../Common/Pill'

import './GrantCard.css'
import VestingProgress from './VestingProgress'

const getDisplayableName = (grantSize: ProposalGrantTier) => {
  return grantSize.substring(0, 6) + ':  '
}

export type VestingAttributes = {
  symbol: string
  vestedAmount: number
  balance: number
  released: number
  start: number
}

export type GrantCardProps = React.HTMLAttributes<HTMLDivElement> & {
  grant: GrantWithUpdateAttributes
}

const GrantCard = ({ grant }: GrantCardProps) => {
  return (
    <div className="GrantCard">
      <div className="GrantCard__Header">
        <div className="GrantCard__TierSize">
          <p className="GrantCard__Tier">{getDisplayableName(grant.configuration.tier)}</p>
          <p className="GrantCard__Size">
            {grant.configuration.size} {grant.contract.symbol}
          </p>
        </div>
        <Pill color={ProposalGrantCategoryColor[grant.configuration.category]}>{grant.configuration.category.split(' ')[0]}</Pill>
      </div>
      <Header className="GrantCard__Title">{grant.title}</Header>
      <VestingProgress vesting={grant.contract} />
      {grant.update && (
        <ProposalUpdate proposal={grant} update={grant.update} expanded={false} index={grant.update.index} />
      )}
      {!grant.update && <EmptyProposalUpdate />}
    </div>
  )
}

export default GrantCard
