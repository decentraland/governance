import classNames from 'classnames'

import './Counter.css'

export default function Counter({ count, gray = false }: { count?: number; gray?: boolean }) {
  return <div className={classNames('Counter', gray ? 'Counter--gray' : 'Counter--primary')}>{count}</div>
}
