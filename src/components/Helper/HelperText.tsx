import { Popup, PopupProps } from 'decentraland-ui/dist/components/Popup/Popup'

import Markdown from '../Common/Typography/Markdown'

import './HelperText.css'

type Props = Pick<PopupProps, 'position'> & {
  labelText: string
  tooltipText: string
  containerClassName?: string
}

export const HELPER_TEXT_MARKDOWN_STYLES = {
  p: 'HelperText__ContentText',
  strong: 'HelperText__ContentText',
  em: 'HelperText__ContentText',
  a: 'HelperText__Pointer',
}

function HelperText({ position, tooltipText, containerClassName, labelText }: Props) {
  return (
    <Popup
      content={
        <Markdown size="sm" componentsClassNames={HELPER_TEXT_MARKDOWN_STYLES}>
          {tooltipText}
        </Markdown>
      }
      position={position}
      trigger={<span className="HelperText__Label">{labelText}</span>}
      on="hover"
      hoverable
      className={(containerClassName && `${containerClassName}--Popup`) || 'Helper__Container--Popup'}
    />
  )
}

export default HelperText
