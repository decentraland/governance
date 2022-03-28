import 'jest'
import ProposalModel from '../model'
import {
  INVALID_PROPOSAL_POLL_OPTIONS,
  ProposalAttributes,
  ProposalGrantCategory,
  ProposalGrantTier,
  ProposalStatus,
  ProposalType,
  ProposalRequiredVP
} from '../types'
import { Vote } from '../../Votes/types'
import { DEFAULT_CHOICES } from '../utils'
import VotesModel from '../../Votes/model'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { getUpdateMessage } from './messages'

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
    vesting_address: null,
    passed_by: updatingUser,
    passed_description: passedDescription,
    rejected_by: updatingUser,
    rejected_description: rejectedDescription,
    created_at: start.toJSON() as any,
    updated_at: start.toJSON() as any,
    textsearch: null
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


describe("getUpdateMessage", () => {
  let enactedStatus = false
  let enactedDescription: string | null
  let proposalStatus = ProposalStatus.Active
  let proposalAttributes: ProposalAttributes
  let passedDescription: string | null
  let rejectedDescription: string | null
  let proposal: ProposalAttributes
  let configuration: any
  let user: string | null = null
  let proposalType: ProposalType
  let votes: Record<string, Vote>

  beforeAll(() => {
    configuration = DEFAULT_CONFIGURATION
    proposalType = DEFAULT_PROPOSAL_TYPE
    enactedStatus = false
  })

  beforeEach(() => {
    proposalAttributes = initProposalAttributes(proposalStatus, enactedStatus, enactedDescription, passedDescription, rejectedDescription, configuration, proposalType, user)
    proposal = ProposalModel.parse(proposalAttributes)
  })

  describe("when the proposal status is updated without an updating user", () => {

    describe("when the updated status is finished", () => {
      beforeAll(() => {
        proposalStatus = ProposalStatus.Finished
        votes = PASSED_VOTES
      })

      it("should return a message with the Finished status and the results of the voting", () => {
        expect(getUpdateMessage(proposal, votes)).toContain(proposal.title)
        expect(getUpdateMessage(proposal, votes)).toBe(
          "Test Proposal\n\n" +
          "This proposal is now in status: FINISHED.\n\n" +
          "Voting Results:\n" +
          "* Yes 97% 115,182 VP (3 votes)\n" +
          "* No 3% 4,269 VP (1 votes)\n"
        )
      })
    })

    describe("when the updated status is enacted", () => {
      beforeAll(() => {
        enactedStatus = true
        proposalStatus = ProposalStatus.Enacted
      })

      it("should return an exception indicating it can't be enacted without an enacting user", () => {
        expect(() => getUpdateMessage(proposal, votes)).toThrowError("Proposal can't be enacted without an enacting user")
      })
    })

    describe("when the updated status is passed", () => {
      beforeAll(() => {
        proposalStatus = ProposalStatus.Passed
        enactedStatus = false
        votes = PASSED_VOTES
      })

      describe("when the proposal is Catalyst", () => {
        beforeAll(() => {
          proposalType = ProposalType.Catalyst
          configuration = {
            owner: "Catalyst node owner",
            domain: "node.domain",
            description: "node description",
            choices: DEFAULT_CHOICES,
          }
        })
        it("should return a message with the passed status and the results of the voting", () => {
          expect(getUpdateMessage(proposal, votes)).not.toContain(TESTING_COMMITTEE_USER)
          expect(getUpdateMessage(proposal, votes)).not.toContain(passedDescription)
          expect(getUpdateMessage(proposal, votes)).toContain(proposal.title)
          expect(getUpdateMessage(proposal, votes)).toBe(
            "Test Proposal\n\n" +
            "This proposal is now in status: PASSED.\n\n" +
            "Voting Results:\n" +
            "* Yes 97% 115,182 VP (3 votes)\n" +
            "* No 3% 4,269 VP (1 votes)\n"
          )
        })
      })

      describe("when the proposal is BanName", () => {
        beforeAll(() => {
          proposalType = ProposalType.BanName
          configuration = {
            name: "Banned Name",
            description: "I find this offensive",
            choices: DEFAULT_CHOICES,
          }
        })
        it("should return a message with the passed status and the results of the voting", () => {
          expect(getUpdateMessage(proposal, votes)).not.toContain(TESTING_COMMITTEE_USER)
          expect(getUpdateMessage(proposal, votes)).not.toContain(passedDescription)
          expect(getUpdateMessage(proposal, votes)).toContain(proposal.title)
          expect(getUpdateMessage(proposal, votes)).toBe(
            "Test Proposal\n\n" +
            "This proposal is now in status: PASSED.\n\n" +
            "Voting Results:\n" +
            "* Yes 97% 115,182 VP (3 votes)\n" +
            "* No 3% 4,269 VP (1 votes)\n"
          )
        })
      })

      describe("when the proposal is POI", () => {
        beforeAll(() => {
          proposalType = ProposalType.POI
          configuration = {
            x: 15,
            y: 30,
            description: "POI description",
            choices: DEFAULT_CHOICES,
          }
        })
        it("should return a message with the passed status and the results of the voting", () => {
          expect(getUpdateMessage(proposal, votes)).not.toContain(TESTING_COMMITTEE_USER)
          expect(getUpdateMessage(proposal, votes)).not.toContain(passedDescription)
          expect(getUpdateMessage(proposal, votes)).toContain(proposal.title)
          expect(getUpdateMessage(proposal, votes)).toBe(
            "Test Proposal\n\n" +
            "This proposal is now in status: PASSED.\n\n" +
            "Voting Results:\n" +
            "* Yes 97% 115,182 VP (3 votes)\n" +
            "* No 3% 4,269 VP (1 votes)\n"
          )
        })
      })

      describe("when the proposal is Grant", () => {
        beforeAll(() => {
          proposalType = ProposalType.Grant
          configuration = {
            title: "Grant Title",
            abstract: "Grant Abstract",
            category: ProposalGrantCategory.Community,
            tier: ProposalGrantTier.Tier1,
            size: 1000,
            beneficiary: "Grant Beneficiary",
            description: "Grant Description",
            specification: "Grant Specification",
            personnel: "Grant Personnel",
            roadmap: "Grant Roadmap",
            choices: DEFAULT_CHOICES,
          }
        })
        it("should return a message with the passed status and the results of the voting", () => {
          expect(getUpdateMessage(proposal, votes)).not.toContain(TESTING_COMMITTEE_USER)
          expect(getUpdateMessage(proposal, votes)).not.toContain(passedDescription)
          expect(getUpdateMessage(proposal, votes)).toContain(proposal.title)
          expect(getUpdateMessage(proposal, votes)).toBe(
            "Test Proposal\n\n" +
            "This proposal is now in status: PASSED.\n\n" +
            "Voting Results:\n" +
            "* Yes 97% 115,182 VP (3 votes)\n" +
            "* No 3% 4,269 VP (1 votes)\n"
          )
        })
      })

      describe("when the proposal is a Poll", () => {
        beforeAll(() => {
          proposalType = ProposalType.Poll
          configuration = {
            title: "Poll title",
            description: "Poll description",
            choices: ["Let’s change the protocol", "There is no need to change it", INVALID_PROPOSAL_POLL_OPTIONS],
          }
        })

        it("should return a message with the passed status and the results of the voting", () => {
          expect(getUpdateMessage(proposal, votes)).not.toContain(TESTING_COMMITTEE_USER)
          expect(getUpdateMessage(proposal, votes)).not.toContain(passedDescription)
          expect(getUpdateMessage(proposal, votes)).toContain(proposal.title)
          expect(getUpdateMessage(proposal, votes)).toBe(
            "Test Proposal\n\n" +
            "This proposal is now in status: PASSED.\n\n" +
            "Voting Results:\n" +
            "* Let’s change the protocol 96% 115,182 VP (3 votes)\n" +
            "* There is no need to change it 3% 4,269 VP (1 votes)\n" +
            "* Invalid question/options 1% 100 VP (1 votes)\n")
        })

        describe("if there is no voting information available", () => {
          beforeAll(() => {
            votes = VotesModel.newScore(proposal.id).votes
          })

          it("should return a message with the passed status, with 0 votes", () => {
            expect(getUpdateMessage(proposal, votes)).toContain(proposal.title)
            expect(getUpdateMessage(proposal, votes)).toBe(
              "Test Proposal\n\n" +
              "This proposal is now in status: PASSED.\n\n" +
              "Voting Results:\n" +
              "* Let’s change the protocol 0% 0 VP (0 votes)\n" +
              "* There is no need to change it 0% 0 VP (0 votes)\n" +
              "* Invalid question/options 0% 0 VP (0 votes)\n")
          })
        })

        describe("if there are more than two options", () => {
          beforeAll(() => {
            configuration = {
              title: "Poll title",
              description: "Poll description",
              choices: ["Option 1", "Option 2", "Option 3", INVALID_PROPOSAL_POLL_OPTIONS],
            }
            votes = MULTIPLE_OPTION_VOTES
          })
          it("shows the results for every option", () => {
            expect(getUpdateMessage(proposal, votes)).not.toContain(TESTING_COMMITTEE_USER)
            expect(getUpdateMessage(proposal, votes)).not.toContain(passedDescription)
            expect(getUpdateMessage(proposal, votes)).toContain(proposal.title)
            expect(getUpdateMessage(proposal, votes)).toBe(
              "Test Proposal\n\n" +
              "This proposal is now in status: PASSED.\n\n" +
              "Voting Results:\n" +
              "* Option 1 3% 4,182 VP (1 votes)\n" +
              "* Option 2 94% 111,000 VP (2 votes)\n" +
              "* Option 3 3% 4,269 VP (1 votes)\n" +
              "* Invalid question/options 0% 0 VP (0 votes)\n")
          })
        })
      })
    })

    describe("when the updated status is rejected", () => {
      beforeAll(() => {
        proposalStatus = ProposalStatus.Rejected
        configuration = DEFAULT_CONFIGURATION
        votes = REJECTED_VOTES
      })

      it("should return a message with the rejected status and the results of the voting", () => {
        expect(getUpdateMessage(proposal, votes)).not.toContain(TESTING_COMMITTEE_USER)
        expect(getUpdateMessage(proposal, votes)).not.toContain(rejectedDescription)
        expect(getUpdateMessage(proposal, votes)).toContain(proposal.title)
        expect(getUpdateMessage(proposal, votes)).toBe(
          "Test Proposal\n\n" +
          "This proposal is now in status: REJECTED.\n" +
          "\n" +
          "Voting Results:\n" +
          "* Yes 3% 4,269 VP (1 votes)\n" +
          "* No 97% 115,182 VP (3 votes)\n")
      })

      describe("when a POLL is rejected because the invalid options choice won", () => {
        beforeAll(() => {
          votes =  {'0xcd15d83f42179b9a5b515eea0975f554444a9646': { choice: 3, vp: 500, timestamp: 1635863435 }}
          proposalType = ProposalType.Poll
          configuration = {
            title: "Poll title",
            description: "Poll description",
            choices: ["Option 1", "Option 2", INVALID_PROPOSAL_POLL_OPTIONS],
          }
        })

        it("should return a message with the rejected status and the results of the voting", () => {
          expect(getUpdateMessage(proposal, votes)).toBe(
            "Test Proposal\n\n" +
            "This proposal is now in status: REJECTED.\n" +
            "\n" +
            "Voting Results:\n" +
            "* Option 1 0% 0 VP (0 votes)\n" +
            "* Option 2 0% 0 VP (0 votes)\n" +
            "* Invalid question/options 100% 500 VP (1 votes)\n")
        })
      })

      describe("when a POLL is rejected because there are no votes", () => {
        beforeAll(() => {
          votes =  {}
          proposalType = ProposalType.Poll
          configuration = {
            title: "Poll title",
            description: "Poll description",
            choices: ["Let’s change the protocol", "There is no need to change it", INVALID_PROPOSAL_POLL_OPTIONS],
          }
        })

        it("should return a message with the rejected status and the 0 results of the voting", () => {
          expect(getUpdateMessage(proposal, votes)).toBe(
            "Test Proposal\n\n" +
            "This proposal is now in status: REJECTED.\n" +
            "\n" +
            "Voting Results:\n" +
            "* Let’s change the protocol 0% 0 VP (0 votes)\n" +
            "* There is no need to change it 0% 0 VP (0 votes)\n" +
            "* Invalid question/options 0% 0 VP (0 votes)\n")
        })
      })
    })
  })

  describe("when the proposal status is updated by a committee user", () => {
    beforeAll(() => {
      user = TESTING_COMMITTEE_USER
      proposalType = ProposalType.Poll
    })

    describe("when the updated status is enacted", () => {
      beforeAll(() => {
        enactedStatus = true
        enactedDescription = "enacted description"
        proposalStatus = ProposalStatus.Passed
      })

      it("should return a message with the enacting user address, the enacted status and the enacted description", () => {
        expect(getUpdateMessage(proposal, votes)).toContain(TESTING_COMMITTEE_USER)
        expect(getUpdateMessage(proposal, votes)).toContain(enactedDescription)
        expect(getUpdateMessage(proposal, votes)).toContain(proposal.title)
        expect(getUpdateMessage(proposal, votes)).toBe(
          "Test Proposal\n\n" +
          "This proposal has been ENACTED by a DAO Committee Member (0xCommiteeUserAddress)\n\n" +
          "enacted description")
      })

      describe('when the enacting description is null', () => {
        beforeAll(() => {
          enactedDescription = null
        })

        it('should not append anything to the original message', () => {
          expect(getUpdateMessage(proposal, votes)).not.toContain("null")
          expect(getUpdateMessage(proposal, votes)).toBe(
            "Test Proposal\n\n" +
            "This proposal has been ENACTED by a DAO Committee Member (0xCommiteeUserAddress)\n\n")
        })
      })
    })

    describe("when the updated status is passed", () => {
      beforeAll(() => {
        proposalStatus = ProposalStatus.Passed
        enactedStatus = false
        passedDescription = "passed description"
      })


      it("should return a message with the DAO user address, the passed status and the passed description", () => {
        expect(getUpdateMessage(proposal, votes)).toContain(TESTING_COMMITTEE_USER)
        expect(getUpdateMessage(proposal, votes)).toContain(passedDescription)
        expect(getUpdateMessage(proposal, votes)).toContain(proposal.title)
        expect(getUpdateMessage(proposal, votes)).toBe(
          "Test Proposal\n\n" +
          "This proposal has been PASSED by a DAO Committee Member (0xCommiteeUserAddress)\n\n" +
          "passed description")
      })

      describe('when the passed description is null', () => {
        beforeAll(() => {
          passedDescription = null
        })

        it('should not append anything to the original message', () => {
          expect(getUpdateMessage(proposal, votes)).not.toContain("null")
          expect(getUpdateMessage(proposal, votes)).toBe(
            "Test Proposal\n\n" +
            "This proposal has been PASSED by a DAO Committee Member (0xCommiteeUserAddress)\n\n")
        })
      })
    })

    describe("when the updated status is rejected", () => {
      beforeAll(() => {
        proposalStatus = ProposalStatus.Rejected
        rejectedDescription = "rejected description"
      })

      it("should return a message with the DAO user address, the rejected status and the rejected description", () => {
        expect(getUpdateMessage(proposal, votes)).toContain(TESTING_COMMITTEE_USER)
        expect(getUpdateMessage(proposal, votes)).toContain(rejectedDescription)
        expect(getUpdateMessage(proposal, votes)).toContain(proposal.title)
        expect(getUpdateMessage(proposal, votes)).toBe(
          "Test Proposal\n\n" +
          "This proposal has been REJECTED by a DAO Committee Member (0xCommiteeUserAddress)\n\n" +
          "rejected description")
      })

      describe('when the passed description is null', () => {
        beforeAll(() => {
          rejectedDescription = null
        })

        it('should not append anything to the original message', () => {
          expect(getUpdateMessage(proposal, votes)).not.toContain("null")
          expect(getUpdateMessage(proposal, votes)).toBe(
            "Test Proposal\n\n" +
            "This proposal has been REJECTED by a DAO Committee Member (0xCommiteeUserAddress)\n\n")
        })
      })
    })
  })
})
