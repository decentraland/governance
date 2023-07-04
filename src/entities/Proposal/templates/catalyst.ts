import { CatalystType, NewProposalCatalyst } from '../types'

import { formatMarkdown, template } from './utils'

export const title = (proposal: NewProposalCatalyst) => {
  switch (proposal.type) {
    case CatalystType.Add:
      return `Add catalyst node with domain ${proposal.domain} to the catalyst network`
    case CatalystType.Remove:
      return `Remove catalyst node with domain ${proposal.domain} to the catalyst network`
    default:
      return ''
  }
}

export const description = (proposal: NewProposalCatalyst) => {
  switch (proposal.type) {
    case CatalystType.Add:
      return template`
      Should the catalyst node with the domain ${proposal.domain} and owner ${
        proposal.owner
      } be added to Decentraland's Catalyst Network?

## Description

${formatMarkdown(proposal.description)}

`
    case CatalystType.Remove:
      return template`
      Should the catalyst node with the domain ${proposal.domain} and owner ${
        proposal.owner
      } be removed from Decentraland's Catalyst Network?

## Description

${formatMarkdown(proposal.description)}

`
    default:
      return ''
  }
}
