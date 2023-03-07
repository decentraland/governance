import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'

interface Props {
  title: string
  body: string | string[]
}

function ProposalDescriptionItem({ title, body }: Props) {
  const titleMd = `## ${title}`
  const bodyMd = Array.isArray(body) ? body.map((it) => `- ${it}\n`).join('') : body

  return (
    <Markdown>
      {`${titleMd}
      
${bodyMd}`}
    </Markdown>
  )
}

export default ProposalDescriptionItem
