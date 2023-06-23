import React from 'react'

import { PROPOSAL_DESCRIPTION_MARKDOWN_STYLES } from '../../../pages/proposal'
import Markdown from '../../Common/Markdown/Markdown'

interface Props {
  title: string
  body: string | string[]
}

function ProposalDescriptionItem({ title, body }: Props) {
  const formattedTitle = `## ${title}`
  const formattedBody = Array.isArray(body) ? body.map((it) => `- ${it}\n`).join('') : body

  return (
    <Markdown componentsClassNames={PROPOSAL_DESCRIPTION_MARKDOWN_STYLES}>
      {`${formattedTitle}
      
${formattedBody}`}
    </Markdown>
  )
}

export default ProposalDescriptionItem
