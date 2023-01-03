import React from 'react'

import Link from 'decentraland-gatsby/dist/components/Text/Link'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { PoiType, ProposalType } from '../../entities/Proposal/types'

import './CategoryBanner.css'

const Box = (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />

export const categoryIcons = {
  [ProposalType.Catalyst]: require('../../images/icons/catalyst.svg').default,
  [ProposalType.POI]: require('../../images/icons/poi.svg').default,
  [PoiType.AddPOI]: require('../../images/icons/add-poi.svg').default,
  [PoiType.RemovePOI]: require('../../images/icons/remove-poi.svg').default,
  [ProposalType.BanName]: require('../../images/icons/ban-name.svg').default,
  [ProposalType.Grant]: require('../../images/icons/grant.svg').default,
  [ProposalType.Poll]: require('../../images/icons/poll.svg').default,
  [ProposalType.Draft]: require('../../images/icons/draft.svg').default,
  [ProposalType.Governance]: require('../../images/icons/governance.svg').default,
  [ProposalType.LinkedWearables]: require('../../images/icons/linked-wearables.svg').default,
}

type Props = Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  active?: boolean
  isNew?: boolean
  type: ProposalType | PoiType
  onClick?: () => void
}

export default function CategoryBanner({ active = true, isNew, type, onClick, href }: Props) {
  console.log(active, isNew, type, onClick, href)

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

  const Component = active ? Link : Box

  return (
    <Component
      href={href}
      onClick={handleClick}
      className={TokenList.join([`CategoryBanner`, `CategoryBanner--${type}`, active && `CategoryBanner--active`])}
    >
      <div className={TokenList.join(['CategoryBanner__Icon', !active && 'CategoryBanner__Icon--inactive'])}>
        <img src={categoryIcons[type]} width="48" height="48" />
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
