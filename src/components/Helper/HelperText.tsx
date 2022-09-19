import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import { Popup, PopupProps } from 'decentraland-ui/dist/components/Popup/Popup'

import './HelperText.css'

type Props = Pick<PopupProps, 'position'> & {
  labelText: string
  tooltipText: string
  containerClassName?: string
}

function HelperText({ position, tooltipText, containerClassName, labelText }: Props) {
  return (
    <Popup
      content={<Markdown className="HelperText__Content">{tooltipText}</Markdown>}
      position={position}
      trigger={<span className="HelperText__Label">{labelText}</span>}
      on="hover"
      hoverable
      className={(containerClassName && `${containerClassName}--Popup`) || 'Helper__Container--Popup'}
    />
  )
}

export default HelperText
