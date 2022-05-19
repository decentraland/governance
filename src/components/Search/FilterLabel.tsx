import React from 'react'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './FilterLabel.css'

export type FilterLabelProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  active?: boolean
  label: string
}

export default React.memo(function FilterLabel({ active, label, className, ...props }: FilterLabelProps) {
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
      className={TokenList.join(['FilterLabel', active && 'FilterLabel--active', className])}
    >
      <span>
        <Paragraph tiny semiBold>
          {label}
        </Paragraph>
      </span>
    </a>
  )
})
