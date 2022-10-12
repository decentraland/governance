import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import { Popup, PopupProps } from 'decentraland-ui/dist/components/Popup/Popup'

import Info from '../Icon/Info'

type Props = Pick<PopupProps, 'position'> & {
  text: string
  size?: string
  containerClassName?: string
  iconClassName?: string
}

function Helper({ position, text, size, containerClassName, iconClassName }: Props) {
  return (
    <Popup
      content={<Markdown className="HelperText__Content">{text}</Markdown>}
      position={position}
      trigger={
        <div className={containerClassName || 'Helper__Container'}>
          <Info className={iconClassName || 'Helper__Icon'} size={size} />
        </div>
      }
      on="hover"
      hoverable
      className={(containerClassName && `${containerClassName}--Popup`) || 'Helper__Container--Popup'}
    />
  )
}

export default Helper
