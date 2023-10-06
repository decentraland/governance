import classNames from 'classnames'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import './HomeLoader.css'

interface Props {
  className?: string
  children: React.ReactText
  size?: 'large' | 'small'
}

const HomeLoader = ({ children, className, size = 'large' }: Props) => {
  return (
    <div className={classNames('HomeLoader__Container', className)}>
      <Loader className="HomeLoader__Loader" active size={size} />
      <span className={classNames('HomeLoader__Text', `HomeLoader__Text--${size}`)}>{children}</span>
    </div>
  )
}

export default HomeLoader
