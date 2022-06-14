import { def, get } from 'bdd-lazy-var/getter'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import VotesModel from '../../Votes/model'
import ProposalModel from '../model'
import {
  INVALID_PROPOSAL_POLL_OPTIONS,
  ProposalAttributes,
  ProposalGrantCategory,
  ProposalGrantTier,
  ProposalRequiredVP,
  ProposalStatus,
  ProposalType,
} from '../types'
import { DEFAULT_CHOICES } from '../utils'

import { getUpdateMessage } from './messages'

const start = Time.utc().set('seconds', 0)
const SNAPSHOT_DURATION = 600
export const TESTING_COMMITTEE_USER = '0xCommiteeUserAddress'

export function initProposalAttributes(
  proposalStatus: ProposalStatus,
  enactedStatus: boolean,
  enactedDescription: string | null,
  passedDescription: string | null,
  rejectedDescription: string | null,
  configuration: Record<string, unknown>,
  type: ProposalType,
  updatingUser: string | null
): ProposalAttributes {
  return {
    id: '1',
    type: type,
    user: '0xProposalCreatorUserAddress',
    required_to_pass: ProposalRequiredVP[type],
    configuration: JSON.stringify(configuration),
    title: 'Test Proposal',
    description: 'Test proposal description',
    status: proposalStatus,
    snapshot_id: 'snapshot test id',
    snapshot_space: 'snapshot test space',
    snapshot_proposal: null,
    snapshot_signature: 'snapshot signature',
    snapshot_network: 'snapshot network',
    discourse_id: 333,
    discourse_topic_id: 444,
    discourse_topic_slug: 'discourse test topic slug',
    start_at: start.toJSON() as never,
    finish_at: Time.utc(start).add(SNAPSHOT_DURATION, 'seconds').toJSON() as never,
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
    created_at: start.toJSON() as never,
    updated_at: start.toJSON() as never,
    textsearch: null,
  }
}

export const PASSED_VOTES = {
  '0xe58d9940a395d303e691dbe0676710d9c140101a': {
    choice: 1,
    vp: 4182,
    timestamp: 0,
  },
  '0xe2cfeab2beba9a7f09fd981f13e84df1e9978a5e': {
    choice: 1,
    vp: 1000,
    timestamp: 0,
  },
  '0xd2d950cea649feef4d6111c18adbd9a37b3a9f63': {
    choice: 2,
    vp: 4269,
    timestamp: 0,
  },
  '0x1f149885bb140f07ff88de2ac4d521bc27964c1b': {
    choice: 1,
    vp: 110000,
    timestamp: 0,
  },
}

const POLL_VOTES = {
  ...PASSED_VOTES,
  '0x1f149885bb140f07ff88de2ac4d521bc27964c12': {
    choice: 3,
    vp: 100,
    timestamp: 0,
  },
}

export const REJECTED_VOTES = {
  '0xe58d9940a395d303e691dbe0676710d9c140101a': {
    choice: 2,
    vp: 4182,
    timestamp: 0,
  },
  '0xe2cfeab2beba9a7f09fd981f13e84df1e9978a5e': {
    choice: 2,
    vp: 1000,
    timestamp: 0,
  },
  '0xd2d950cea649feef4d6111c18adbd9a37b3a9f63': {
    choice: 1,
    vp: 4269,
    timestamp: 0,
  },
  '0x1f149885bb140f07ff88de2ac4d521bc27964c1b': {
    choice: 2,
    vp: 110000,
    timestamp: 0,
  },
}

export const MULTIPLE_OPTION_VOTES = {
  '0xe58d9940a395d303e691dbe0676710d9c140101a': {
    choice: 1,
    vp: 4182,
    timestamp: 0,
  },
  '0xe2cfeab2beba9a7f09fd981f13e84df1e9978a5e': {
    choice: 2,
    vp: 1000,
    timestamp: 0,
  },
  '0xd2d950cea649feef4d6111c18adbd9a37b3a9f63': {
    choice: 3,
    vp: 4269,
    timestamp: 0,
  },
  '0x1f149885bb140f07ff88de2ac4d521bc27964c1b': {
    choice: 2,
    vp: 110000,
    timestamp: 0,
  },
}

export const DEFAULT_CONFIGURATION = {
  x: 15,
  y: 30,
  description: 'POI description',
  choices: DEFAULT_CHOICES,
}

export const DEFAULT_PROPOSAL_TYPE = ProposalType.POI

