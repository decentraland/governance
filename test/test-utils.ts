import { ProposalAttributes, ProposalRequiredVP, ProposalStatus, ProposalType } from "../src/entities/Proposal/types"
import Time from "decentraland-gatsby/dist/utils/date/Time"
import { DEFAULT_CHOICES } from "../src/entities/Proposal/utils"

const start = Time.utc().set("seconds", 0)
const SNAPSHOT_DURATION = 600
export const TESTING_COMMITTEE_USER = "0xCommiteeUserAddress"

export function initProposalAttributes(proposalStatus: ProposalStatus,
                                                                  enactedStatus: boolean,
                                                                  enactedDescription: string | null,
                                                                  passedDescription: string | null,
                                                                  rejectedDescription: string | null,
                                                                  configuration: {}, type: ProposalType, updatingUser: string | null,
): ProposalAttributes {
  return {
    id: "1",
    type: type,
    user: "0xProposalCreatorUserAddress",
    required_to_pass: ProposalRequiredVP[type],
    configuration: JSON.stringify(configuration),
    title: "Test Proposal",
    description: "Test proposal description",
    status: proposalStatus,
    snapshot_id: "snapshot test id",
    snapshot_space: "snapshot test space",
    snapshot_proposal: null,
    snapshot_signature: "snapshot signature",
    snapshot_network: "snapshot network",
    discourse_id: 333,
    discourse_topic_id: 444,
    discourse_topic_slug: "discourse test topic slug",
    start_at: start.toJSON() as any,
    finish_at: Time.utc(start).add(SNAPSHOT_DURATION, "seconds").toJSON() as any,
    deleted: false,
    deleted_by: null,
    enacted: enactedStatus,
    enacted_by: updatingUser,
    enacted_description: enactedDescription,
    passed_by: updatingUser,
    passed_description: passedDescription,
    rejected_by: updatingUser,
    rejected_description: rejectedDescription,
    created_at: start.toJSON() as any,
    updated_at: start.toJSON() as any,
  }
}

export const PASSED_VOTES = {
  "0xe58d9940a395d303e691dbe0676710d9c140101a": {
    "choice": 1,
    "vp": 4182,
    "timestamp": 0,
  },
  "0xe2cfeab2beba9a7f09fd981f13e84df1e9978a5e": {
    "choice": 1,
    "vp": 1000,
    "timestamp": 0,
  },
  "0xd2d950cea649feef4d6111c18adbd9a37b3a9f63": {
    "choice": 2,
    "vp": 4269,
    "timestamp": 0,
  },
  "0x1f149885bb140f07ff88de2ac4d521bc27964c1b": {
    "choice": 1,
    "vp": 110000,
    "timestamp": 0,
  },
  "0x1f149885bb140f07ff88de2ac4d521bc27964c12": {
    "choice": 3,
    "vp": 100,
    "timestamp": 0,
  },
}

export const REJECTED_VOTES = {
  "0xe58d9940a395d303e691dbe0676710d9c140101a": {
    "choice": 2,
    "vp": 4182,
    "timestamp": 0,
  },
  "0xe2cfeab2beba9a7f09fd981f13e84df1e9978a5e": {
    "choice": 2,
    "vp": 1000,
    "timestamp": 0,
  },
  "0xd2d950cea649feef4d6111c18adbd9a37b3a9f63": {
    "choice": 1,
    "vp": 4269,
    "timestamp": 0,
  },
  "0x1f149885bb140f07ff88de2ac4d521bc27964c1b": {
    "choice": 2,
    "vp": 110000,
    "timestamp": 0,
  },
}

export const MULTIPLE_OPTION_VOTES = {
  "0xe58d9940a395d303e691dbe0676710d9c140101a": {
    "choice": 1,
    "vp": 4182,
    "timestamp": 0,
  },
  "0xe2cfeab2beba9a7f09fd981f13e84df1e9978a5e": {
    "choice": 2,
    "vp": 1000,
    "timestamp": 0,
  },
  "0xd2d950cea649feef4d6111c18adbd9a37b3a9f63": {
    "choice": 3,
    "vp": 4269,
    "timestamp": 0,
  },
  "0x1f149885bb140f07ff88de2ac4d521bc27964c1b": {
    "choice": 2,
    "vp": 110000,
    "timestamp": 0,
  },
}

export const DEFAULT_CONFIGURATION ={
  x: 15,
  y: 30,
  description: "POI description",
  choices: DEFAULT_CHOICES,
}

export const DEFAULT_PROPOSAL_TYPE = ProposalType.POI
