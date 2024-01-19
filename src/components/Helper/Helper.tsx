import { Popup, PopupProps } from 'decentraland-ui/dist/components/Popup/Popup'

import Markdown from '../Common/Typography/Markdown'
import Info from '../Icon/Info'

import './Helper.css'
import { HELPER_TEXT_MARKDOWN_STYLES } from './HelperText'

type Props = Pick<PopupProps, 'position'> & {
  text: string
  size?: string
  containerClassName?: string
  iconClassName?: string
  icon?: React.ReactNode
  open?: boolean
}

function Helper({ position, text, size, containerClassName, iconClassName, icon, open }: Props) {
  return (
    <Popup
      content={
        <Markdown size="sm" componentsClassNames={HELPER_TEXT_MARKDOWN_STYLES}>
          {text}
        </Markdown>
      }
      position={position}
      trigger={
        <div className={containerClassName || 'Helper__Container'}>
          {icon ? icon : <Info className={iconClassName || 'Helper__Icon'} size={size} />}
        </div>
      }
      on="hover"
      hoverable
      open={open}
      className={(containerClassName && `${containerClassName}--Popup`) || 'Helper__Container--Popup'}
    />
  )
}

export default Helper
