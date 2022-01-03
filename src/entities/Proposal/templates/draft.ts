import { NewProposalDraft } from "../types";
import { formatMarkdown, template } from "./utils";

export const title = (proposal: NewProposalDraft) => proposal.title.split('\n')[0]

export const description = (proposal: NewProposalDraft) => template`
${formatMarkdown(proposal.summary)}
`
