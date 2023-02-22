import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalType } from '../../entities/Proposal/types'
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
}

export type Props = {
  className?: string
  proposalType: ProposalType
  size?: 'small' | 'default'
}

function getProposalTypeShortLabel(proposalType: ProposalType) {
  return proposalType === ProposalType.LinkedWearables ? 'LWearables' : getProposalTypeLabel(proposalType)
}

function getProposalTypeLabel(proposalType: ProposalType) {
  return proposalType.replaceAll('_', ' ')
}

const CategoryPill = ({ className, proposalType, size = 'default' }: Props) => {
  const colorsConfig = ColorsConfig[proposalType]
  const classNames = TokenList.join(['CategoryPill', className])
  return (
    <>
      <Mobile>
        <Pill style="light" color={colorsConfig} className={classNames} size={'small'}>
          {getProposalTypeShortLabel(proposalType)}
        </Pill>
      </Mobile>
      <NotMobile>
        <Pill style="light" color={colorsConfig} className={classNames} size={size}>
          {getProposalTypeLabel(proposalType)}
        </Pill>
      </NotMobile>
    </>
  )
}

export default CategoryPill
