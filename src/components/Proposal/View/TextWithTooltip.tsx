import classNames from 'classnames'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import './TextWithTooltip.css'

const MAX_DISPLAYABLE_CHARACTERS = 50

export default function TextWithTooltip({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const displayTooltip =
    (typeof children === 'string' || children instanceof String) && children.length > MAX_DISPLAYABLE_CHARACTERS
  return (
    <>
      {displayTooltip && (
        <Popup
          className={'TextWithTooltip'}
          content={children}
          position="bottom left"
          trigger={<span className={classNames(className, 'TextWithTooltip__Trigger')}>{children}</span>}
          on="hover"
        />
      )}
      {!displayTooltip && <span className={className}>{children}</span>}
    </>
  )
}
