import Land from "decentraland-gatsby/dist/utils/api/Land";
import { NewProposalPOI } from "../types";
import { formatMarkdown, template } from "./utils";

export const title = (proposal: NewProposalPOI) =>
  `Remove the location ${proposal.x},${proposal.y} from the Points of Interest`

export const description = (proposal: NewProposalPOI) => template`
Should the scene located at ${proposal.x},${proposal.y} be removed from the Point of Interest list?

## Description

${formatMarkdown(proposal.description)}

`
export const pre_description = async (proposal: NewProposalPOI) => {
  const tile = await Land.get().getTile([proposal.x, proposal.y])
  const name = tile?.name || `Parcel ${proposal.x},${proposal.y}`

  return [
    `## ${name}`,
    `![${name}](${Land.get().getParcelImage([proposal.x, proposal.y])})`,
  ].join('\n\n') + '\n\n'
}