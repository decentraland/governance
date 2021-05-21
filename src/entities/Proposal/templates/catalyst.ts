import { NewProposalCatalyst } from "../types";
import { formatMarkdown, template } from "./utils";

export const title = (proposal: NewProposalCatalyst) =>
  `Add catalyst node with domain ${proposal.domain} to the catalyst network`

export const description = (proposal: NewProposalCatalyst) => template`
Should the catalyst node with the domain ${proposal.domain} and owner ${proposal.owner} be added to Decentraland's Catalyst Network?

## Description

${formatMarkdown(proposal.description)}

`
