import classNames from 'classnames'

import './ActionableLayout.css'

export type ActionableLayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
}

export default function ActionableLayout({
  className,
  rightAction,
  leftAction,
  children,
  ...props
}: ActionableLayoutProps) {
  return (
    <div {...props} className={classNames('ActionableLayout', className)}>
      <div className="ActionableLayout__Action">
        <div className="ActionableLayout__Left">{leftAction}</div>
        <div className="ActionableLayout__Right">{rightAction}</div>
      </div>
      <div className="ActionableLayout__Content">{children}</div>
    </div>
  )
}
