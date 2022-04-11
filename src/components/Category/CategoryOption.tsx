import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { ProposalType } from '../../entities/Proposal/types'
import { categoryIcons } from './CategoryBanner'
import React from 'react'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import './CategoryOption.css'

export type CategoryOptionProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  active?: boolean
  type: ProposalType | 'all'
}

const icons = {
  all: require('../../images/icons/all.svg').default,
  ...categoryIcons,
}

export default React.memo(function CategoryOption({ active, type, className, ...props }: CategoryOptionProps) {
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
      className={TokenList.join([
        'CategoryOption',
        `CategoryOption--${type}`,
        active && 'CategoryOption--active',
        className,
      ])}
    >
      <span>
        <img src={icons[type]} width="24" height="24" />
      </span>
      <span>
        <Paragraph tiny semiBold>
          {t(`category.${type}_title`)}
        </Paragraph>
      </span>
    </a>
  )
})
