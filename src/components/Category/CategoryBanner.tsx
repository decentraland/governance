import React from 'react'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { PoiType, ProposalType } from '../../entities/Proposal/types'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './CategoryBanner.css'

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

export type CategoryBannerProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  active?: boolean
  isNew?: boolean
  type: ProposalType | PoiType
}

export default React.memo(function CategoryBanner({ active, isNew, type, ...props }: CategoryBannerProps) {
  const t = useFormatMessage()
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (props.onClick) {
      props.onClick(e)
    }

    if (!e.defaultPrevented) {
      e.preventDefault()

      if (props.href) {
        navigate(props.href)
      }
    }
  }

  return (
    <a
      {...props}
      onClick={handleClick}
      className={TokenList.join([`CategoryBanner`, `CategoryBanner--${type}`, active && `CategoryBanner--active`])}
    >
      <div className="CategoryBanner__Icon">
        <img src={categoryIcons[type]} width="48" height="48" />
      </div>
      <div>
        <div className="CategoryBanner__TitleContainer">
          <Paragraph small semiBold>
            {t(`category.${type}_title`)}
          </Paragraph>
          {isNew && <span className="NewBadge">{t(`category.new`)}</span>}
        </div>
        <Paragraph tiny>{t(`category.${type}_description`)}</Paragraph>
      </div>
    </a>
  )
})
