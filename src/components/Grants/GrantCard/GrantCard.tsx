import React, { useState } from 'react'

import classNames from 'classnames'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'

import { GrantWithUpdate } from '../../../entities/Proposal/types'
import { isProposalInCliffPeriod } from '../../../entities/Proposal/utils'
import locations from '../../../modules/locations'
import ProposalUpdate from '../../Proposal/Update/ProposalUpdate'

import CliffProgress from './CliffProgress'
import './GrantCard.css'
import GrantCardHeader from './GrantCardHeader'
import GrantCardHeadline from './GrantCardHeadline'
import VestingProgress from './VestingProgress'

interface Props {
  grant: GrantWithUpdate
  hoverable?: boolean
}

const GrantCard = ({ grant, hoverable = false }: Props) => {
  const { id, enacted_at } = grant
  const [expanded, setExpanded] = useState(!hoverable)
  const proposalInCliffPeriod = !!enacted_at && isProposalInCliffPeriod(enacted_at)

  return (
    <Link
      href={locations.proposal(id)}
      onMouseEnter={() => hoverable && setExpanded(true)}
      onMouseLeave={() => hoverable && setExpanded(false)}
      className={classNames('GrantCard', hoverable && 'GrantCard__Expanded')}
    >
      <div>
        <GrantCardHeader grant={grant} />
        <GrantCardHeadline grant={grant} expanded={expanded} hoverable={hoverable} />
        {proposalInCliffPeriod ? <CliffProgress enactedAt={enacted_at} /> : <VestingProgress grant={grant} />}
      </div>
      <div className="GrantCard__UpdateContainer">
        <ProposalUpdate
          proposal={grant}
          update={grant.update}
          expanded={false}
          index={grant.update?.index}
          isLinkable={false}
        />
      </div>
    </Link>
  )
}

export default GrantCard
