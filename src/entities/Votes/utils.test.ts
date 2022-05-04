import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Vote } from './types'
import { calculateResult, calculateResultWinner, getVotingSectionConfig } from './utils'
import {
  YES_NO_CHOICES,
  VOTES_RESULTS,
  USER_ACCOUNT,
  ACCOUNT_DELEGATE,
  CHOICES,
  DELEGATORS,
  VOTES_WITH_DELEGATORS,
  CHOICE_1_VOTE,
  CHOICE_2_VOTE,
  DELEGATOR_1,
  DELEGATOR_2,
} from './utils.testData'

describe('entities/Votes/utils', () => {
  test('calculateResult', () => {
    expect(calculateResult(YES_NO_CHOICES, VOTES_RESULTS)).toEqual([
      {
        choice: 'yes',
        power: 4322367,
        votes: 21,
        color: 'approve',
        progress: 68,
      },
      {
        choice: 'no',
        power: 2065731,
        votes: 75,
        color: 'reject',
        progress: 32,
      },
    ])
  })

  test('calculateResultWinner', () => {
    expect(calculateResultWinner(YES_NO_CHOICES, VOTES_RESULTS)).toEqual({
      choice: 'yes',
      power: 4322367,
      votes: 21,
      color: 'approve',
      progress: 68,
    })
  })
})

