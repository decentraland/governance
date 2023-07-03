import React from 'react'

import './Label.css'

interface Props {
  children: React.ReactNode
}

const Label = ({ children }: Props) => {
  return <label className="FormLabel">{children}</label>
}

export default Label
