import React from 'react'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './ActionableLayout.css'

export type ActionableLayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  leftAction?: React.ReactNode,
  rightAction?: React.ReactNode,
}

export default function ActionableLayout({ className, rightAction, leftAction, children, ...props }: ActionableLayoutProps) {
  return <div {...props} className={TokenList.join([ 'ActionableLayout', className ])}>
    <div className="ActionableLayout__Action" style={{ minHeight: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="ActionableLayout__Left">
        {leftAction}
      </div>
      <div className="ActionableLayout__Right">
        {rightAction}
      </div>
    </div>
    <div className="ActionableLayout__Content">
      {children}
    </div>
  </div>
}