import classNames from 'classnames'
import { Popup, PopupProps } from 'decentraland-ui/dist/components/Popup/Popup'

import Markdown from '../Common/Typography/Markdown'

type Props = Pick<PopupProps, 'position'> & {
  text: string
  containerClassName?: string
  icon: string
}

function IconHelper({ position, text, containerClassName, icon }: Props) {
  const hasContainerClassName = containerClassName && containerClassName.length > 0
  return (
    <Popup
      content={
        <Markdown className="HelperText__Content" componentsClassNames={{ p: 'HelperText__ContentText' }}>
          {text}
        </Markdown>
      }
      position={position}
      trigger={<div className={'IconHelper__Container'}>{icon}</div>}
      on="hover"
      hoverable
      className={classNames(
        hasContainerClassName && `${containerClassName}--Popup`,
        !hasContainerClassName && 'Helper__Container--Popup'
      )}
    />
  )
}

export default IconHelper
