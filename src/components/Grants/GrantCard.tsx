import React from 'react'

import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { NewProposalGrant, ProposalGrantTier } from '../../entities/Proposal/types'

import './GrantCard.css'
import GrantCategoryLabel from './GrantCategoryLabel'
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

export type GrantCardProps = React.HTMLAttributes<HTMLDivElement> &
  Pick<NewProposalGrant, 'title' | 'category' | 'tier' | 'size'> & {
    vesting: VestingAttributes
  }

const GrantCard = ({ title, category, size, tier, vesting }: GrantCardProps) => {
  return (
    <div className="GrantCard">
      <div className="GrantCard__Header">
        <div className="GrantCard__TierSize">
          <p className="GrantCard__Tier">{getDisplayableName(tier)}</p>
          <p className="GrantCard__Size">
            {size} {vesting.symbol}
          </p>
        </div>
        <GrantCategoryLabel category={category} />
      </div>
      <Header className="GrantCard__Title">{title}</Header>
      <VestingProgress vesting={vesting} />
    </div>
  )
}

export default GrantCard
