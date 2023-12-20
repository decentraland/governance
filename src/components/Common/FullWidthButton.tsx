import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import Link from './Typography/Link'

import './FullWidthButton.css'

interface Props {
  onClick?: () => void
  children: React.ReactNode
  className?: string
  href?: string
  loading?: boolean
}

const FullWidthButton = ({ onClick, children, className, href, loading }: Props) => {
  return (
    <Button
      primary
      fluid
      as={href ? Link : undefined}
      disabled={loading}
      className={classNames('FullWidthButton', className)}
      onClick={onClick}
      href={href}
    >
      {loading ? (
        <div className="FullWidthButton__Loader">
          <Loader size="tiny" active />
        </div>
      ) : (
        children
      )}
    </Button>
  )
}

export default FullWidthButton