describe('getUpdateMessage', () => {
  let proposalAttributes: ProposalAttributes
  def('updateMessage', () => getUpdateMessage(get.proposal, get.votes))
  def('proposal', () => {
    proposalAttributes = initProposalAttributes(
      get.proposalStatus,
      get.enactedStatus,
      get.enactedDescription,
      get.passedDescription,
      get.rejectedDescription,
      get.configuration,
      get.proposalType,
      get.user
    )
    return ProposalModel.parse(proposalAttributes)
  })

  def('enactedStatus', () => false)
  def('configuration', () => DEFAULT_CONFIGURATION)
  def('proposalType', () => DEFAULT_PROPOSAL_TYPE)
  def('proposalStatus', () => ProposalStatus.Active)

  describe('when the proposal status is updated without an updating user', () => {
    describe('when the updated status is finished', () => {
      def('proposalStatus', () => ProposalStatus.Finished)
      def('votes', () => PASSED_VOTES)

      it('should return a message with the Finished status and the results of the voting', () => {
        expect(get.updateMessage).toContain(get.proposal.title)
        expect(get.updateMessage).toBe(
          'Test Proposal\n\n' +
            'This proposal is now in status: FINISHED.\n\n' +
            'Voting Results:\n' +
            '* Yes 97% 115,182 VP (3 votes)\n' +
            '* No 3% 4,269 VP (1 votes)\n'
        )
      })
    })

    describe('when the updated status is enacted', () => {
      def('enactedStatus', () => true)
      def('proposalStatus', () => ProposalStatus.Enacted)

      it("should return an exception indicating it can't be enacted without an enacting user", () => {
        expect(() => get.updateMessage).toThrowError("Proposal can't be enacted without an enacting user")
      })
    })

    describe('when the updated status is passed', () => {
      def('votes', () => PASSED_VOTES)
      def('proposalStatus', () => ProposalStatus.Passed)

      describe('when the proposal is Catalyst', () => {
        def('proposalType', () => ProposalType.Catalyst)
        def('configuration', () => {
          return {
            owner: 'Catalyst node owner',
            domain: 'node.domain',
            description: 'node description',
            choices: DEFAULT_CHOICES,
          }
        })
        it('should return a message with the passed status and the results of the voting', () => {
          expect(get.updateMessage).not.toContain(TESTING_COMMITTEE_USER)
          expect(get.updateMessage).not.toContain(get.passedDescription)
          expect(get.updateMessage).toContain(get.proposal.title)
          expect(get.updateMessage).toBe(
            'Test Proposal\n\n' +
              'This proposal is now in status: PASSED.\n\n' +
              'Voting Results:\n' +
              '* Yes 97% 115,182 VP (3 votes)\n' +
              '* No 3% 4,269 VP (1 votes)\n'
          )
        })
      })

      describe('when the proposal is BanName', () => {
        def('proposalType', () => ProposalType.BanName)
        def('configuration', () => {
          return {
            name: 'Banned Name',
            description: 'I find this offensive',
            choices: DEFAULT_CHOICES,
          }
        })

        it('should return a message with the passed status and the results of the voting', () => {
          expect(get.updateMessage).not.toContain(TESTING_COMMITTEE_USER)
          expect(get.updateMessage).not.toContain(get.passedDescription)
          expect(get.updateMessage).toContain(get.proposal.title)
          expect(get.updateMessage).toBe(
            'Test Proposal\n\n' +
              'This proposal is now in status: PASSED.\n\n' +
              'Voting Results:\n' +
              '* Yes 97% 115,182 VP (3 votes)\n' +
              '* No 3% 4,269 VP (1 votes)\n'
          )
        })
      })

      describe('when the proposal is POI', () => {
        def('proposalType', () => ProposalType.POI)
        def('configuration', () => {
          return {
            x: 15,
            y: 30,
            description: 'POI description',
            choices: DEFAULT_CHOICES,
          }
        })

        it('should return a message with the passed status and the results of the voting', () => {
          expect(get.updateMessage).not.toContain(TESTING_COMMITTEE_USER)
          expect(get.updateMessage).not.toContain(get.passedDescription)
          expect(get.updateMessage).toContain(get.proposal.title)
          expect(get.updateMessage).toBe(
            'Test Proposal\n\n' +
              'This proposal is now in status: PASSED.\n\n' +
              'Voting Results:\n' +
              '* Yes 97% 115,182 VP (3 votes)\n' +
              '* No 3% 4,269 VP (1 votes)\n'
          )
        })
      })

      describe('when the proposal is Grant', () => {
        def('proposalType', () => ProposalType.Grant)
        def('configuration', () => {
          return {
            title: 'Grant Title',
            abstract: 'Grant Abstract',
            category: ProposalGrantCategory.Community,
            tier: ProposalGrantTier.Tier1,
            size: 1000,
            beneficiary: 'Grant Beneficiary',
            description: 'Grant Description',
            specification: 'Grant Specification',
            personnel: 'Grant Personnel',
            roadmap: 'Grant Roadmap',
            choices: DEFAULT_CHOICES,
          }
        })
        it('should return a message with the passed status and the results of the voting', () => {
          expect(get.updateMessage).not.toContain(TESTING_COMMITTEE_USER)
          expect(get.updateMessage).not.toContain(get.passedDescription)
          expect(get.updateMessage).toContain(get.proposal.title)
          expect(get.updateMessage).toBe(
            'Test Proposal\n\n' +
              'This proposal is now in status: PASSED.\n\n' +
              'Voting Results:\n' +
              '* Yes 97% 115,182 VP (3 votes)\n' +
              '* No 3% 4,269 VP (1 votes)\n'
          )
        })
      })

      describe('when the proposal is a Poll', () => {
        def('proposalType', () => ProposalType.Poll)
        def('votes', () => POLL_VOTES)
        def('configuration', () => {
          return {
            title: 'Poll title',
            description: 'Poll description',
            choices: ['Let’s change the protocol', 'There is no need to change it', INVALID_PROPOSAL_POLL_OPTIONS],
          }
        })

        it('should return a message with the passed status and the results of the voting', () => {
          expect(get.updateMessage).not.toContain(TESTING_COMMITTEE_USER)
          expect(get.updateMessage).not.toContain(get.passedDescription)
          expect(get.updateMessage).toContain(get.proposal.title)
          expect(get.updateMessage).toBe(
            'Test Proposal\n\n' +
              'This proposal is now in status: PASSED.\n\n' +
              'Voting Results:\n' +
              '* Let’s change the protocol 96% 115,182 VP (3 votes)\n' +
              '* There is no need to change it 3% 4,269 VP (1 votes)\n' +
              '* Invalid question/options 1% 100 VP (1 votes)\n'
          )
        })

        describe('if there is no voting information available', () => {
          def('votes', () => VotesModel.newScore(get.proposal.id).votes)

          it('should return a message with the passed status, with 0 votes', () => {
            expect(get.updateMessage).toContain(get.proposal.title)
            expect(get.updateMessage).toBe(
              'Test Proposal\n\n' +
                'This proposal is now in status: PASSED.\n\n' +
                'Voting Results:\n' +
                '* Let’s change the protocol 0% 0 VP (0 votes)\n' +
                '* There is no need to change it 0% 0 VP (0 votes)\n' +
                '* Invalid question/options 0% 0 VP (0 votes)\n'
            )
          })
        })

        describe('if there are more than two options', () => {
          def('configuration', () => {
            return {
              title: 'Poll title',
              description: 'Poll description',
              choices: ['Option 1', 'Option 2', 'Option 3', INVALID_PROPOSAL_POLL_OPTIONS],
            }
          })
          def('votes', () => MULTIPLE_OPTION_VOTES)

          it('shows the results for every option', () => {
            expect(get.updateMessage).not.toContain(TESTING_COMMITTEE_USER)
            expect(get.updateMessage).not.toContain(get.passedDescription)
            expect(get.updateMessage).toContain(get.proposal.title)
            expect(get.updateMessage).toBe(
              'Test Proposal\n\n' +
                'This proposal is now in status: PASSED.\n\n' +
                'Voting Results:\n' +
                '* Option 1 3% 4,182 VP (1 votes)\n' +
                '* Option 2 94% 111,000 VP (2 votes)\n' +
                '* Option 3 3% 4,269 VP (1 votes)\n' +
                '* Invalid question/options 0% 0 VP (0 votes)\n'
            )
          })
        })
      })
    })

    describe('when the updated status is rejected', () => {
      def('configuration', () => DEFAULT_CONFIGURATION)
      def('votes', () => REJECTED_VOTES)
      def('proposalStatus', () => ProposalStatus.Rejected)

      it('should return a message with the rejected status and the results of the voting', () => {
        expect(get.updateMessage).not.toContain(TESTING_COMMITTEE_USER)
        expect(get.updateMessage).not.toContain(get.rejectedDescription)
        expect(get.updateMessage).toContain(get.proposal.title)
        expect(get.updateMessage).toBe(
          'Test Proposal\n\n' +
            'This proposal is now in status: REJECTED.\n' +
            '\n' +
            'Voting Results:\n' +
            '* Yes 3% 4,269 VP (1 votes)\n' +
            '* No 97% 115,182 VP (3 votes)\n'
        )
      })

      describe('when a POLL is rejected because the invalid options choice won', () => {
        def('votes', () => {
          return { '0xcd15d83f42179b9a5b515eea0975f554444a9646': { choice: 3, vp: 500, timestamp: 1635863435 } }
        })
        def('configuration', () => {
          return {
            title: 'Poll title',
            description: 'Poll description',
            choices: ['Option 1', 'Option 2', INVALID_PROPOSAL_POLL_OPTIONS],
          }
        })

        it('should return a message with the rejected status and the results of the voting', () => {
          expect(get.updateMessage).toBe(
            'Test Proposal\n\n' +
              'This proposal is now in status: REJECTED.\n' +
              '\n' +
              'Voting Results:\n' +
              '* Option 1 0% 0 VP (0 votes)\n' +
              '* Option 2 0% 0 VP (0 votes)\n' +
              '* Invalid question/options 100% 500 VP (1 votes)\n'
          )
        })
      })

      describe('when a POLL is rejected because there are no votes', () => {
        def('votes', () => {
          return {}
        })
        def('configuration', () => {
          return {
            title: 'Poll title',
            description: 'Poll description',
            choices: ['Let’s change the protocol', 'There is no need to change it', INVALID_PROPOSAL_POLL_OPTIONS],
          }
        })

        it('should return a message with the rejected status and the 0 results of the voting', () => {
          expect(get.updateMessage).toBe(
            'Test Proposal\n\n' +
              'This proposal is now in status: REJECTED.\n' +
              '\n' +
              'Voting Results:\n' +
              '* Let’s change the protocol 0% 0 VP (0 votes)\n' +
              '* There is no need to change it 0% 0 VP (0 votes)\n' +
              '* Invalid question/options 0% 0 VP (0 votes)\n'
          )
        })
      })
    })
  })

  describe('when the proposal status is updated by a committee user', () => {
    def('proposalType', () => ProposalType.Poll)
    def('user', () => TESTING_COMMITTEE_USER)

    describe('when the updated status is enacted', () => {
      def('enactedDescription', () => 'enacted description')
      def('enactedStatus', () => true)
      def('proposalStatus', () => ProposalStatus.Passed)

      it('should return a message with the enacting user address, the enacted status and the enacted description', () => {
        expect(get.updateMessage).toContain(TESTING_COMMITTEE_USER)
        expect(get.updateMessage).toContain(get.enactedDescription)
        expect(get.updateMessage).toContain(get.proposal.title)
        expect(get.updateMessage).toBe(
          'Test Proposal\n\n' +
            'This proposal has been ENACTED by a DAO Committee Member (0xCommiteeUserAddress)\n\n' +
            'enacted description'
        )
      })

      describe('when the enacting description is null', () => {
        def('enactedDescription', () => null)

        it('should not append anything to the original message', () => {
          expect(get.updateMessage).not.toContain('null')
          expect(get.updateMessage).toBe(
            'Test Proposal\n\n' + 'This proposal has been ENACTED by a DAO Committee Member (0xCommiteeUserAddress)\n\n'
          )
        })
      })
    })

    describe('when the updated status is passed', () => {
      def('passedDescription', () => 'passed description')
      def('proposalStatus', () => ProposalStatus.Passed)

      it('should return a message with the DAO user address, the passed status and the passed description', () => {
        expect(get.updateMessage).toContain(TESTING_COMMITTEE_USER)
        expect(get.updateMessage).toContain(get.passedDescription)
        expect(get.updateMessage).toContain(get.proposal.title)
        expect(get.updateMessage).toBe(
          'Test Proposal\n\n' +
            'This proposal has been PASSED by a DAO Committee Member (0xCommiteeUserAddress)\n\n' +
            'passed description'
        )
      })

      describe('when the passed description is null', () => {
        def('passedDescription', () => null)

        it('should not append anything to the original message', () => {
          expect(get.updateMessage).not.toContain('null')
          expect(get.updateMessage).toBe(
            'Test Proposal\n\n' + 'This proposal has been PASSED by a DAO Committee Member (0xCommiteeUserAddress)\n\n'
          )
        })
      })
    })

    describe('when the updated status is rejected', () => {
      def('rejectedDescription', () => 'rejected description')
      def('proposalStatus', () => ProposalStatus.Rejected)

      it('should return a message with the DAO user address, the rejected status and the rejected description', () => {
        expect(get.updateMessage).toContain(TESTING_COMMITTEE_USER)
        expect(get.updateMessage).toContain(get.rejectedDescription)
        expect(get.updateMessage).toContain(get.proposal.title)
        expect(get.updateMessage).toBe(
          'Test Proposal\n\n' +
            'This proposal has been REJECTED by a DAO Committee Member (0xCommiteeUserAddress)\n\n' +
            'rejected description'
        )
      })

      describe('when the passed description is null', () => {
        def('rejectedDescription', () => null)

        it('should not append anything to the original message', () => {
          expect(get.updateMessage).not.toContain('null')
          expect(get.updateMessage).toBe(
            'Test Proposal\n\n' +
              'This proposal has been REJECTED by a DAO Committee Member (0xCommiteeUserAddress)\n\n'
          )
        })
      })
    })
  })
})
