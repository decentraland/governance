import { Vote } from '../../entities/Votes/types'

import { DelegationsLabelBuilder } from './helpers/DelegationsLabelBuilder'

import { getVotingSectionConfig } from './utils'
import {
  ACCOUNT_DELEGATE,
  CHOICES,
  CHOICE_1_VOTE,
  CHOICE_2_VOTE,
  DELEGATED_VOTING_POWER,
  DELEGATORS,
  DELEGATOR_1,
  DELEGATOR_2,
  OWN_VOTING_POWER,
  USER_ACCOUNT,
  VOTES_FROM_ALL_DELEGATORS,
  VOTES_WITH_DELEGATORS,
  VOTE_DIFFERENCE,
} from './utils.testData'

describe('getVotingSectionConfig', () => {
  let votes: Record<string, Vote> = {}
  let account = USER_ACCOUNT
  let delegate: string | null = null
  let delegateVote: Vote | null = null
  let delegators: string[] | null = null
  let partyVotes: Vote[] | null = null

  const ownVotingPower = OWN_VOTING_POWER
  const delegatedVotingPower = DELEGATED_VOTING_POWER
  const voteDifference = VOTE_DIFFERENCE

  beforeEach(() => {
    votes = {}
    delegate = null
    delegateVote = null
    delegators = []
    partyVotes = null
  })

  describe('when user has no delegate', () => {
    describe('when user has no delegators', () => {
      describe('when user has not voted', () => {
        it('should only show the choice buttons', () => {
          const config = getVotingSectionConfig(
            votes,
            CHOICES,
            delegate,
            delegators,
            account,
            ownVotingPower,
            delegatedVotingPower,
            voteDifference
          )
          expect(config.delegationsLabel).toBe(null)
          expect(config.showChoiceButtons).toBe(true)
          expect(config.votedChoice).toBe(null)
          expect(config.vote).toBe(null)
          expect(config.delegateVote).toBe(null)
        })
      })
      describe('when user voted', () => {
        beforeEach(() => {
          votes = { [USER_ACCOUNT]: CHOICE_1_VOTE }
        })
        it('should only show the voted choice', () => {
          const config = getVotingSectionConfig(
            votes,
            CHOICES,
            delegate,
            delegators,
            account,
            ownVotingPower,
            delegatedVotingPower,
            voteDifference
          )
          expect(config.delegationsLabel).toBe(null)
          expect(config.showChoiceButtons).toBe(false)
          expect(config.vote).toBe(CHOICE_1_VOTE)
          expect(config.delegateVote).toBe(null)
        })
        it('voted choice shows user vote', () => {
          const config = getVotingSectionConfig(
            votes,
            CHOICES,
            delegate,
            delegators,
            account,
            ownVotingPower,
            delegatedVotingPower,
            voteDifference
          )
          expect(config.votedChoice).toEqual({
            id: 'page.proposal_detail.voted_choice',
            values: { choice: CHOICES[CHOICE_1_VOTE.choice - 1] },
          })
        })
      })
    })
    describe('when user has delegators', () => {
      beforeEach(() => {
        delegators = DELEGATORS
      })
      describe('when user has not voted', () => {
        describe('when delegators have not voted', () => {
          it('should show the delegation label and the choices', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.showChoiceButtons).toBe(true)
            expect(config.votedChoice).toBe(null)
            expect(config.vote).toBe(null)
            expect(config.delegateVote).toBe(null)
          })

          it('delegations label should show how many accounts you are representing', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.delegationsLabel).toEqual({
              delegatorsLabel: {
                id: 'page.proposal_detail.delegators_represented',
                values: { total: DELEGATORS.length },
              },
              infoMessage: {
                id: 'page.proposal_detail.info.user_has_not_voted_no_delegate_all_delegators_have_not_voted',
              },
            })
          })
        })

        describe('when some delegators voted', () => {
          beforeEach(() => {
            votes = VOTES_WITH_DELEGATORS
          })
          it('should show the delegation label and the choices, with the total per choice', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.showChoiceButtons).toBe(true)
            expect(config.votedChoice).toBe(null)
            expect(config.vote).toBe(null)
            expect(config.delegateVote).toBe(null)
          })
          it('delegations label should show how many delegators voted', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.delegationsLabel).toEqual({
              delegatorsLabel: {
                id: 'page.proposal_detail.delegators_voted',
                values: {
                  votes: 3,
                  total: DELEGATORS.length,
                },
              },
              infoMessage: {
                id: 'page.proposal_detail.info.user_has_not_voted_no_delegate_some_delegators_voted',
                values: { delegators_without_vote: 1 },
              },
            })
          })
        })

        describe('when all delegators voted', () => {
          beforeEach(() => {
            votes = VOTES_FROM_ALL_DELEGATORS
          })
          it('delegations label should show how many delegators voted', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.delegationsLabel?.delegatorsLabel).toEqual({
              id: 'page.proposal_detail.all_delegators_voted',
              values: {
                votes: DELEGATORS.length,
                total: DELEGATORS.length,
              },
            })
          })
        })
      })
      describe('when user has voted', () => {
        describe('when delegators have not voted', () => {
          beforeEach(() => {
            votes = { [USER_ACCOUNT]: CHOICE_1_VOTE }
          })
          it('should show the delegation label and the voted choice', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.showChoiceButtons).toBe(false)
            expect(config.vote).toBe(CHOICE_1_VOTE)
            expect(config.delegateVote).toBe(null)
          })

          it('delegations label should show you voted on behalf of all delegators', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.delegationsLabel).toEqual({
              delegatorsLabel: {
                id: 'page.proposal_detail.user_voted_for_delegators',
                values: { amountRepresented: DELEGATORS.length },
              },
              infoMessage: {
                id: 'page.proposal_detail.info.user_voted_no_delegate_delegators_have_not_voted',
              },
            })
          })

          it('voted choice shows user vote and how many of the party voted the same', () => {
            // vote count equals delegators who voted that choice + delegators represented by user
            // total votes equals the amount of delegators
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.votedChoice).toEqual({
              id: 'page.proposal_detail.voted_choice',
              values: { choice: CHOICES[CHOICE_1_VOTE.choice - 1] },
              voteCount: DELEGATORS.length,
              totalVotes: DELEGATORS.length,
            })
          })
        })
        describe('when some delegators voted', () => {
          beforeEach(() => {
            votes = VOTES_WITH_DELEGATORS
            votes[USER_ACCOUNT] = CHOICE_1_VOTE
          })
          it('should show the delegation label and the voted choice', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.showChoiceButtons).toBe(false)
            expect(config.vote).toBe(CHOICE_1_VOTE)
            expect(config.delegateVote).toBe(null)
          })

          it('delegations label should show you voted on behalf of delegators who did not vote', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.delegationsLabel).toEqual({
              delegatorsLabel: {
                id: 'page.proposal_detail.user_voted_for_delegators',
                values: { amountRepresented: 1 },
              },
              infoMessage: {
                id: 'page.proposal_detail.info.user_voted_no_delegate_some_delegators_voted',
              },
            })
          })

          it('voted choice shows user vote and how many of the party voted the same', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.votedChoice).toEqual({
              id: 'page.proposal_detail.voted_choice',
              values: { choice: CHOICES[CHOICE_1_VOTE.choice - 1] },
              voteCount: 3, // 2 who voted + 1 represented by the user
              totalVotes: DELEGATORS.length,
            })
          })
        })
      })
    })
  })

  describe('when user has a delegate', () => {
    beforeEach(() => {
      delegate = ACCOUNT_DELEGATE
    })
    describe('when user has no delegators', () => {
      describe('when no one voted', () => {
        it('should show delegations label and choice buttons', () => {
          const config = getVotingSectionConfig(
            votes,
            CHOICES,
            delegate,
            delegators,
            account,
            ownVotingPower,
            delegatedVotingPower,
            voteDifference
          )
          expect(config.showChoiceButtons).toBe(true)
          expect(config.votedChoice).toBe(null)
          expect(config.vote).toBe(null)
          expect(config.delegateVote).toBe(null)
        })

        it('delegations label should show the delegate has not voted', () => {
          const config = getVotingSectionConfig(
            votes,
            CHOICES,
            delegate,
            delegators,
            account,
            ownVotingPower,
            delegatedVotingPower,
            voteDifference
          )
          expect(config.delegationsLabel).toEqual({
            delegateLabel: { id: 'page.proposal_detail.delegate_not_voted' },
            infoMessage: {
              id: 'page.proposal_detail.info.user_has_not_voted_delegate_has_not_voted_without_delegators',
              values: { delegate: ACCOUNT_DELEGATE },
            },
          })
        })
      })

      describe('when delegate voted and user has not voted', () => {
        beforeEach(() => {
          votes = { [ACCOUNT_DELEGATE]: CHOICE_1_VOTE }
        })
        it('should show delegations label and voted choice', () => {
          const config = getVotingSectionConfig(
            votes,
            CHOICES,
            delegate,
            delegators,
            account,
            ownVotingPower,
            delegatedVotingPower,
            voteDifference
          )
          expect(config.showChoiceButtons).toBe(false)
          expect(config.vote).toBe(null)
          expect(config.delegateVote).toBe(CHOICE_1_VOTE)
        })

        it('delegations label should show when the delegate voted', () => {
          const config = getVotingSectionConfig(
            votes,
            CHOICES,
            delegate,
            delegators,
            account,
            ownVotingPower,
            delegatedVotingPower,
            voteDifference
          )
          expect(config.delegationsLabel).toEqual({
            delegateLabel: {
              id: 'page.proposal_detail.delegate_voted',
              values: { date: DelegationsLabelBuilder.dateFormat(CHOICE_1_VOTE.timestamp) },
            },
            infoMessage: {
              id: 'page.proposal_detail.info.user_has_not_voted_delegate_voted_without_delegators',
              values: {
                delegate: ACCOUNT_DELEGATE,
                own_vp: ownVotingPower,
              },
            },
          })
        })

        it('voted choice shows delegate vote but does not display avatar', () => {
          const config = getVotingSectionConfig(
            votes,
            CHOICES,
            delegate,
            delegators,
            account,
            ownVotingPower,
            delegatedVotingPower,
            voteDifference
          )
          expect(config.votedChoice).toEqual({
            id: 'page.proposal_detail.delegate_voted_choice',
            values: { choice: CHOICES[CHOICE_1_VOTE.choice - 1] },
          })
        })
      })

      describe('when user voted and delegate has not voted', () => {
        beforeEach(() => {
          votes = { [USER_ACCOUNT]: CHOICE_1_VOTE }
        })
        it('should show delegations label and voted choice', () => {
          const config = getVotingSectionConfig(
            votes,
            CHOICES,
            delegate,
            delegators,
            account,
            ownVotingPower,
            delegatedVotingPower,
            voteDifference
          )
          expect(config.showChoiceButtons).toBe(false)
          expect(config.vote).toBe(CHOICE_1_VOTE)
          expect(config.delegateVote).toBe(null)
        })

        it('delegations label should show the delegate still has not voted', () => {
          const config = getVotingSectionConfig(
            votes,
            CHOICES,
            delegate,
            delegators,
            account,
            ownVotingPower,
            delegatedVotingPower,
            voteDifference
          )
          expect(config.delegationsLabel).toEqual({
            delegateLabel: { id: 'page.proposal_detail.delegate_not_voted' },
            infoMessage: {
              id: 'page.proposal_detail.info.user_voted_delegate_has_not_voted_without_delegators',
              values: { delegate: ACCOUNT_DELEGATE },
            },
          })
        })

        it('voted choice shows user vote', () => {
          const config = getVotingSectionConfig(
            votes,
            CHOICES,
            delegate,
            delegators,
            account,
            ownVotingPower,
            delegatedVotingPower,
            voteDifference
          )
          expect(config.votedChoice).toEqual({
            id: 'page.proposal_detail.voted_choice',
            values: { choice: CHOICES[CHOICE_1_VOTE.choice - 1] },
          })
        })
      })

      describe('when user and delegate voted', () => {
        describe('if they voted the same', () => {
          beforeEach(() => {
            votes = { [USER_ACCOUNT]: CHOICE_1_VOTE, [ACCOUNT_DELEGATE]: CHOICE_1_VOTE }
          })
          it('should show delegations label and voted choice', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.showChoiceButtons).toBe(false)
            expect(config.vote).toBe(CHOICE_1_VOTE)
            expect(config.delegateVote).toBe(CHOICE_1_VOTE)
          })

          it('delegations label should show when the delegate voted', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.delegationsLabel).toEqual({
              delegateLabel: {
                id: 'page.proposal_detail.delegate_voted',
                values: { date: DelegationsLabelBuilder.dateFormat(CHOICE_1_VOTE.timestamp) },
              },
              infoMessage: {
                id: 'page.proposal_detail.info.user_voted_delegate_voted_the_same_without_delegators',
                values: { delegate: ACCOUNT_DELEGATE },
              },
            })
          })

          it('voted choice shows both voted the same but does not display avatar', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.votedChoice).toEqual({
              id: 'page.proposal_detail.both_voted_choice',
              values: { choice: CHOICES[CHOICE_1_VOTE.choice - 1] },
            })
          })
        })

        describe('if they voted differently', () => {
          beforeEach(() => {
            votes = { [USER_ACCOUNT]: CHOICE_1_VOTE, [ACCOUNT_DELEGATE]: CHOICE_2_VOTE }
          })
          it('should show delegations label and voted choice', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.showChoiceButtons).toBe(false)
            expect(config.vote).toBe(CHOICE_1_VOTE)
            expect(config.delegateVote).toBe(CHOICE_2_VOTE)
          })

          it('delegations label should say the delegate voted differently', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.delegationsLabel).toEqual({
              delegateLabel: { id: 'page.proposal_detail.delegate_voted_differently' },
              infoMessage: {
                id: 'page.proposal_detail.info.user_voted_delegate_voted_differently_without_delegators',
                values: {
                  delegate: ACCOUNT_DELEGATE,
                  vote_difference: voteDifference,
                },
              },
            })
          })

          it('voted choice shows user vote', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.votedChoice).toEqual({
              id: 'page.proposal_detail.voted_choice',
              values: { choice: CHOICES[CHOICE_1_VOTE.choice - 1] },
            })
          })
        })
      })
    })

    describe('when user has delegators', () => {
      beforeEach(() => {
        delegators = DELEGATORS
      })
      describe('when no one voted', () => {
        it('should show delegations label and choice buttons', () => {
          const config = getVotingSectionConfig(
            votes,
            CHOICES,
            delegate,
            delegators,
            account,
            ownVotingPower,
            delegatedVotingPower,
            voteDifference
          )
          expect(config.showChoiceButtons).toBe(true)
          expect(config.votedChoice).toBe(null)
          expect(config.vote).toBe(null)
          expect(config.delegateVote).toBe(null)
        })

        it('delegations label should show your delegate has not voted and delegators represented', () => {
          const config = getVotingSectionConfig(
            votes,
            CHOICES,
            delegate,
            delegators,
            account,
            ownVotingPower,
            delegatedVotingPower,
            voteDifference
          )
          expect(config.delegationsLabel).toEqual({
            delegateLabel: { id: 'page.proposal_detail.delegate_not_voted' },
            delegatorsLabel: {
              id: 'page.proposal_detail.delegators_represented',
              values: { total: DELEGATORS.length },
            },
            infoMessage: {
              id: 'page.proposal_detail.info.user_has_not_voted_delegate_has_not_voted_delegators_have_not_voted',
              values: {
                own_vp: ownVotingPower,
                delegate: ACCOUNT_DELEGATE,
                total_delegators: 4,
                delegated_vp: delegatedVotingPower,
              },
            },
          })
        })
      })

      describe('when delegate voted and user has not voted', () => {
        beforeEach(() => {
          votes = { [ACCOUNT_DELEGATE]: CHOICE_1_VOTE }
        })
        describe('when no delegator voted', () => {
          it('should show delegations label choice buttons', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.showChoiceButtons).toBe(true)
            expect(config.vote).toBe(null)
            expect(config.delegateVote).toBe(CHOICE_1_VOTE)
          })

          it('delegations label should show when the delegate voted and represented delegators', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.delegationsLabel).toEqual({
              delegateLabel: {
                id: 'page.proposal_detail.delegate_voted',
                values: { date: DelegationsLabelBuilder.dateFormat(CHOICE_1_VOTE.timestamp) },
              },
              delegatorsLabel: {
                id: 'page.proposal_detail.delegators_represented',
                values: { total: DELEGATORS.length },
              },
              infoMessage: {
                id: 'page.proposal_detail.info.user_has_not_voted_delegate_voted_delegators_have_not_voted',
                values: {
                  own_vp: ownVotingPower,
                  delegate: ACCOUNT_DELEGATE,
                  total_delegators: 4,
                  delegated_vp: delegatedVotingPower,
                },
              },
            })
          })
        })

        describe('when some delegators voted', () => {
          beforeEach(() => {
            votes = { [ACCOUNT_DELEGATE]: CHOICE_1_VOTE, [DELEGATOR_1]: CHOICE_1_VOTE, [DELEGATOR_2]: CHOICE_2_VOTE }
          })
          it('should show delegations label and choice buttons', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.showChoiceButtons).toBe(true)
            expect(config.vote).toBe(null)
            expect(config.delegateVote).toBe(CHOICE_1_VOTE)
          })

          it('delegations label should show when the delegate voted and the party votes', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.delegationsLabel).toEqual({
              delegateLabel: {
                id: 'page.proposal_detail.delegate_voted',
                values: { date: DelegationsLabelBuilder.dateFormat(CHOICE_1_VOTE.timestamp) },
              },
              delegatorsLabel: {
                id: 'page.proposal_detail.delegators_voted',
                values: {
                  votes: 2,
                  total: DELEGATORS.length,
                },
              },
              infoMessage: {
                id: 'page.proposal_detail.info.user_has_not_voted_delegate_voted_some_delegators_voted',
                values: {
                  delegate: ACCOUNT_DELEGATE,
                  own_vp: ownVotingPower,
                  delegators_that_voted: 2,
                  delegators_without_vote: 2,
                  total_delegators: DELEGATORS.length,
                },
              },
            })
          })
        })

        describe('when all delegators voted', () => {
          beforeEach(() => {
            votes = { [ACCOUNT_DELEGATE]: CHOICE_1_VOTE, ...VOTES_FROM_ALL_DELEGATORS }
          })

          it('delegations label should show when the delegate voted and the party votes', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.delegationsLabel).toEqual({
              delegateLabel: {
                id: 'page.proposal_detail.delegate_voted',
                values: { date: DelegationsLabelBuilder.dateFormat(CHOICE_1_VOTE.timestamp) },
              },
              delegatorsLabel: {
                id: 'page.proposal_detail.all_delegators_voted',
                values: {
                  votes: DELEGATORS.length,
                  total: DELEGATORS.length,
                },
              },
              infoMessage: {
                id: 'page.proposal_detail.info.user_has_not_voted_delegate_voted_all_delegators_voted',
                values: {
                  delegate: ACCOUNT_DELEGATE,
                  own_vp: ownVotingPower,
                },
              },
            })
          })
        })
      })

      describe('when user voted and delegate has not voted', () => {
        beforeEach(() => {
          votes = { [USER_ACCOUNT]: CHOICE_1_VOTE }
        })

        describe('when no delegators voted', () => {
          it('should show delegations label and voted choice', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.showChoiceButtons).toBe(false)
            expect(config.vote).toBe(CHOICE_1_VOTE)
            expect(config.delegateVote).toBe(null)
          })

          it('delegations label should show the delegate still has not voted and how many delegators you voted for', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.delegationsLabel).toEqual({
              delegateLabel: { id: 'page.proposal_detail.delegate_not_voted' },
              delegatorsLabel: {
                id: 'page.proposal_detail.user_voted_for_delegators',
                values: { amountRepresented: DELEGATORS.length },
              },
              infoMessage: {
                id: 'page.proposal_detail.info.user_voted_delegate_has_not_voted_delegators_have_not_voted',
                values: {
                  total_delegators: DELEGATORS.length,
                  delegate: ACCOUNT_DELEGATE,
                },
              },
            })
          })

          it('voted choice shows user vote and represented delegators', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.votedChoice).toEqual({
              id: 'page.proposal_detail.voted_choice',
              values: { choice: CHOICES[CHOICE_1_VOTE.choice - 1] },
              voteCount: DELEGATORS.length,
              totalVotes: DELEGATORS.length,
            })
          })
        })

        describe('when some delegators voted', () => {
          beforeEach(() => {
            votes = { [USER_ACCOUNT]: CHOICE_1_VOTE, [DELEGATOR_1]: CHOICE_1_VOTE, [DELEGATOR_2]: CHOICE_2_VOTE }
          })
          it('should show delegations label and voted choice', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.showChoiceButtons).toBe(false)
            expect(config.vote).toBe(CHOICE_1_VOTE)
            expect(config.delegateVote).toBe(null)
          })

          it('voted choice shows user vote and delegators votes and votes represented by user plus delegator votes', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.votedChoice).toEqual({
              id: 'page.proposal_detail.voted_choice',
              values: { choice: CHOICES[CHOICE_1_VOTE.choice - 1] },
              voteCount: 3, // delegator 1 + delegator 3 & 4
              totalVotes: DELEGATORS.length,
            })
          })

          it('delegations label should show the delegate has not voted and how many delegators you voted for', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.delegationsLabel).toEqual({
              delegateLabel: { id: 'page.proposal_detail.delegate_not_voted' },
              delegatorsLabel: {
                id: 'page.proposal_detail.user_voted_for_delegators',
                values: { amountRepresented: 2 }, // delegator 3 & 4
              },
              infoMessage: {
                id: 'page.proposal_detail.info.user_voted_delegate_has_not_voted_some_delegators_voted',
                values: {
                  delegators_without_vote: 2,
                  total_delegators: DELEGATORS.length,
                  delegated_vp: delegatedVotingPower,
                  delegate: ACCOUNT_DELEGATE,
                  delegators_info_id: 'many_delegators',
                },
              },
            })
          })
        })

        describe('when all delegators voted', () => {
          beforeEach(() => {
            votes = { [USER_ACCOUNT]: CHOICE_1_VOTE, ...VOTES_FROM_ALL_DELEGATORS }
          })

          it('should show delegations label and voted choice', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.showChoiceButtons).toBe(false)
            expect(config.vote).toBe(CHOICE_1_VOTE)
            expect(config.delegateVote).toBe(null)
          })

          it('voted choice shows user vote and delegators votes and votes represented by user plus delegator votes', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.votedChoice).toEqual({
              id: 'page.proposal_detail.voted_choice',
              values: { choice: CHOICES[CHOICE_1_VOTE.choice - 1] },
              voteCount: 3, // all delegators who voted yes
              totalVotes: DELEGATORS.length,
            })
          })

          it('delegations label should show the delegate has not voted and how many delegators you voted for', () => {
            const config = getVotingSectionConfig(
              votes,
              CHOICES,
              delegate,
              delegators,
              account,
              ownVotingPower,
              delegatedVotingPower,
              voteDifference
            )
            expect(config.delegationsLabel).toEqual({
              delegateLabel: { id: 'page.proposal_detail.delegate_not_voted' },
              delegatorsLabel: {
                id: 'page.proposal_detail.all_delegators_voted',
                values: {
                  amountRepresented: 0,
                },
              },
              infoMessage: {
                id: 'page.proposal_detail.info.user_voted_delegate_has_not_voted_all_delegators_voted',
                values: {
                  delegate: ACCOUNT_DELEGATE,
                },
              },
            })
          })
        })
      })

      describe('when user and delegate voted', () => {
        describe('when no delegators voted', () => {
          describe('if user and delegate voted the same', () => {
            beforeEach(() => {
              votes = { [USER_ACCOUNT]: CHOICE_1_VOTE, [ACCOUNT_DELEGATE]: CHOICE_1_VOTE }
            })
            it('delegations label should show when the delegate voted and and how many delegators you voted for', () => {
              const config = getVotingSectionConfig(
                votes,
                CHOICES,
                delegate,
                delegators,
                account,
                ownVotingPower,
                delegatedVotingPower,
                voteDifference
              )
              expect(config.delegationsLabel).toEqual({
                delegateLabel: {
                  id: 'page.proposal_detail.delegate_voted',
                  values: { date: DelegationsLabelBuilder.dateFormat(CHOICE_1_VOTE.timestamp) },
                },
                delegatorsLabel: {
                  id: 'page.proposal_detail.user_voted_for_delegators',
                  values: { amountRepresented: DELEGATORS.length },
                },
                infoMessage: {
                  id: 'page.proposal_detail.info.user_voted_delegate_voted_the_same_with_delegators',
                  values: {
                    delegators_without_vote: DELEGATORS.length,
                    total_delegators: DELEGATORS.length,
                    delegate: ACCOUNT_DELEGATE,
                    delegators_info_id: 'many_delegators',
                  },
                },
              })
            })
          })
          describe('if user and delegate voted differently', () => {
            beforeEach(() => {
              votes = { [USER_ACCOUNT]: CHOICE_1_VOTE, [ACCOUNT_DELEGATE]: CHOICE_2_VOTE }
            })
            it('should show delegations label and voted choice', () => {
              const config = getVotingSectionConfig(
                votes,
                CHOICES,
                delegate,
                delegators,
                account,
                ownVotingPower,
                delegatedVotingPower,
                voteDifference
              )
              expect(config.showChoiceButtons).toBe(false)
              expect(config.vote).toBe(CHOICE_1_VOTE)
              expect(config.delegateVote).toBe(CHOICE_2_VOTE)
            })

            it('delegations label should show when the delegate voted and how many delegators you voted for', () => {
              const config = getVotingSectionConfig(
                votes,
                CHOICES,
                delegate,
                delegators,
                account,
                ownVotingPower,
                delegatedVotingPower,
                voteDifference
              )
              expect(config.delegationsLabel).toEqual({
                delegateLabel: {
                  id: 'page.proposal_detail.delegate_voted',
                  values: { date: DelegationsLabelBuilder.dateFormat(CHOICE_2_VOTE.timestamp) },
                },
                delegatorsLabel: {
                  id: 'page.proposal_detail.user_voted_for_delegators',
                  values: { amountRepresented: DELEGATORS.length },
                },
                infoMessage: {
                  id: 'page.proposal_detail.info.user_voted_delegate_voted_differently_with_delegators',
                  values: {
                    delegators_without_vote: DELEGATORS.length,
                    total_delegators: DELEGATORS.length,
                    delegate: ACCOUNT_DELEGATE,
                    vote_difference: voteDifference,
                    delegators_info_id: 'many_delegators',
                  },
                },
              })
            })

            it('voted choice shows user vote and votes represented by user plus delegator votes', () => {
              const config = getVotingSectionConfig(
                votes,
                CHOICES,
                delegate,
                delegators,
                account,
                ownVotingPower,
                delegatedVotingPower,
                voteDifference
              )
              expect(config.votedChoice).toEqual({
                id: 'page.proposal_detail.voted_choice',
                values: { choice: CHOICES[CHOICE_1_VOTE.choice - 1] },
                voteCount: DELEGATORS.length,
                totalVotes: DELEGATORS.length,
              })
            })
          })
        })

        describe('when some delegators voted', () => {
          describe('if user and delegate voted the same', () => {
            beforeEach(() => {
              votes = {
                ...VOTES_WITH_DELEGATORS,
                ...{ [USER_ACCOUNT]: CHOICE_1_VOTE, [ACCOUNT_DELEGATE]: CHOICE_1_VOTE },
              }
            })
            it('should show delegations label and voted choice', () => {
              const config = getVotingSectionConfig(
                votes,
                CHOICES,
                delegate,
                delegators,
                account,
                ownVotingPower,
                delegatedVotingPower,
                voteDifference
              )
              expect(config.showChoiceButtons).toBe(false)
              expect(config.vote).toBe(CHOICE_1_VOTE)
              expect(config.delegateVote).toBe(CHOICE_1_VOTE)
            })

            it('delegations label should show when the delegate voted and and how many delegators you voted for', () => {
              const config = getVotingSectionConfig(
                votes,
                CHOICES,
                delegate,
                delegators,
                account,
                ownVotingPower,
                delegatedVotingPower,
                voteDifference
              )
              expect(config.delegationsLabel).toEqual({
                delegateLabel: {
                  id: 'page.proposal_detail.delegate_voted',
                  values: { date: DelegationsLabelBuilder.dateFormat(CHOICE_1_VOTE.timestamp) },
                },
                delegatorsLabel: {
                  id: 'page.proposal_detail.user_voted_for_delegators',
                  values: { amountRepresented: 1 }, // delegator 4
                },
                infoMessage: {
                  id: 'page.proposal_detail.info.user_voted_delegate_voted_the_same_with_delegators',
                  values: {
                    delegators_without_vote: 1,
                    total_delegators: DELEGATORS.length,
                    delegate: ACCOUNT_DELEGATE,
                    delegators_info_id: 'many_delegators',
                  },
                },
              })
            })

            it('voted choice shows delegator vote, and votes represented by user plus delegator votes', () => {
              const config = getVotingSectionConfig(
                votes,
                CHOICES,
                delegate,
                delegators,
                account,
                ownVotingPower,
                delegatedVotingPower,
                voteDifference
              )
              expect(config.votedChoice).toEqual({
                id: 'page.proposal_detail.voted_choice',
                values: { choice: CHOICES[CHOICE_1_VOTE.choice - 1] },
                delegate: ACCOUNT_DELEGATE,
                voteCount: 3,
                totalVotes: DELEGATORS.length,
              })
            })
          })
          describe('if user and delegate voted differently', () => {
            beforeEach(() => {
              votes = {
                ...VOTES_WITH_DELEGATORS,
                ...{ [USER_ACCOUNT]: CHOICE_1_VOTE, [ACCOUNT_DELEGATE]: CHOICE_2_VOTE },
              }
            })
            it('should show delegations label and voted choice', () => {
              const config = getVotingSectionConfig(
                votes,
                CHOICES,
                delegate,
                delegators,
                account,
                ownVotingPower,
                delegatedVotingPower,
                voteDifference
              )
              expect(config.showChoiceButtons).toBe(false)
              expect(config.vote).toBe(CHOICE_1_VOTE)
              expect(config.delegateVote).toBe(CHOICE_2_VOTE)
            })

            it('delegations label should show when the delegate voted and and how many delegators you voted for', () => {
              const config = getVotingSectionConfig(
                votes,
                CHOICES,
                delegate,
                delegators,
                account,
                ownVotingPower,
                delegatedVotingPower,
                voteDifference
              )
              expect(config.delegationsLabel).toEqual({
                delegateLabel: {
                  id: 'page.proposal_detail.delegate_voted',
                  values: { date: DelegationsLabelBuilder.dateFormat(CHOICE_2_VOTE.timestamp) },
                },
                delegatorsLabel: {
                  id: 'page.proposal_detail.user_voted_for_delegators',
                  values: { amountRepresented: 1 }, // delegator 4
                },
                infoMessage: {
                  id: 'page.proposal_detail.info.user_voted_delegate_voted_differently_with_delegators',
                  values: {
                    delegators_without_vote: 1,
                    total_delegators: DELEGATORS.length,
                    delegate: ACCOUNT_DELEGATE,
                    vote_difference: voteDifference,
                    delegators_info_id: 'many_delegators',
                  },
                },
              })
            })

            it('voted choice only shows votes represented by user plus delegator votes', () => {
              const config = getVotingSectionConfig(
                votes,
                CHOICES,
                delegate,
                delegators,
                account,
                ownVotingPower,
                delegatedVotingPower,
                voteDifference
              )
              expect(config.votedChoice).toEqual({
                id: 'page.proposal_detail.voted_choice',
                values: { choice: CHOICES[CHOICE_1_VOTE.choice - 1] },
                voteCount: 3,
                totalVotes: DELEGATORS.length,
              })
            })
          })
        })
      })
    })

    describe('when user has only one delegator', () => {
      beforeEach(() => {
        delegators = [DELEGATOR_1]
      })
      describe('when user and delegate voted', () => {
        describe('when no delegators voted', () => {
          describe('if user and delegate voted the same', () => {
            beforeEach(() => {
              votes = { [USER_ACCOUNT]: CHOICE_1_VOTE, [ACCOUNT_DELEGATE]: CHOICE_1_VOTE }
            })
            it('delegations label should show when the delegate voted and and how many delegators you voted for', () => {
              const config = getVotingSectionConfig(
                votes,
                CHOICES,
                delegate,
                delegators,
                account,
                ownVotingPower,
                delegatedVotingPower,
                voteDifference
              )
              expect(config.delegationsLabel?.infoMessage).toEqual({
                id: 'page.proposal_detail.info.user_voted_delegate_voted_the_same_with_delegators',
                values: {
                  delegators_without_vote: 1,
                  total_delegators: 1,
                  delegate: ACCOUNT_DELEGATE,
                  delegators_info_id: 'single_delegator',
                },
              })
            })
          })
        })
      })
    })
  })
})
