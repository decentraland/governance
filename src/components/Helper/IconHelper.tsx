import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import { Popup, PopupProps } from 'decentraland-ui/dist/components/Popup/Popup'

type Props = Pick<PopupProps, 'position'> & {
  text: string
  containerClassName?: string
  icon: JSX.Element
}

function IconHelper({ position, text, containerClassName, icon }: Props) {
  return (
    <Popup
      content={<Markdown className="HelperText__Content">{text}</Markdown>}
      position={position}
      trigger={<div className={'IconHelper__Container'}>{icon}</div>}
      on="hover"
      hoverable
      className={(containerClassName && `${containerClassName}--Popup`) || 'Helper__Container--Popup'}
    />
  )
}

export default IconHelper
