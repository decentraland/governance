import { useState } from 'react'

import classNames from 'classnames'

import useFormatMessage from '../../hooks/useFormatMessage'
import Helper from '../Helper/Helper'

import './ActionBox.css'
import ButtonWithArrow from './ButtonWithArrow'
import Divider from './Divider'

interface Props {
  title: React.ReactNode
  collapsedTitle?: React.ReactNode
  info?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  collapsible?: boolean
}

export function ActionBox({ children, title, collapsedTitle, info, action, className, collapsible }: Props) {
  const t = useFormatMessage()
  const [expanded, setExpanded] = useState(true)
  const displayedTitle = typeof title === 'string' ? <span>{title}</span> : title
  return (
    <>
      <div className={classNames('ActionBox__Container', className)}>
        <div className={classNames('ActionBox__Header', 'ActionBox__Padded')}>
          <div className="ActionBox__HeaderTitle">
            {!expanded && collapsedTitle ? collapsedTitle : displayedTitle}
            {info && <Helper text={info} size="12" position="right center" />}
          </div>
          <div className="ActionBox__HeaderAction">
            {collapsible ? (
              <ButtonWithArrow
                label={t(`component.action_box.${expanded ? 'hide' : 'show'}`)}
                arrowDirection={expanded ? 'up' : 'down'}
                onClick={() => setExpanded(!expanded)}
              />
            ) : (
              action
            )}
          </div>
        </div>
        {(!collapsible || (collapsible && expanded)) && (
          <>
            <Divider className="ActionBox__Divider" />
            <div className="ActionBox__Padded">{children}</div>
          </>
        )}
      </div>
    </>
  )
}
