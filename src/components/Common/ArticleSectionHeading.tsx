import React from 'react'

import './ArticleSectionHeading.css'

interface Props {
  children: React.ReactText
}

export default function ArticleSectionHeading({ children }: Props) {
  return <h2 className="ArticleSectionHeading">{children}</h2>
}
