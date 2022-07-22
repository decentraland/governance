import React, { useCallback, useState } from 'react'

import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import {
  GrantWithUpdateAttributes,
  ONE_TIME_PAYMENT_TIERS,
  ProposalGrantCategory,
  ProposalGrantTier,
} from '../../entities/Proposal/types'
import { CLIFF_PERIOD_IN_DAYS } from '../../entities/Proposal/utils'
import locations from '../../modules/locations'
import { PillColor } from '../Common/Pill'

import './GrantCard.css'
import GrantCardHeader from './GrantCardHeader'
import GrantCardHeadline from './GrantCardHeadline'
import GrantCardProgressInfo from './GrantCardProgressInfo'
import GrantCardUpdateInfo from './GrantCardUpdateInfo'

export type GrantCardProps = React.HTMLAttributes<HTMLDivElement> & {
  grant: GrantWithUpdateAttributes
  hoverable?: boolean
}

export const PROPOSAL_GRANT_CATEGORY_COLORS: Record<ProposalGrantCategory, PillColor> = {
  [ProposalGrantCategory.Community]: PillColor.Green,
  [ProposalGrantCategory.ContentCreator]: PillColor.Orange,
  [ProposalGrantCategory.PlatformContributor]: PillColor.Purple,
  [ProposalGrantCategory.Gaming]: PillColor.Blue,
}

function isProposalInCliffPeriod(grant: GrantWithUpdateAttributes) {
  const isOneTimePayment = ONE_TIME_PAYMENT_TIERS.has(grant.configuration.tier as ProposalGrantTier)
  const now = Time.utc()
  return !isOneTimePayment && Time.unix(grant.enacted_at).add(CLIFF_PERIOD_IN_DAYS, 'day').isAfter(now)
}

const GrantCard = ({ grant, hoverable = false }: GrantCardProps) => {
  const { id } = grant
  const [expanded, setExpanded] = useState(!hoverable)
  const proposalInCliffPeriod = isProposalInCliffPeriod(grant)

  const handleClick = useCallback(() => {
    navigate(locations.proposal(id))
  }, [id])

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => hoverable && setExpanded(true)}
      onMouseLeave={() => hoverable && setExpanded(false)}
      className={TokenList.join([
        'GrantCard',
        hoverable && 'GrantCard__Slim',
        hoverable && expanded && 'GrantCard__Expanded',
      ])}
    >
      <div>
        <GrantCardHeader grant={grant} displayUser={hoverable} />
        <GrantCardHeadline grant={grant} displayUser={hoverable} expanded={expanded} />
        <GrantCardProgressInfo grant={grant} proposalInCliffPeriod={proposalInCliffPeriod} />
      </div>
      {expanded && <GrantCardUpdateInfo grant={grant} proposalInCliffPeriod={proposalInCliffPeriod} />}
    </div>
  )
}

export default GrantCard
