import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import './FullWidthButton.css'

interface Props {
  onClick?: () => void
  children: React.ReactNode
  className?: string
  href?: string
  newWindow?: boolean
  loading?: boolean
}

// TODO: FullWidthButton should render Link when href is provided
const FullWidthButton = ({ onClick, children, className, href, newWindow = false, loading }: Props) => {
  return (
    <Button
      primary
      fluid
      disabled={loading}
      className={classNames('FullWidthButton', className)}
      onClick={onClick}
      target={newWindow ? '_blank' : ''}
      rel={newWindow ? 'noopener noreferrer' : ''}
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
