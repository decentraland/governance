import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'

import './SubLabel.css'

interface Props {
  children: string
  isMarkdown?: boolean
}

const SubLabel = ({ children, isMarkdown }: Props) => {
  if (isMarkdown) {
    return <Markdown className="SubLabel">{children}</Markdown>
  }

  return <p className="SubLabel">{children}</p>
}

export default SubLabel
