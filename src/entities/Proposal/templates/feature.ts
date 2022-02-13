import { NewProposalFeature } from "../types";
import { formatMarkdown, template } from "./utils";

export const title = (proposal: NewProposalFeature) => proposal.title.split('\n')[0]

export const description = (proposal: NewProposalFeature) => template`
## Further Explanation

${formatMarkdown(proposal.explanation)}

`
