import { NewProposalPoll } from "../types";
import { formatMarkdown, template } from "./utils";

export const title = (proposal: NewProposalPoll) => proposal.title.split('\n')[0]

export const description = (proposal: NewProposalPoll) => template`
${formatMarkdown(proposal.description)}
`

export const post_description = async (proposal: NewProposalPoll) => `

${proposal.choices.map(choice => `- ${choice.split('\n')[0]}`).join('\n')}
`