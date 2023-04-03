import React from 'react'

import Link from 'decentraland-gatsby/dist/components/Text/Link'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { PoiType, ProposalType } from '../../entities/Proposal/types'
import AddPoi from '../Icon/ProposalCategories/AddPoi'
import BanName from '../Icon/ProposalCategories/BanName'
import Catalyst from '../Icon/ProposalCategories/Catalyst'
import Draft from '../Icon/ProposalCategories/Draft'
import Governance from '../Icon/ProposalCategories/Governance'
import Grant from '../Icon/ProposalCategories/Grant'
import LinkedWearables from '../Icon/ProposalCategories/LinkedWearables'
import Pitch from '../Icon/ProposalCategories/Pitch'
import Poi from '../Icon/ProposalCategories/Poi'
import Poll from '../Icon/ProposalCategories/Poll'
import RemovePoi from '../Icon/ProposalCategories/RemovePoi'

import './CategoryBanner.css'

const Box = (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />

export const categoryIcons = {
  [ProposalType.Catalyst]: Catalyst,
  [ProposalType.POI]: Poi,
  [PoiType.AddPOI]: AddPoi,
  [PoiType.RemovePOI]: RemovePoi,
  [ProposalType.BanName]: BanName,
  [ProposalType.Grant]: Grant,
  [ProposalType.Poll]: Poll,
  [ProposalType.Draft]: Draft,
  [ProposalType.Governance]: Governance,
  [ProposalType.LinkedWearables]: LinkedWearables,
  [ProposalType.Pitch]: Pitch,
}

type Props = Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  active?: boolean
  isNew?: boolean
  type: ProposalType | PoiType
  onClick?: () => void
}

export default function CategoryBanner({ active = true, isNew, type, onClick, href }: Props) {
  const t = useFormatMessage()

  function handleClick(e: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLDivElement>) {
    if (!e.defaultPrevented) {
      e.preventDefault()
    }

    if (!active) {
      return
    }

    if (onClick) {
      onClick()
    }

    if (href) {
      navigate(href)
    }
  }

  const Component = active && href ? Link : Box
  const Icon = categoryIcons[type]

  return (
    <Component
      href={href}
      onClick={handleClick}
      className={TokenList.join(['CategoryBanner', `CategoryBanner--${type}`, active && 'CategoryBanner--active'])}
    >
      <div className={TokenList.join(['CategoryBanner__Icon', !active && 'CategoryBanner__Icon--inactive'])}>
        <Icon />
      </div>
      <div>
        <div className="CategoryBanner__TitleContainer">
          <Paragraph small semiBold>
            {t(`category.${type}_title`)}
          </Paragraph>
          {isNew && <span className="CategoryBanner__Badge NewBadge">{t(`category.new`)}</span>}
          {!active && <span className="CategoryBanner__Badge CategoryBanner__PausedBadge">{t(`category.paused`)}</span>}
        </div>
        <Paragraph tiny>{t(`category.${type}_description`)}</Paragraph>
        {!active && <Markdown className="CategoryBanner__PausedText">{t(`category.${type}_paused`)}</Markdown>}
      </div>
    </Component>
  )
}
