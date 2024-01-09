import { useEffect, useState } from 'react'

import classNames from 'classnames'

import { ACTION_BOX_EXPANDED_STATE_KEY } from '../../front/localStorageKeys'
import useFormatMessage from '../../hooks/useFormatMessage'
import Helper from '../Helper/Helper'

import './ActionBox.css'
import ButtonWithArrow from './ButtonWithArrow'
import Divider from './Divider'

interface Props {
  id?: string
  title: React.ReactNode
  collapsedTitle?: React.ReactNode
  info?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  collapsible?: boolean
}

function getDefaultExpanded(collapsible: boolean | undefined, localStorageKey: string) {
  if (typeof window !== 'undefined') {
    const storedState = localStorage.getItem(localStorageKey)
    return collapsible && !!storedState ? storedState === 'true' : true
  }
  return true
}

export function ActionBox({ id, title, collapsedTitle, info, action, children, className, collapsible }: Props) {
  const localStorageKey = `${ACTION_BOX_EXPANDED_STATE_KEY}-${id}`
  const defaultExpanded = getDefaultExpanded(collapsible, localStorageKey)
  const displayedTitle = typeof title === 'string' ? <span>{title}</span> : title

  const t = useFormatMessage()
  const [expanded, setExpanded] = useState(defaultExpanded)

  useEffect(() => {
    if (collapsible && id) {
      localStorage.setItem(localStorageKey, expanded.toString())
    }
  }, [id, expanded, localStorageKey, collapsible])

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
