import classNames from 'classnames'

import './Overlay.css'

interface Props {
  isOpen: boolean
  onClick: () => void
}

export default function Overlay({ isOpen, onClick }: Props) {
  return <div className={classNames('Overlay', isOpen && 'Overlay--open')} onClick={onClick} />
}