describe('getVotingSectionConfig', () => {
  let votes: Record<string, Vote> = {}
  let account = USER_ACCOUNT
  let delegate: string | null = null
  let delegateVote: Vote | null = null
  let delegators: string[] | null = null
  let partyVotes: Vote[] | null = null

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
          const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
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
          const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
          expect(config.delegationsLabel).toBe(null)
          expect(config.showChoiceButtons).toBe(false)
          expect(config.vote).toBe(CHOICE_1_VOTE)
          expect(config.delegateVote).toBe(null)
        })
        it('voted choice shows user vote', () => {
          const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
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
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.showChoiceButtons).toBe(true)
            expect(config.votedChoice).toBe(null)
            expect(config.vote).toBe(null)
            expect(config.delegateVote).toBe(null)
          })

          it('delegations label should show how many accounts you are representing', () => {
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.delegationsLabel).toEqual({
              delegatorsLabel: {
                id: 'page.proposal_detail.delegators_represented',
                values: { total: DELEGATORS.length },
              },
            })
          })
        })

        describe('when some delegators voted', () => {
          beforeEach(() => {
            votes = VOTES_WITH_DELEGATORS
          })
          it('should show the delegation label and the choices, with the total per choice', () => {
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.showChoiceButtons).toBe(true)
            expect(config.votedChoice).toBe(null)
            expect(config.vote).toBe(null)
            expect(config.delegateVote).toBe(null)
          })
          it('delegations label should show how many delegators voted', () => {
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.delegationsLabel).toEqual({
              delegatorsLabel: {
                id: 'page.proposal_detail.delegators_voted',
                values: {
                  votes: 3,
                  total: DELEGATORS.length,
                },
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
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.showChoiceButtons).toBe(false)
            expect(config.vote).toBe(CHOICE_1_VOTE)
            expect(config.delegateVote).toBe(null)
          })

          it('delegations label should show you voted on behalf of all delegators', () => {
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.delegationsLabel).toEqual({
              delegatorsLabel: {
                id: 'page.proposal_detail.user_voted_for_delegators',
                values: { amountRepresented: DELEGATORS.length },
              },
            })
          })

          it('voted choice shows user vote and how many of the party voted the same', () => {
            // vote count equals delegators who voted that choice + delegators represented by user
            // total votes equals the amount of delegators
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
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
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.showChoiceButtons).toBe(false)
            expect(config.vote).toBe(CHOICE_1_VOTE)
            expect(config.delegateVote).toBe(null)
          })

          it('delegations label should show you voted on behalf of delegators who did not vote', () => {
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.delegationsLabel).toEqual({
              delegatorsLabel: {
                id: 'page.proposal_detail.user_voted_for_delegators',
                values: { amountRepresented: 1 },
              },
            })
          })

          it('voted choice shows user vote and how many of the party voted the same', () => {
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
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
          const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
          expect(config.showChoiceButtons).toBe(true)
          expect(config.votedChoice).toBe(null)
          expect(config.vote).toBe(null)
          expect(config.delegateVote).toBe(null)
        })

        it('delegations label should show the delegate has not voted', () => {
          const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
          expect(config.delegationsLabel).toEqual({
            delegateLabel: { id: 'page.proposal_detail.delegate_not_voted' },
          })
        })
      })

      describe('when delegate voted and user has not voted', () => {
        beforeEach(() => {
          votes = { [ACCOUNT_DELEGATE]: CHOICE_1_VOTE }
        })
        it('should show delegations label and voted choice', () => {
          const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
          expect(config.showChoiceButtons).toBe(false)
          expect(config.vote).toBe(null)
          expect(config.delegateVote).toBe(CHOICE_1_VOTE)
        })

        it('delegations label should show when the delegate voted', () => {
          const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
          expect(config.delegationsLabel).toEqual({
            delegateLabel: {
              id: 'page.proposal_detail.delegate_voted',
              values: { date: Time.from(CHOICE_1_VOTE.timestamp).fromNow() },
            },
          })
        })

        it('voted choice shows delegate vote but does not display avatar', () => {
          const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
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
          const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
          expect(config.showChoiceButtons).toBe(false)
          expect(config.vote).toBe(CHOICE_1_VOTE)
          expect(config.delegateVote).toBe(null)
        })

        it('delegations label should show the delegate still has not voted', () => {
          const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
          expect(config.delegationsLabel).toEqual({
            delegateLabel: { id: 'page.proposal_detail.delegate_not_voted' },
          })
        })

        it('voted choice shows user vote', () => {
          const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
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
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.showChoiceButtons).toBe(false)
            expect(config.vote).toBe(CHOICE_1_VOTE)
            expect(config.delegateVote).toBe(CHOICE_1_VOTE)
          })

          it('delegations label should show when the delegate voted', () => {
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.delegationsLabel).toEqual({
              delegateLabel: {
                id: 'page.proposal_detail.delegate_voted',
                values: { date: Time.from(CHOICE_1_VOTE.timestamp).fromNow() },
              },
            })
          })

          it('voted choice shows both voted the same but does not display avatar', () => {
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
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
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.showChoiceButtons).toBe(false)
            expect(config.vote).toBe(CHOICE_1_VOTE)
            expect(config.delegateVote).toBe(CHOICE_2_VOTE)
          })

          it('delegations label should say the delegate voted differently', () => {
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.delegationsLabel).toEqual({
              delegateLabel: { id: 'page.proposal_detail.delegate_voted_differently' },
            })
          })

          it('voted choice shows user vote', () => {
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
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
          const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
          expect(config.showChoiceButtons).toBe(true)
          expect(config.votedChoice).toBe(null)
          expect(config.vote).toBe(null)
          expect(config.delegateVote).toBe(null)
        })

        it('delegations label should show your delegate has not voted and delegators represented', () => {
          const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
          expect(config.delegationsLabel).toEqual({
            delegateLabel: { id: 'page.proposal_detail.delegate_not_voted' },
            delegatorsLabel: {
              id: 'page.proposal_detail.delegators_represented',
              values: { total: DELEGATORS.length },
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
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.showChoiceButtons).toBe(true)
            expect(config.vote).toBe(null)
            expect(config.delegateVote).toBe(CHOICE_1_VOTE)
          })

          it('delegations label should show when the delegate voted and represented delegators', () => {
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.delegationsLabel).toEqual({
              delegateLabel: {
                id: 'page.proposal_detail.delegate_voted',
                values: { date: Time.from(CHOICE_1_VOTE.timestamp).fromNow() },
              },
              delegatorsLabel: {
                id: 'page.proposal_detail.delegators_represented',
                values: { total: DELEGATORS.length },
              },
            })
          })
        })

        describe('when some delegators voted', () => {
          beforeEach(() => {
            votes = { [ACCOUNT_DELEGATE]: CHOICE_1_VOTE, [DELEGATOR_1]: CHOICE_1_VOTE, [DELEGATOR_2]: CHOICE_2_VOTE }
          })
          it('should show delegations label and choice buttons', () => {
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.showChoiceButtons).toBe(true)
            expect(config.vote).toBe(null)
            expect(config.delegateVote).toBe(CHOICE_1_VOTE)
          })

          it('delegations label should show when the delegate voted and the party votes', () => {
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.delegationsLabel).toEqual({
              delegateLabel: {
                id: 'page.proposal_detail.delegate_voted',
                values: { date: Time.from(CHOICE_1_VOTE.timestamp).fromNow() },
              },
              delegatorsLabel: {
                id: 'page.proposal_detail.delegators_voted',
                values: {
                  votes: 2,
                  total: DELEGATORS.length,
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
          const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
          expect(config.showChoiceButtons).toBe(false)
          expect(config.vote).toBe(CHOICE_1_VOTE)
          expect(config.delegateVote).toBe(null)
        })

        it('delegations label should show the delegate still has not voted and how many delegators you voted for', () => {
          const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
          expect(config.delegationsLabel).toEqual({
            delegateLabel: { id: 'page.proposal_detail.delegate_not_voted' },
            delegatorsLabel: {
              id: 'page.proposal_detail.user_voted_for_delegators',
              values: { amountRepresented: DELEGATORS.length },
            },
          })
        })

        it('voted choice shows user vote and represented delegators', () => {
          const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
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
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.showChoiceButtons).toBe(false)
            expect(config.vote).toBe(CHOICE_1_VOTE)
            expect(config.delegateVote).toBe(null)
          })

          it('voted choice shows user vote and delegators votes and votes represented by user plus delegator votes', () => {
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.votedChoice).toEqual({
              id: 'page.proposal_detail.voted_choice',
              values: { choice: CHOICES[CHOICE_1_VOTE.choice - 1] },
              voteCount: 3, // delegator 1 + delegator 3 & 4
              totalVotes: DELEGATORS.length,
            })
          })

          it('delegations label should show the delegate has not and how many delegators you voted for', () => {
            const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
            expect(config.delegationsLabel).toEqual({
              delegateLabel: { id: 'page.proposal_detail.delegate_not_voted' },
              delegatorsLabel: {
                id: 'page.proposal_detail.user_voted_for_delegators',
                values: { amountRepresented: 2 }, // delegator 3 & 4
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
            it('should show delegations label and voted choice', () => {
              const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
              expect(config.showChoiceButtons).toBe(false)
              expect(config.vote).toBe(CHOICE_1_VOTE)
              expect(config.delegateVote).toBe(CHOICE_1_VOTE)
            })

            it('delegations label should show when the delegate voted and and how many delegators you voted for', () => {
              const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
              expect(config.delegationsLabel).toEqual({
                delegateLabel: {
                  id: 'page.proposal_detail.delegate_voted',
                  values: { date: Time.from(CHOICE_1_VOTE.timestamp).fromNow() },
                },
                delegatorsLabel: {
                  id: 'page.proposal_detail.user_voted_for_delegators',
                  values: { amountRepresented: DELEGATORS.length },
                },
              })
            })

            it('voted choice shows both voted the same, and votes represented by user plus delegator votes', () => {
              const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
              expect(config.votedChoice).toEqual({
                id: 'page.proposal_detail.voted_choice',
                values: { choice: CHOICES[CHOICE_1_VOTE.choice - 1] },
                delegate: ACCOUNT_DELEGATE,
                voteCount: DELEGATORS.length,
                totalVotes: DELEGATORS.length,
              })
            })
          })
          describe('if user and delegate voted differently', () => {
            beforeEach(() => {
              votes = { [USER_ACCOUNT]: CHOICE_1_VOTE, [ACCOUNT_DELEGATE]: CHOICE_2_VOTE }
            })
            it('should show delegations label and voted choice', () => {
              const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
              expect(config.showChoiceButtons).toBe(false)
              expect(config.vote).toBe(CHOICE_1_VOTE)
              expect(config.delegateVote).toBe(CHOICE_2_VOTE)
            })

            it('delegations label should show when the delegate voted and how many delegators you voted for', () => {
              const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
              expect(config.delegationsLabel).toEqual({
                delegateLabel: {
                  id: 'page.proposal_detail.delegate_voted',
                  values: { date: Time.from(CHOICE_1_VOTE.timestamp).fromNow() },
                },
                delegatorsLabel: {
                  id: 'page.proposal_detail.user_voted_for_delegators',
                  values: { amountRepresented: DELEGATORS.length },
                },
              })
            })

            it('voted choice shows user vote and votes represented by user plus delegator votes', () => {
              const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
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
              votes = {...VOTES_WITH_DELEGATORS, ...{ [USER_ACCOUNT]: CHOICE_1_VOTE, [ACCOUNT_DELEGATE]: CHOICE_1_VOTE}}
            })
            it('should show delegations label and voted choice', () => {
              const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
              expect(config.showChoiceButtons).toBe(false)
              expect(config.vote).toBe(CHOICE_1_VOTE)
              expect(config.delegateVote).toBe(CHOICE_1_VOTE)
            })

            it('delegations label should show when the delegate voted and and how many delegators you voted for', () => {
              const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
              expect(config.delegationsLabel).toEqual({
                delegateLabel: {
                  id: 'page.proposal_detail.delegate_voted',
                  values: { date: Time.from(CHOICE_1_VOTE.timestamp).fromNow() },
                },
                delegatorsLabel: {
                  id: 'page.proposal_detail.user_voted_for_delegators',
                  values: { amountRepresented: 1 }, // delegator 4
                },
              })
            })

            it('voted choice shows delegator vote, and votes represented by user plus delegator votes', () => {
              const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
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
              votes = {...VOTES_WITH_DELEGATORS, ...{ [USER_ACCOUNT]: CHOICE_1_VOTE, [ACCOUNT_DELEGATE]: CHOICE_2_VOTE }}
            })
            it('should show delegations label and voted choice', () => {
              const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
              expect(config.showChoiceButtons).toBe(false)
              expect(config.vote).toBe(CHOICE_1_VOTE)
              expect(config.delegateVote).toBe(CHOICE_2_VOTE)
            })

            it('delegations label should show when the delegate voted and and how many delegators you voted for', () => {
              const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
              expect(config.delegationsLabel).toEqual({
                delegateLabel: {
                  id: 'page.proposal_detail.delegate_voted',
                  values: { date: Time.from(CHOICE_1_VOTE.timestamp).fromNow() },
                },
                delegatorsLabel: {
                  id: 'page.proposal_detail.user_voted_for_delegators',
                  values: { amountRepresented: 1 }, // delegator 4
                },
              })
            })

            it('voted choice only shows votes represented by user plus delegator votes', () => {
              const config = getVotingSectionConfig(votes, CHOICES, delegate, delegators, account)
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
  })
})
