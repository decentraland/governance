import React from 'react'

import './SubLabel.css'

interface Props {
  children: React.ReactText
}

const SubLabel = ({ children }: Props) => {
  return <p className="SubLabel">{children}</p>
}

export default SubLabel
