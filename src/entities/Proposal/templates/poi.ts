import { NewProposalPOI } from "../types";
import { formatMarkdown, template } from "./utils";

export const title = (proposal: NewProposalPOI) => `Add the location ${proposal.x},${proposal.y} to the Points of Interest`

export const description = (proposal: NewProposalPOI) => template`
Should the scene located at ${proposal.x},${proposal.y} be added to the Point of Interest list?

## Description

${formatMarkdown(proposal.description)}
`
