import classNames from 'classnames'

import './Pipe.css'

interface Props {
  className?: string
}

export default function Pipe({ className }: Props) {
  return <div className={classNames('Pipe', className)} />
}
