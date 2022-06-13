import React from 'react'

import { Popup, PopupProps } from 'decentraland-ui/dist/components/Popup/Popup'

import Info from '../Icon/Info'

type Props = Pick<PopupProps, 'position'> & {
  text: string
  size?: string
}

function Helper({ position, text, size }: Props) {
  return (
    <Popup
      content={<span>{text}</span>}
      position={position}
      trigger={
        <div className="Helper__Container">
          <Info className="Helper__Icon" size={size} />
        </div>
      }
      on="hover"
      hoverable
    />
  )
}

export default Helper
