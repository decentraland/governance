import React from 'react'

import './Action.css'

export interface ActionProps {
  icon: JSX.Element
  title: string
  description: string
  url: string
}

function Action({ icon, title, description, url }: ActionProps) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="Action">
      <div className="Action__Icon">{icon}</div>
      <div>
        <div className="Action__Title">{title}</div>
        <div className="Action__Description">{description}</div>
      </div>
    </a>
  )
}

export default Action
