import classNames from 'classnames'

import './FilterButton.css'

type Props = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactText
  selected?: boolean
  count: number
  className: string
}

const FilterButton = ({ onClick, children, selected = false, count, className }: Props) => {
  return (
    <div className={classNames('FilterButton', selected && 'FilterButton--selected', className)} onClick={onClick}>
      <span>{children}</span>
      <span className={classNames('FilterButton__Count', selected && 'FilterButton__Count--selected')}>{count}</span>
    </div>
  )
}

export default FilterButton
