import { NewProposalBanName } from "../types";
import { formatMarkdown, template } from "./utils";

export const title = (proposal: NewProposalBanName) => `Ban the name ${proposal.name}`

export const description = (proposal: NewProposalBanName) => template`
Should the name ${proposal.name} be added to the Denied Names list, banning it from Decentraland?

## Description

${formatMarkdown(proposal.description)}

`
