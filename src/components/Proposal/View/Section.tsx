import React from 'react'

import Divider from '../../Common/Divider'
import NewBadge from '../NewBadge/NewBadge'

import './Section.css'

interface Props {
  title: string
  children: React.ReactNode
  isNew?: boolean
  action?: React.ReactNode
}

export default function Section({ title, children, isNew, action }: Props) {
  return (
    <div>
      <Divider />
      <div className="Section__Container">
        <div className="Section__Header">
          <div className="Section__TitleContainer">
            <h3 className="Section__Title">{title}</h3>
            {isNew && (
              <span>
                <NewBadge />
              </span>
            )}
          </div>
          <div className="Section__Action">{action}</div>
        </div>
        {children}
      </div>
    </div>
  )
}
