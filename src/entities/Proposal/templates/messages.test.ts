import Time from '../../../utils/date/Time'
import { GrantTier } from '../../Grant/GrantTier'
import { GrantTierType, NewGrantCategory, OldGrantCategory } from '../../Grant/types'
import VotesModel from '../../Votes/model'
import { Vote } from '../../Votes/types'
import ProposalModel from '../model'
import {
  INVALID_PROPOSAL_POLL_OPTIONS,
  ProposalAttributes,
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
  enactingTransaction: string | null,
  passedDescription: string | null,
  rejectedDescription: string | null,
  configuration: Record<string, unknown>,
  type: ProposalType,
  updatingUser: string | null
): ProposalAttributes {
  return {
    id: '1',
    type,
    user: '0xProposalCreatorUserAddress',
    required_to_pass:
      type !== ProposalType.Grant ? ProposalRequiredVP[type] : GrantTier.getVPThreshold(Number(configuration.size)),
    configuration: JSON.stringify(configuration),
    title: 'Test Proposal',
    description: 'Test proposal description',
    status: proposalStatus,
    snapshot_id: 'snapshot test id',
    snapshot_space: 'snapshot test space',
    snapshot_proposal: null,
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
    enacting_tx: enactingTransaction,
    vesting_addresses: [],
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

type ProposalCreation = {
  proposalStatus: ProposalStatus
  enactedStatus?: boolean
  enactedDescription: string | null
  enactingTransaction: string | null
  passedDescription: string | null
  rejectedDescription: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configuration?: any
  proposalType: ProposalType
  user: string | null
}

const BASE_PROPOSAL = {
  proposalType: DEFAULT_PROPOSAL_TYPE,
  proposalStatus: ProposalStatus.Active,
  enactedStatus: false,
  enactedDescription: '',
  enactingTransaction: null,
  passedDescription: null,
  rejectedDescription: null,
  configuration: DEFAULT_CONFIGURATION,
  user: null,
}

describe('getUpdateMessage', () => {
  const updateMessage = (proposal: ProposalAttributes, votes: Record<string, Vote>) => getUpdateMessage(proposal, votes)
  const getProposal = (data: Partial<ProposalCreation>) => {
    const {
      proposalStatus,
      enactedStatus,
      enactedDescription,
      enactingTransaction,
      passedDescription,
      rejectedDescription,
      configuration,
      proposalType,
      user,
    } = { ...BASE_PROPOSAL, ...data }

    return ProposalModel.parse(
      initProposalAttributes(
        proposalStatus,
        enactedStatus,
        enactedDescription,
        enactingTransaction,
        passedDescription,
        rejectedDescription,
        configuration,
        proposalType,
        user
      )
    )
  }

  describe('when the proposal status is updated without an updating user', () => {
    describe('when the updated status is finished', () => {
      const proposalStatus = ProposalStatus.Finished
      const votes = PASSED_VOTES
      const proposal = getProposal({ proposalStatus })
      const message = updateMessage(proposal, votes)

      it('should return a message with the Finished status and the results of the voting', () => {
        expect(message).toContain(proposal.title)
        expect(message).toBe(
          'Test Proposal\n\n' +
            'This proposal is now in status: FINISHED.\n\n' +
            'Voting Results:\n' +
            '* Yes 97% 115,182 VP (3 votes)\n' +
            '* No 3% 4,269 VP (1 votes)\n' +
            '* Abstain 0% 0 VP (0 votes)\n'
        )
      })
    })

    describe('when the updated status is enacted', () => {
      const enactedStatus = true
      const proposalStatus = ProposalStatus.Enacted
      const proposal = getProposal({ proposalStatus, enactedStatus })
      const votes = PASSED_VOTES

      it("should return an exception indicating it can't be enacted without an enacting user", () => {
        expect(() => updateMessage(proposal, votes)).toThrow("Proposal can't be enacted without an enacting user")
      })
    })

    describe('when the updated status is passed', () => {
      const votes = PASSED_VOTES
      const proposalStatus = ProposalStatus.Passed

      describe('when the proposal is Catalyst', () => {
        const proposalType = ProposalType.Catalyst
        const configuration = {
          owner: 'Catalyst node owner',
          domain: 'node.domain',
          description: 'node description',
          choices: DEFAULT_CHOICES,
        }
        const proposal = getProposal({ proposalStatus, proposalType, configuration })
        const message = getUpdateMessage(proposal, votes)

        it('should return a message with the passed status and the results of the voting', () => {
          expect(message).not.toContain(TESTING_COMMITTEE_USER)
          expect(message).toContain(proposal.title)
          expect(message).toBe(
            'Test Proposal\n\n' +
              'This proposal is now in status: PASSED.\n\n' +
              'Voting Results:\n' +
              '* Yes 97% 115,182 VP (3 votes)\n' +
              '* No 3% 4,269 VP (1 votes)\n' +
              '* Abstain 0% 0 VP (0 votes)\n'
          )
        })
      })

      describe('when the proposal is BanName', () => {
        const proposalType = ProposalType.BanName
        const configuration = {
          name: 'Banned Name',
          description: 'I find this offensive',
          choices: DEFAULT_CHOICES,
        }
        const proposal = getProposal({ proposalStatus, proposalType, configuration })
        const message = getUpdateMessage(proposal, votes)

        it('should return a message with the passed status and the results of the voting', () => {
          expect(message).not.toContain(TESTING_COMMITTEE_USER)
          expect(message).toContain(proposal.title)
          expect(message).toBe(
            'Test Proposal\n\n' +
              'This proposal is now in status: PASSED.\n\n' +
              'Voting Results:\n' +
              '* Yes 97% 115,182 VP (3 votes)\n' +
              '* No 3% 4,269 VP (1 votes)\n' +
              '* Abstain 0% 0 VP (0 votes)\n'
          )
        })
      })

      describe('when the proposal is POI', () => {
        const proposalType = ProposalType.POI
        const configuration = {
          x: 15,
          y: 30,
          description: 'POI description',
          choices: DEFAULT_CHOICES,
        }
        const proposal = getProposal({ proposalStatus, proposalType, configuration })
        const message = getUpdateMessage(proposal, votes)

        it('should return a message with the passed status and the results of the voting', () => {
          expect(message).not.toContain(TESTING_COMMITTEE_USER)
          expect(message).toContain(proposal.title)
          expect(message).toBe(
            'Test Proposal\n\n' +
              'This proposal is now in status: PASSED.\n\n' +
              'Voting Results:\n' +
              '* Yes 97% 115,182 VP (3 votes)\n' +
              '* No 3% 4,269 VP (1 votes)\n' +
              '* Abstain 0% 0 VP (0 votes)\n'
          )
        })
      })

      describe('when the proposal is Grant', () => {
        const proposalType = ProposalType.Grant
        const configuration = {
          title: 'Grant Title',
          abstract: 'Grant Abstract',
          category: OldGrantCategory.Community,
          tier: GrantTierType.Tier1,
          size: 1000,
          beneficiary: 'Grant Beneficiary',
          description: 'Grant Description',
          roadmap: 'Grant Roadmap',
          choices: DEFAULT_CHOICES,
        }
        const proposal = getProposal({ proposalStatus, proposalType, configuration })
        const message = getUpdateMessage(proposal, votes)

        it('should return a message with the passed status and the results of the voting', () => {
          expect(message).not.toContain(TESTING_COMMITTEE_USER)
          expect(message).toContain(proposal.title)
          expect(message).toBe(
            'Test Proposal\n\n' +
              'This proposal is now in status: PASSED.\n\n' +
              'Voting Results:\n' +
              '* Yes 97% 115,182 VP (3 votes)\n' +
              '* No 3% 4,269 VP (1 votes)\n' +
              '* Abstain 0% 0 VP (0 votes)\n'
          )
        })
      })

      describe('when the proposal is a Poll', () => {
        const proposalType = ProposalType.Poll
        const configuration = {
          title: 'Poll title',
          description: 'Poll description',
          choices: ['Let’s change the protocol', 'There is no need to change it', INVALID_PROPOSAL_POLL_OPTIONS],
        }
        const proposalStatus = ProposalStatus.Passed

        it('should return a message with the passed status and the results of the voting', () => {
          const proposal = getProposal({ ...BASE_PROPOSAL, proposalType, proposalStatus, configuration })
          const message = getUpdateMessage(proposal, POLL_VOTES)

          expect(message).not.toContain(TESTING_COMMITTEE_USER)
          // expect(message).not.toContain(get.passedDescription)
          expect(message).toContain(proposal.title)
          expect(message).toBe(
            'Test Proposal\n\n' +
              'This proposal is now in status: PASSED.\n\n' +
              'Voting Results:\n' +
              '* Let’s change the protocol 96% 115,182 VP (3 votes)\n' +
              '* There is no need to change it 3% 4,269 VP (1 votes)\n' +
              '* Invalid question/options 1% 100 VP (1 votes)\n'
          )
        })

        describe('if there is no voting information available', () => {
          const proposal = getProposal({ ...BASE_PROPOSAL, proposalType, proposalStatus, configuration })
          const getVotes = (proposalId: string) => VotesModel.newScore(proposalId).votes
          const message = getUpdateMessage(proposal, getVotes(proposal.id))

          it('should return a message with the passed status, with 0 votes', () => {
            expect(message).toContain(proposal.title)
            expect(message).toBe(
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
          const configuration = {
            title: 'Poll title',
            description: 'Poll description',
            choices: ['Option 1', 'Option 2', 'Option 3', INVALID_PROPOSAL_POLL_OPTIONS],
          }
          const proposal = getProposal({ proposalType, proposalStatus, configuration })
          const message = getUpdateMessage(proposal, MULTIPLE_OPTION_VOTES)

          it('shows the results for every option', () => {
            expect(message).not.toContain(TESTING_COMMITTEE_USER)
            expect(message).toContain(proposal.title)
            expect(message).toBe(
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

    describe('when the updated status is Out of Budget', () => {
      describe('when the proposal is Grant', () => {
        const proposalStatus = ProposalStatus.OutOfBudget
        const votes = PASSED_VOTES
        const proposalType = ProposalType.Grant
        const configuration = {
          title: 'Grant Title',
          abstract: 'Grant Abstract',
          category: NewGrantCategory.InWorldContent,
          tier: GrantTierType.LowerTier,
          size: 1000,
          beneficiary: 'Grant Beneficiary',
          description: 'Grant Description',
          budgetBreakdown: [],
          members: [],
          roadmap: 'Grant Roadmap',
          choices: DEFAULT_CHOICES,
          projectDuration: 6,
          email: 'a@a.org',
        }

        const proposal = getProposal({ proposalStatus, proposalType, configuration })
        const message = getUpdateMessage(proposal, votes)

        it('should return a message with the out of budget status and the results of the voting', () => {
          expect(message).not.toContain(TESTING_COMMITTEE_USER)
          // expect(message).not.toContain(get.passedDescription)
          expect(message).toContain(proposal.title)
          expect(message).toBe(
            'Test Proposal\n\n' +
              'This proposal is now in status: OUT OF BUDGET.\n\n' +
              'Voting Results:\n' +
              '* Yes 97% 115,182 VP (3 votes)\n' +
              '* No 3% 4,269 VP (1 votes)\n' +
              '* Abstain 0% 0 VP (0 votes)\n'
          )
        })
      })
    })

    describe('when the updated status is rejected', () => {
      const proposalStatus = ProposalStatus.Rejected
      const proposalType = ProposalType.Poll

      it('should return a message with the rejected status and the results of the voting', () => {
        const votes = REJECTED_VOTES
        const proposal = getProposal({ proposalType, proposalStatus })
        const message = getUpdateMessage(proposal, votes)

        expect(message).not.toContain(TESTING_COMMITTEE_USER)
        // expect(message).not.toContain(get.rejectedDescription)
        expect(message).toContain(proposal.title)
        expect(message).toBe(
          'Test Proposal\n\n' +
            'This proposal is now in status: REJECTED.\n' +
            '\n' +
            'Voting Results:\n' +
            '* Yes 3% 4,269 VP (1 votes)\n' +
            '* No 97% 115,182 VP (3 votes)\n' +
            '* Abstain 0% 0 VP (0 votes)\n'
        )
      })

      describe('when a POLL is rejected because the invalid options choice won', () => {
        const votes = { '0xcd15d83f42179b9a5b515eea0975f554444a9646': { choice: 3, vp: 500, timestamp: 1635863435 } }
        const configuration = {
          title: 'Poll title',
          description: 'Poll description',
          choices: ['Option 1', 'Option 2', INVALID_PROPOSAL_POLL_OPTIONS],
        }
        const proposal = getProposal({ proposalType, proposalStatus, configuration })
        const message = getUpdateMessage(proposal, votes)

        it('should return a message with the rejected status and the results of the voting', () => {
          expect(message).toBe(
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
        const votes = {}
        const configuration = {
          title: 'Poll title',
          description: 'Poll description',
          choices: ['Let’s change the protocol', 'There is no need to change it', INVALID_PROPOSAL_POLL_OPTIONS],
        }
        const proposal = getProposal({ proposalType, proposalStatus, configuration })
        const message = getUpdateMessage(proposal, votes)

        it('should return a message with the rejected status and the 0 results of the voting', () => {
          expect(message).toBe(
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
    const proposalType = ProposalType.Poll
    const user = TESTING_COMMITTEE_USER

    describe('when the updated status is enacted', () => {
      const enactedStatus = true
      const proposalStatus = ProposalStatus.Passed
      const enactedDescription = 'enacted description'

      it('should return a message with the enacting user address, the enacted status and the enacted description', () => {
        const proposal = getProposal({
          ...BASE_PROPOSAL,
          enactedStatus,
          proposalStatus,
          proposalType,
          user,
          enactedDescription,
        })
        const message = getUpdateMessage(proposal, PASSED_VOTES)
        expect(message).toContain(TESTING_COMMITTEE_USER)
        expect(message).toContain(enactedDescription)
        expect(message).toContain(proposal.title)
        expect(message).toBe(
          'Test Proposal\n\n' +
            'This proposal has been ENACTED by a DAO Committee Member (0xCommiteeUserAddress)\n\n' +
            'enacted description'
        )
      })

      describe('when the enacting description is null', () => {
        const enactedDescription = null
        const proposal = getProposal({
          ...BASE_PROPOSAL,
          enactedStatus,
          proposalStatus,
          proposalType,
          user,
          enactedDescription,
        })
        const message = getUpdateMessage(proposal, PASSED_VOTES)

        it('should not append anything to the original message', () => {
          expect(message).not.toContain('null')
          expect(message).toBe(
            'Test Proposal\n\n' + 'This proposal has been ENACTED by a DAO Committee Member (0xCommiteeUserAddress)\n\n'
          )
        })
      })

      describe('when the proposal is a grant with an enacting transaction', () => {
        const proposalType = ProposalType.Grant
        const enactingTransaction = '0xEnactingTransaction'
        const proposal = getProposal({
          ...BASE_PROPOSAL,
          enactedStatus,
          proposalStatus,
          proposalType,
          user,
          enactingTransaction,
          enactedDescription,
        })
        const message = getUpdateMessage(proposal, PASSED_VOTES)

        it('should return a message with the enacting transaction in etherscan', () => {
          expect(message).toContain(proposal.enacting_tx)
          expect(message).toBe(
            'Test Proposal\n\n' +
              'This proposal has been ENACTED by a DAO Committee Member (0xCommiteeUserAddress)\n\n' +
              'enacted description\n' +
              'Enacting Transaction: https://etherscan.io/tx/0xEnactingTransaction'
          )
        })
      })
    })

    describe('when the updated status is passed', () => {
      const passedDescription = 'passed description'
      const proposalStatus = ProposalStatus.Passed
      const proposal = getProposal({
        ...BASE_PROPOSAL,
        proposalStatus,
        proposalType,
        user,
        passedDescription,
      })
      const message = getUpdateMessage(proposal, PASSED_VOTES)

      it('should return a message with the DAO user address, the passed status and the passed description', () => {
        expect(message).toContain(TESTING_COMMITTEE_USER)
        expect(message).toContain(passedDescription)
        expect(message).toContain(proposal.title)
        expect(message).toBe(
          'Test Proposal\n\n' +
            'This proposal has been PASSED by a DAO Committee Member (0xCommiteeUserAddress)\n\n' +
            'passed description'
        )
      })

      describe('when the passed description is null', () => {
        const passedDescription = null
        const proposal = getProposal({
          ...BASE_PROPOSAL,
          proposalStatus,
          proposalType,
          user,
          passedDescription,
        })
        const message = getUpdateMessage(proposal, PASSED_VOTES)

        it('should not append anything to the original message', () => {
          expect(message).not.toContain('null')
          expect(message).toBe(
            'Test Proposal\n\n' + 'This proposal has been PASSED by a DAO Committee Member (0xCommiteeUserAddress)\n\n'
          )
        })
      })
    })

    describe('when the updated status is rejected', () => {
      const rejectedDescription = 'rejected description'
      const proposalStatus = ProposalStatus.Rejected
      const proposal = getProposal({
        ...BASE_PROPOSAL,
        proposalStatus,
        proposalType,
        user,
        rejectedDescription,
      })
      const message = getUpdateMessage(proposal, PASSED_VOTES)

      it('should return a message with the DAO user address, the rejected status and the rejected description', () => {
        expect(message).toContain(TESTING_COMMITTEE_USER)
        expect(message).toContain(rejectedDescription)
        expect(message).toContain(proposal.title)
        expect(message).toBe(
          'Test Proposal\n\n' +
            'This proposal has been REJECTED by a DAO Committee Member (0xCommiteeUserAddress)\n\n' +
            'rejected description'
        )
      })

      describe('when the passed description is null', () => {
        const rejectedDescription = null
        const proposalStatus = ProposalStatus.Rejected
        const proposal = getProposal({
          ...BASE_PROPOSAL,
          proposalStatus,
          proposalType,
          user,
          rejectedDescription,
        })
        const message = getUpdateMessage(proposal, PASSED_VOTES)

        it('should not append anything to the original message', () => {
          expect(message).not.toContain('null')
          expect(message).toBe(
            'Test Proposal\n\n' +
              'This proposal has been REJECTED by a DAO Committee Member (0xCommiteeUserAddress)\n\n'
          )
        })
      })
    })
  })
})
