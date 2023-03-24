import React from 'react'

import Link from 'decentraland-gatsby/dist/components/Text/Link'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import Watermelon from '../Icon/Watermelon'

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
    <div className={TokenList.join(['Empty', className])}>
      {icon ? icon : <Watermelon />}
      {!!title && <Header>{title}</Header>}
      {!!description && <Markdown>{description}</Markdown>}
      {showAction && actionType === ActionType.LINK && (
        <Link className="Empty__Action" href={linkHref} onClick={onLinkClick}>
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
