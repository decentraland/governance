import React from 'react'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './Filter.css'

export type FilterProps = React.HTMLAttributes<HTMLDivElement> & {
  active?: boolean
}

export default function Filter({ active, ...props }: FilterProps) {
  return <div {...props} className={TokenList.join([
    'Filter',
    active && 'Filter--active'
  ])}>
    <span>{props.children}</span>
  </div>
}