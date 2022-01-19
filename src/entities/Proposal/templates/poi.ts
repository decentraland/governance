import Land from "decentraland-gatsby/dist/utils/api/Land";
import { NewProposalPOI, PoiType } from "../types";
import { formatMarkdown, template } from "./utils";

export const title = (proposal: NewProposalPOI) => {
  switch (proposal.type) {
    case PoiType.AddPOI:
      return `Add the location ${proposal.x},${proposal.y} to the Points of Interest`
    case PoiType.RemovePOI:
      return `Remove the location ${proposal.x},${proposal.y} from the Points of Interest`
    default:
      return ''
  }
}

export const description = (proposal: NewProposalPOI) => {
  switch (proposal.type) {

    case PoiType.AddPOI:
      return template`
      Should the scene located at ${proposal.x},${proposal.y} be added to the Point of Interest list?

## Description

${formatMarkdown(proposal.description)}

`
    case PoiType.RemovePOI:
      return template`
      Should the scene located at ${proposal.x},${proposal.y} be removed from the Point of Interest list?

## Description

${formatMarkdown(proposal.description)}

`
    default:
      return ''
  }
}

export const pre_description = async (proposal: NewProposalPOI) => {
  const tile = await Land.get().getTile([proposal.x, proposal.y])
  const name = tile?.name || `Parcel ${proposal.x},${proposal.y}`

  return [
    `## ${name}`,
    `![${name}](${Land.get().getParcelImage([proposal.x, proposal.y])})`,
  ].join('\n\n') + '\n\n'
}