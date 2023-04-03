import React, { Fragment } from 'react'

import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalType } from '../../entities/Proposal/types'
import locations from '../../modules/locations'
import Pill, { PillColor } from '../Common/Pill'

const ColorsConfig: Record<ProposalType, PillColor> = {
  [ProposalType.POI]: PillColor.Green,
  [ProposalType.Catalyst]: PillColor.Blue,
  [ProposalType.BanName]: PillColor.Fuchsia,
  [ProposalType.Grant]: PillColor.Purple,
  [ProposalType.LinkedWearables]: PillColor.Yellow,
  [ProposalType.Poll]: PillColor.Orange,
  [ProposalType.Draft]: PillColor.Orange,
  [ProposalType.Governance]: PillColor.Orange,
  [ProposalType.Pitch]: PillColor.Red,
}

type Props = {
  className?: string
  proposalType: ProposalType
  size?: 'small' | 'default'
  isLink?: boolean
}

function getProposalTypeShortLabel(proposalType: ProposalType) {
  return proposalType === ProposalType.LinkedWearables ? 'LWearables' : getProposalTypeLabel(proposalType)
}

function getProposalTypeLabel(proposalType: ProposalType) {
  return proposalType.replaceAll('_', ' ')
}

const CategoryPill = ({ className, proposalType, size = 'default', isLink }: Props) => {
  const colorsConfig = ColorsConfig[proposalType]
  const classNames = TokenList.join(['CategoryPill', className])
  const Wrapper = isLink ? Link : 'div'
  const href = isLink ? locations.proposals({ type: proposalType }) : undefined

  return (
    <>
      <Mobile>
        <Wrapper href={href}>
          <Pill style="light" color={colorsConfig} className={classNames} size="small">
            {getProposalTypeShortLabel(proposalType)}
          </Pill>
        </Wrapper>
      </Mobile>
      <NotMobile>
        <Wrapper href={href}>
          <Pill style="light" color={colorsConfig} className={classNames} size={size}>
            {getProposalTypeLabel(proposalType)}
          </Pill>
        </Wrapper>
      </NotMobile>
    </>
  )
}

export default CategoryPill
