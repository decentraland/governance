import { NewProposalFeature } from "../types";
import { formatMarkdown, template } from "./utils";

export const title = (proposal: NewProposalFeature) => proposal.title.split('\n')[0]

export const description = (proposal: NewProposalFeature) => template`
Should the following feature request be added?

## Product

${proposal.product}

## Explanation

${formatMarkdown(proposal.explanation)}

`
