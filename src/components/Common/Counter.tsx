import classNames from 'classnames'

import './Counter.css'

interface Props {
  count?: number
  color?: 'primary' | 'gray'
}

export default function Counter({ count, color = 'primary' }: Props) {
  return <div className={classNames('Counter', `Counter--${color}`)}>{count}</div>
}
