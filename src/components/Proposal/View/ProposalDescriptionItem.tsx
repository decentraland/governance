import React from 'react'

import ProposalMarkdown from './ProposalMarkdown'

interface Props {
  title?: string
  body: string | string[]
}

function ProposalDescriptionItem({ title, body }: Props) {
  const formattedTitle = `## ${title}`
  const formattedBody = Array.isArray(body) ? body.map((it) => `- ${it}\n`).join('') : body

  const text = title ? `${formattedTitle}\n\n${formattedBody}` : formattedBody

  return <ProposalMarkdown text={text} />
}

export default ProposalDescriptionItem
