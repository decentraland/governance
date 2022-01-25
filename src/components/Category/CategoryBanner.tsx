import React from 'react'
import { navigate } from 'gatsby-plugin-intl'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { PoiType, ProposalType } from '../../entities/Proposal/types'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './CategoryBanner.css'

export const categoryIcons = {
  [ProposalType.Catalyst]: require('../../images/icons/catalyst.svg'),
  [ProposalType.POI]: require('../../images/icons/poi.svg'),
  [PoiType.AddPOI]: require("../../images/icons/add-poi.svg"),
  [PoiType.RemovePOI]: require("../../images/icons/remove-poi.svg"),
  [ProposalType.BanName]: require('../../images/icons/ban-name.svg'),
  [ProposalType.Grant]: require('../../images/icons/grant.svg'),
  [ProposalType.Poll]: require('../../images/icons/poll.svg'),
  [ProposalType.Draft]: require('../../images/icons/draft.svg'),
  [ProposalType.Governance]: require('../../images/icons/governance.svg'),
}

export type CategoryBannerProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
  active?: boolean
  type: ProposalType | PoiType
}

export default React.memo(function CategoryBanner({ active, type, ...props }: CategoryBannerProps) {
  const l = useFormatMessage()
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

  return <a
    {...props}
    onClick={handleClick}
    className={TokenList.join([
      `CategoryBanner`,
      `CategoryBanner--${type}`,
      active && `CategoryBanner--active`
    ])}
  >
    <div className="CategoryBanner__Icon">
      <img src={categoryIcons[type]} width="48" height="48" />
    </div>
    <div className="CategoryBanner__Description">
      <Paragraph small semiBold>{l(`category.${type}_title`)}</Paragraph>
      <Paragraph tiny>{l(`category.${type}_description`)}</Paragraph>
    </div>
  </a>
})
