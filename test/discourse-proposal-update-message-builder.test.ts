import "jest"

import ProposalModel from "../src/entities/Proposal/model"
import {
  INVALID_PROPOSAL_POLL_OPTIONS,
  ProposalAttributes,
  ProposalGrantCategory,
  ProposalGrantTier,
  ProposalStatus,
  ProposalType,
} from "../src/entities/Proposal/types"
import { Vote } from "../src/entities/Votes/types"
import { DEFAULT_CHOICES } from "../src/entities/Proposal/utils"
import { DiscourseProposalUpdateMessageBuilder } from "../src/entities/Proposal/discourse-proposal-update-message-builder"
import {
  TESTING_COMMITTEE_USER, DEFAULT_CONFIGURATION, DEFAULT_PROPOSAL_TYPE,
  initProposalAttributes,
  PASSED_VOTES, REJECTED_VOTES, MULTIPLE_OPTION_VOTES,
} from "./test-utils"
import VotesModel from "../src/entities/Votes/model"

describe("DiscourseProposalUpdateMessageBuilder", () => {
  let messageBuilder: DiscourseProposalUpdateMessageBuilder
  let enactedStatus = false
  let enactedDescription: string | null
  let proposalStatus : ProposalStatus
  let proposalAttributes: ProposalAttributes
  let passedDescription: string | null
  let rejectedDescription: string | null
  let proposal: ProposalAttributes
  let configuration: any
  let user: string | null = null
  let proposalType: ProposalType
  let votes: Record<string, Vote>

  beforeAll(() => {
    proposalStatus = ProposalStatus.Active
    configuration = DEFAULT_CONFIGURATION
    proposalType = DEFAULT_PROPOSAL_TYPE
    enactedStatus = false
  })

  beforeEach(() => {
    proposalAttributes = initProposalAttributes(proposalStatus, enactedStatus, enactedDescription, passedDescription, rejectedDescription, configuration, proposalType, user)
    proposal = ProposalModel.parse(proposalAttributes)
    messageBuilder = new DiscourseProposalUpdateMessageBuilder(proposal, votes)
  })

  describe("when the proposal status is updated without an updating user", () => {

    describe("when the updated status is enacted", () => {
      beforeAll(() => {
        enactedStatus = true
        proposalStatus = ProposalStatus.Enacted
      })

      it("should return an exception indicating it can't be enacted without an enacting user", () => {
        expect(() => messageBuilder.getUpdateMessage()).toThrowError("Proposal can't be enacted without an enacting user")
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
          expect(messageBuilder.getUpdateMessage()).not.toContain(TESTING_COMMITTEE_USER)
          expect(messageBuilder.getUpdateMessage()).not.toContain(passedDescription)
          expect(messageBuilder.getUpdateMessage()).toContain(proposal.title)
          expect(messageBuilder.getUpdateMessage()).toBe(
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
          expect(messageBuilder.getUpdateMessage()).not.toContain(TESTING_COMMITTEE_USER)
          expect(messageBuilder.getUpdateMessage()).not.toContain(passedDescription)
          expect(messageBuilder.getUpdateMessage()).toContain(proposal.title)
          expect(messageBuilder.getUpdateMessage()).toBe(
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
          expect(messageBuilder.getUpdateMessage()).not.toContain(TESTING_COMMITTEE_USER)
          expect(messageBuilder.getUpdateMessage()).not.toContain(passedDescription)
          expect(messageBuilder.getUpdateMessage()).toContain(proposal.title)
          expect(messageBuilder.getUpdateMessage()).toBe(
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
          expect(messageBuilder.getUpdateMessage()).not.toContain(TESTING_COMMITTEE_USER)
          expect(messageBuilder.getUpdateMessage()).not.toContain(passedDescription)
          expect(messageBuilder.getUpdateMessage()).toContain(proposal.title)
          expect(messageBuilder.getUpdateMessage()).toBe(
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
          expect(messageBuilder.getUpdateMessage()).not.toContain(TESTING_COMMITTEE_USER)
          expect(messageBuilder.getUpdateMessage()).not.toContain(passedDescription)
          expect(messageBuilder.getUpdateMessage()).toContain(proposal.title)
          expect(messageBuilder.getUpdateMessage()).toBe(
            "Test Proposal\n\n" +
            "This proposal is now in status: PASSED.\n\n" +
            "Voting Results:\n" +
            "* Let’s change the protocol 96% 115,182 VP (3 votes)\n" +
            "* There is no need to change it 3% 4,269 VP (1 votes)\n" +
            "* Invalid question/options 1% 100 VP (1 votes)\n")
        })

        describe("if there is no voting information available", () => {
          beforeAll(() => {
            votes = VotesModel.newScoreFor(proposal.id).votes
          })

          it("should return a message with the passed status, with 0 votes", () => {
            expect(messageBuilder.getUpdateMessage()).toContain(proposal.title)
            expect(messageBuilder.getUpdateMessage()).toBe(
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
            expect(messageBuilder.getUpdateMessage()).not.toContain(TESTING_COMMITTEE_USER)
            expect(messageBuilder.getUpdateMessage()).not.toContain(passedDescription)
            expect(messageBuilder.getUpdateMessage()).toContain(proposal.title)
            expect(messageBuilder.getUpdateMessage()).toBe(
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
        expect(messageBuilder.getUpdateMessage()).not.toContain(TESTING_COMMITTEE_USER)
        expect(messageBuilder.getUpdateMessage()).not.toContain(rejectedDescription)
        expect(messageBuilder.getUpdateMessage()).toContain(proposal.title)
        expect(messageBuilder.getUpdateMessage()).toBe(
          "Test Proposal\n\n" +
          "This proposal is now in status: REJECTED.\n" +
          "\n" +
          "Voting Results:\n" +
          "* Yes 3% 4,269 VP (1 votes)\n" +
          "* No 97% 115,182 VP (3 votes)\n")
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
        expect(messageBuilder.getUpdateMessage()).toContain(TESTING_COMMITTEE_USER)
        expect(messageBuilder.getUpdateMessage()).toContain(enactedDescription)
        expect(messageBuilder.getUpdateMessage()).toContain(proposal.title)
        expect(messageBuilder.getUpdateMessage()).toBe(
          "Test Proposal\n\n" +
          "This proposal has been ENACTED by a DAO Committee Member (0xCommiteeUserAddress)\n\n" +
          "enacted description")
      })
    })

    describe("when the updated status is passed", () => {
      beforeAll(() => {
        proposalStatus = ProposalStatus.Passed
        enactedStatus = false
        passedDescription = "passed description"
      })


      it("should return a message with the DAO user address, the passed status and the passed description", () => {
        expect(messageBuilder.getUpdateMessage()).toContain(TESTING_COMMITTEE_USER)
        expect(messageBuilder.getUpdateMessage()).toContain(passedDescription)
        expect(messageBuilder.getUpdateMessage()).toContain(proposal.title)
        expect(messageBuilder.getUpdateMessage()).toBe(
          "Test Proposal\n\n" +
          "This proposal has been PASSED by a DAO Committee Member (0xCommiteeUserAddress)\n\n" +
          "passed description")
      })
    })

    describe("when the updated status is rejected", () => {
      beforeAll(() => {
        proposalStatus = ProposalStatus.Rejected
        rejectedDescription = "rejected description"
      })

      it("should return a message with the DAO user address, the rejected status and the rejected description", () => {
        expect(messageBuilder.getUpdateMessage()).toContain(TESTING_COMMITTEE_USER)
        expect(messageBuilder.getUpdateMessage()).toContain(rejectedDescription)
        expect(messageBuilder.getUpdateMessage()).toContain(proposal.title)
        expect(messageBuilder.getUpdateMessage()).toBe(
          "Test Proposal\n\n" +
          "This proposal has been REJECTED by a DAO Committee Member (0xCommiteeUserAddress)\n\n" +
          "rejected description")
      })
    })
  })
})
