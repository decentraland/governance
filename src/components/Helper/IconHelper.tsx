import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Popup, PopupProps } from 'decentraland-ui/dist/components/Popup/Popup'

type Props = Pick<PopupProps, 'position'> & {
  text: string
  containerClassName?: string
  icon: string
}

function IconHelper({ position, text, containerClassName, icon }: Props) {
  const hasContainerClassName = containerClassName && containerClassName.length > 0
  return (
    <Popup
      content={<Markdown className="HelperText__Content">{text}</Markdown>}
      position={position}
      trigger={<div className={'IconHelper__Container'}>{icon}</div>}
      on="hover"
      hoverable
      className={TokenList.join([
        hasContainerClassName && `${containerClassName}--Popup`,
        !hasContainerClassName && 'Helper__Container--Popup',
      ])}
    />
  )
}

export default IconHelper
