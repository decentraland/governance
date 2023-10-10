import classNames from 'classnames'

import './Filter.css'

export type FilterProps = React.HTMLAttributes<HTMLDivElement> & {
  active?: boolean
}

export default function Filter({ active, ...props }: FilterProps) {
  return (
    <div {...props} className={classNames('Filter', active && 'Filter--active')}>
      <span>{props.children}</span>
    </div>
  )
}
