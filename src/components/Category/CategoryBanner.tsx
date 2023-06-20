import React from 'react'

import classNames from 'classnames'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'

import { HiringType, PoiType, ProposalType, isHiringType } from '../../entities/Proposal/types'
import Text from '../Common/Text/Text'
import AddPoi from '../Icon/ProposalCategories/AddPoi'
import BanName from '../Icon/ProposalCategories/BanName'
import Catalyst from '../Icon/ProposalCategories/Catalyst'
import Draft from '../Icon/ProposalCategories/Draft'
import Governance from '../Icon/ProposalCategories/Governance'
import Grant from '../Icon/ProposalCategories/Grant'
import Hiring from '../Icon/ProposalCategories/Hiring'
import HiringAdd from '../Icon/ProposalCategories/HiringAdd'
import HiringRemove from '../Icon/ProposalCategories/HiringRemove'
import LinkedWearables from '../Icon/ProposalCategories/LinkedWearables'
import Pitch from '../Icon/ProposalCategories/Pitch'
import Poi from '../Icon/ProposalCategories/Poi'
import Poll from '../Icon/ProposalCategories/Poll'
import RemovePoi from '../Icon/ProposalCategories/RemovePoi'
import Tender from '../Icon/ProposalCategories/Tender'

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
  [ProposalType.Tender]: Tender,
  [ProposalType.Hiring]: Hiring,
  [HiringType.Add]: HiringAdd,
  [HiringType.Remove]: HiringRemove,
}

type Props = Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  active?: boolean
  isNew?: boolean
  type: ProposalType | PoiType | HiringType
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
      className={classNames('CategoryBanner', `CategoryBanner--${type}`, active && 'CategoryBanner--active')}
    >
      <div className={classNames('CategoryBanner__Icon', !active && 'CategoryBanner__Icon--inactive')}>
        <Icon />
      </div>
      <div>
        <div className="CategoryBanner__TitleContainer">
          <Text className="CategoryBanner__Title" size="lg" weight="semi-bold">
            {t(`category.${type}_title`)}
          </Text>
          {isNew && <span className="CategoryBanner__Badge NewBadge">{t(`category.new`)}</span>}
          {!active && (
            <span className="CategoryBanner__Badge CategoryBanner__PausedBadge">
              {t(`category.${isHiringType(type) ? 'not_available' : 'paused'}`)}
            </span>
          )}
        </div>
        <Text>{t(`category.${type}_description`)}</Text>
        {!active && <Markdown className="CategoryBanner__PausedText">{t(`category.${type}_paused`)}</Markdown>}
      </div>
    </Component>
  )
}
