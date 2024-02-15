import classNames from 'classnames'

import './Counter.css'

interface Props {
  count?: number
  color?: 'primary' | 'gray'
  size?: 'small' | 'normal'
  hidden?: boolean
  className?: string
}

export default function Counter({ count, color = 'primary', size = 'normal', hidden = false, className }: Props) {
  return (
    <div
      className={classNames('Counter', `Counter--${color}`, `Counter--${size}`, hidden && `Counter--hidden`, className)}
    >
      {count}
    </div>
  )
}
