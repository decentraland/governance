import React from 'react'

import { Popup, PopupProps } from 'decentraland-ui/dist/components/Popup/Popup'

import './HelperText.css'

type Props = Pick<PopupProps, 'position'> & {
  text: string
  size?: string
  containerClassName?: string
  labelText: string
}

function HelperText({ position, text, size, containerClassName, labelText }: Props) {
  return (
    <Popup
      content={<span>{text}</span>}
      position={position}
      trigger={<span className="HelperText__Label">{labelText}</span>}
      on="hover"
      hoverable
      className={(containerClassName && `${containerClassName}--Popup`) || 'Helper__Container--Popup'}
    />
  )
}

export default HelperText
