import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Close } from 'decentraland-ui/dist/components/Close/Close'

import './WelcomeItem.css'

export type WelcomeItemProps = React.HTMLAttributes<HTMLDivElement> & {
  onClose?: () => void
}

export default function WelcomeItem(props: WelcomeItemProps) {
  function handleClose(e: React.MouseEvent<unknown>) {
    e.preventDefault()
    e.stopPropagation()
    if (props.onClose) {
      props.onClose()
    }
  }

  return (
    <div {...props} className={TokenList.join(['WelcomeItem', props.className])}>
      {props.onClose && <Close onClick={handleClose} />}
      <div className="WelcomeItem__Content">{props.children}</div>
    </div>
  )
}
