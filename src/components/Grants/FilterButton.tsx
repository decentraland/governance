import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './FilterButton.css'

type Props = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactText
  selected?: boolean
  count: number
}

const FilterButton = ({ onClick, children, selected = false, count }: Props) => {
  return (
    <div className={TokenList.join(['FilterButton', selected && 'FilterButton--selected'])} onClick={onClick}>
      <span>{children}</span>
      <span className={TokenList.join(['FilterButton__Count', selected && 'FilterButton__Count--selected'])}>
        {count}
      </span>
    </div>
  )
}

export default FilterButton
