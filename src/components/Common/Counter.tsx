import classNames from 'classnames'

import './Counter.css'

interface Props {
  count?: number
  color?: 'primary' | 'gray'
  size?: 'small' | 'normal'
  className?: string
}

export default function Counter({ count, color = 'primary', size = 'normal', className }: Props) {
  return <div className={classNames('Counter', `Counter--${color}`, `Counter--${size}`, className)}>{count}</div>
}
