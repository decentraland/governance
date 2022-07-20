import React, { useCallback } from 'react'

import useFormatMessage, { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { GrantWithUpdateAttributes, ProposalGrantCategory } from '../../entities/Proposal/types'
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
  const { id, configuration, size, title, update } = grant
  const category: ProposalGrantCategory = configuration.category
  const intl = useIntl()
  const t = useFormatMessage()

  const handleClick = useCallback(() => {
    navigate(locations.proposal(id))
  }, [id])

  return (
    <div onClick={handleClick} className="GrantCard">
      <div>
        <div className="GrantCard__Header">
          <div className="GrantCard__SizeContainer">
            <p className="GrantCard__Size">{`${t('page.grants.past_funded.size')}: `}</p>
            <p className="GrantCard__SizeNumber">{`$${intl.formatNumber(size)} USD`}</p>
          </div>
          <Pill color={PROPOSAL_GRANT_CATEGORY_COLORS[category]}>{category.split(' ')[0]}</Pill>
        </div>
        <Header className="GrantCard__Title">{title}</Header>
        <VestingProgress grant={grant} />
      </div>
      <ProposalUpdate proposal={grant} update={update} expanded={false} index={update?.index} />
    </div>
  )
}

export default GrantCard
