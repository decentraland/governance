import React from 'react'

import './HomeSectionHeader.css'

interface Props {
  title: string
  description: string
}

const HomeSectionHeader = ({ title, description }: Props) => {
  return (
    <>
      <h2 className="HomeSectionHeader__Title">{title}</h2>
      <div className="HomeSectionHeader__Description">{description}</div>
    </>
  )
}

export default HomeSectionHeader
