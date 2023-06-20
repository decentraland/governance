import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'

import Text from './Text/Text'

import './SubLabel.css'

interface Props {
  children: string
  isMarkdown?: boolean
}

const SubLabel = ({ children, isMarkdown }: Props) => {
  if (isMarkdown) {
    return <Markdown className="SubLabel">{children}</Markdown>
  }

  return (
    <Text weight="semi-bold" color="secondary" className="SubLabel">
      {children}
    </Text>
  )
}

export default SubLabel
