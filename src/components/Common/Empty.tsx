import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import Watermelon from '../Icon/Watermelon'

import Heading from './Typography/Heading'
import Link from './Typography/Link'
import Markdown from './Typography/Markdown'

import './Empty.css'

export enum ActionType {
  BUTTON,
  LINK,
}

interface Props {
  title?: string | null
  description?: string | null
  linkText?: string | null
  linkHref?: string
  className?: string
  onLinkClick?: () => void
  icon?: React.ReactNode
  actionType?: ActionType
  children?: React.ReactNode
}

export default function Empty({
  icon,
  title,
  description,
  className,
  linkText,
  linkHref,
  onLinkClick,
  actionType = ActionType.LINK,
  children,
}: Props) {
  const showAction = !!linkText && (onLinkClick || linkHref)
  return (
    <div className={classNames('Empty', className)}>
      {icon ? icon : <Watermelon />}
      {!!title && (
        <Heading size="sm" weight="semi-bold" className="Empty__Header">
          {title}
        </Heading>
      )}
      {!!description && <Markdown componentsClassNames={{ p: 'Empty__Description' }}>{description}</Markdown>}
      {showAction && actionType === ActionType.LINK && (
        <Link className={classNames('Empty__Action', 'Empty__Link')} href={linkHref} onClick={onLinkClick}>
          {linkText}
        </Link>
      )}
      {showAction && actionType === ActionType.BUTTON && (
        <Button primary className="Empty__Action" href={linkHref} onClick={onLinkClick}>
          {linkText}
        </Button>
      )}
      {children}
    </div>
  )
}
