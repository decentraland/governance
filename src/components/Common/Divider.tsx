import classNames from 'classnames'

import './Divider.css'

interface Props {
  className?: string
  color?: string
  size?: 'small'
}

export default function Divider({ className, size, color = 'var(--black-300)' }: Props) {
  return (
    <hr className={classNames('Divider', size && `Divider--${size}`, className)} style={{ borderTopColor: color }} />
  )
}
