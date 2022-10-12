import React, { useState } from 'react'

import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { GrantWithUpdateAttributes } from '../../../entities/Proposal/types'
import { isProposalInCliffPeriod } from '../../../entities/Proposal/utils'
import locations from '../../../modules/locations'
import ProposalUpdate from '../../Proposal/Update/ProposalUpdate'

import CliffProgress from './CliffProgress'
import './GrantCard.css'
import GrantCardHeader from './GrantCardHeader'
import GrantCardHeadline from './GrantCardHeadline'
import VestingProgress from './VestingProgress'

export type GrantCardProps = React.HTMLAttributes<HTMLDivElement> & {
  grant: GrantWithUpdateAttributes
  hoverable?: boolean
}

const GrantCard = ({ grant, hoverable = false }: GrantCardProps) => {
  const { id } = grant
  const [expanded, setExpanded] = useState(!hoverable)
  const proposalInCliffPeriod = isProposalInCliffPeriod(grant)

  return (
    <Link
      href={locations.proposal(id)}
      onMouseEnter={() => hoverable && setExpanded(true)}
      onMouseLeave={() => hoverable && setExpanded(false)}
      className={TokenList.join([
        'GrantCard',
        hoverable && !expanded && 'GrantCard__Collapsed',
        hoverable && expanded && 'GrantCard__Expanded',
      ])}
    >
      <div>
        <GrantCardHeader grant={grant} />
        <GrantCardHeadline grant={grant} expanded={expanded} hoverable={hoverable} />
        {proposalInCliffPeriod ? <CliffProgress enactedAt={grant.enacted_at} /> : <VestingProgress grant={grant} />}
      </div>
      <div className="GrantCard__UpdateContainer">
        <ProposalUpdate proposal={grant} update={grant.update} expanded={false} index={grant.update?.index} />
      </div>
    </Link>
  )
}

export default GrantCard
