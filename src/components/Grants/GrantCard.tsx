import React, { useCallback } from 'react'

import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { GrantWithUpdateAttributes, ProposalGrantCategory, ProposalGrantTier } from '../../entities/Proposal/types'
import locations from '../../modules/locations'
import Pill, { PillColor } from '../Common/Pill'
import ProposalUpdate from '../Proposal/Update/ProposalUpdate'

import './GrantCard.css'
import VestingProgress from './VestingProgress'

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

export const PROPOSAL_GRANT_CATEGORY_COLORS: Record<ProposalGrantCategory, PillColor> = {
  [ProposalGrantCategory.Community]: PillColor.Green,
  [ProposalGrantCategory.ContentCreator]: PillColor.Orange,
  [ProposalGrantCategory.PlatformContributor]: PillColor.Purple,
  [ProposalGrantCategory.Gaming]: PillColor.Blue,
}

const GrantCard = ({ grant }: GrantCardProps) => {
  const category: ProposalGrantCategory = grant.configuration.category
  const token = grant.contract ? grant.contract.symbol : grant.enacting_token

  const handleClick = useCallback(() => {
    navigate(locations.proposal(grant.id))
  }, [grant])

  return (
    <div onClick={handleClick} className="GrantCard">
      <div>
        <div className="GrantCard__Header">
          <div className="GrantCard__TierSize">
            <p className="GrantCard__Tier">{`${grant.configuration.tier}: `}</p>
            <p className="GrantCard__Size">
              {grant.configuration.size} {token}
            </p>
          </div>
          <Pill color={PROPOSAL_GRANT_CATEGORY_COLORS[category]}>{category.split(' ')[0]}</Pill>
        </div>
        <Header className="GrantCard__Title">{grant.title}</Header>
        <VestingProgress grant={grant} />
      </div>
      <ProposalUpdate proposal={grant} update={grant.update} expanded={false} index={grant.update?.index} />
    </div>
  )
}

export default GrantCard
