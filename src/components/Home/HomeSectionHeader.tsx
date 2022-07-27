import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'

import './HomeSectionHeader.css'

interface Props {
  title: string
  description: string
}

const HomeSectionHeader = ({ title, description }: Props) => {
  return (
    <>
      <h2 className="HomeSectionHeader__Title">{title}</h2>
      <div className="HomeSectionHeader__Description">
        <Markdown>{description}</Markdown>
      </div>
    </>
  )
}

export default HomeSectionHeader
