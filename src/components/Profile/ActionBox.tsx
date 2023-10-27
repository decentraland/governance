import { useState } from 'react'

import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import Divider from '../Common/Divider'
import Helper from '../Helper/Helper'

import './ProfileBox.css'

interface Props {
  title: string
  info?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  collapsible?: boolean
}

export function ActionBox({ children, title, info, action, className, collapsible }: Props) {
  const [expanded, setExpanded] = useState(true)

  return (
    <>
      {(!collapsible || (collapsible && expanded)) && (
        <div className={classNames('ProfileBox__Container', className)}>
          <div className={classNames('ProfileBox__Header', 'ProfileBox__Padded')}>
            <div className="ProfileBox__HeaderTitle">
              <span>{title}</span>
              {info && <Helper text={info} size="12" position="right center" />}
            </div>
            <div className="ProfileBox__HeaderAction">
              {collapsible ? (
                <Button basic onClick={() => setExpanded(false)}>
                  {'Hide'}
                </Button>
              ) : (
                action
              )}
            </div>
          </div>
          <Divider className="ProfileBox__Divider" />
          <div className="ProfileBox__Padded">{children}</div>
        </div>
      )}
      {collapsible && !expanded && (
        <div className={classNames('ProfileBox__Container', className)}>
          <div className={classNames('ProfileBox__Header', 'ProfileBox__Padded')}>
            <div className="ProfileBox__HeaderTitle">
              <span>{title}</span>
              {info && <Helper text={info} size="12" position="right center" />}
            </div>
            <div className="ProfileBox__HeaderAction">
              <Button basic onClick={() => setExpanded(true)}>
                {'Show'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
