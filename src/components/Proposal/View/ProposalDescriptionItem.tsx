import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'

interface Props {
  title: string
  body: string | string[]
}

function ProposalDescriptionItem({ title, body }: Props) {
  const formattedTitle = `## ${title}`
  const formattedBody = Array.isArray(body) ? body.map((it) => `- ${it}\n`).join('') : body

  return (
    <Markdown>
      {`${formattedTitle}
      
${formattedBody}`}
    </Markdown>
  )
}

export default ProposalDescriptionItem
