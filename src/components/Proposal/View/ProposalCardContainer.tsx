import React from 'react'

import classNames from 'classnames'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { proposalUrl } from '../../../entities/Proposal/utils'
import Link from '../../Common/Typography/Link'
import ChevronRight from '../../Icon/ChevronRight'

import './ProposalCardContainer.css'

interface Props {
  id: ProposalAttributes['id']
  title: ProposalAttributes['title']
  children: React.ReactNode
  className?: string
  isDisabled?: boolean
}

export default function ProposalCardContainer({ id, title, isDisabled, children, className }: Props) {
  return (
    <Link
      className={classNames('ProposalCardContainer', isDisabled && 'ProposalCardContainer--disabled', className)}
      href={proposalUrl(id)}
    >
      <div className="ProposalCardContainer__Container">
        <span className="ProposalCardContainer__Title">{title}</span>
        <div className="ProposalCardContainer__DetailsContainer">{children}</div>
      </div>
      <div>
        <ChevronRight color="var(--black-400)" />
      </div>
    </Link>
  )
}
