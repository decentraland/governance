import React from 'react'

import ProposalMarkdown from './ProposalMarkdown'

interface Props {
  title: string
  body: string | string[]
}

function ProposalDescriptionItem({ title, body }: Props) {
  const formattedTitle = `## ${title}`
  const formattedBody = Array.isArray(body) ? body.map((it) => `- ${it}\n`).join('') : body

  return (
    <ProposalMarkdown
      text={`${formattedTitle}
      
${formattedBody}`}
    />
  )
}

export default ProposalDescriptionItem
