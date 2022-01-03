import { NewProposalGovernance } from '../types';
import { formatMarkdown, template } from "./utils";

export const title = (proposal: NewProposalGovernance) => proposal.title.split('\n')[0]

export const description = (proposal: NewProposalGovernance) => template`
${formatMarkdown(proposal.summary)}
`
