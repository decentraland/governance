import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { ProposalType } from '../../entities/Proposal/types'
import React from 'react'

import './CategoryOption.css'
import { navigate } from 'gatsby-plugin-intl'

export type CategoryOptionProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  active?: boolean
  type: ProposalType | 'all'
}

const icons = {
  all: require('../../images/icons/all.svg'),
  [ProposalType.Catalyst]: require('../../images/icons/catalyst.svg'),
  [ProposalType.POI]: require('../../images/icons/poi.svg'),
  [ProposalType.BanName]: require('../../images/icons/ban-name.svg'),
  [ProposalType.Grant]: require('../../images/icons/grant.svg'),
  [ProposalType.Poll]: require('../../images/icons/poll.svg'),
}

export default React.memo(function CategoryOption({ active, type, className, ...props }: CategoryOptionProps) {
  const l = useFormatMessage()
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (props.onClick) {
      props.onClick(e)
    }

    if(!e.defaultPrevented) {
      e.preventDefault()

      if (props.href) {
        navigate(props.href)
      }
    }
  }

  return <a {...props} onClick={handleClick} className={TokenList.join([
    'CategoryOption',
    `CategoryOption--${type}`,
    active && 'CategoryOption--active',
    className
  ])}>
    <span><img src={icons[type]} width="24" height="24" /></span>
    <span><Paragraph tiny semiBold>{l(`category.${type}_title`)}</Paragraph></span>
  </a>
})