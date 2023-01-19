import React from 'react'

import './Label.css'

interface Props {
  children: React.ReactNode
}

const Label = ({ children }: Props) => {
  return <label className="GrantRequestLabel">{children}</label>
}

export default Label
