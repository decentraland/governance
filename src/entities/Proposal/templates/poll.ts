import { NewProposalPoll } from "../types";
import { formatMarkdown, template } from "./utils";

export const title = (proposal: NewProposalPoll) => proposal.title.split('\n')[0]

export const description = (proposal: NewProposalPoll) => template`
${formatMarkdown(proposal.description)}

${proposal.options.map(option => `- ${option.split('\n')[0]}`).join('\n')}
`
