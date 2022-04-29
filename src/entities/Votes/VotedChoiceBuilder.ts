import { Vote } from './types'
import { VotedChoice } from './utils'

export class VotedChoiceBuilder {
  private readonly _choices: string[] = []
  private readonly _votes: Record<string, Vote> | null
  private readonly _account: string
  private readonly _delegators: string[] | null
  private readonly _vote: Vote | null
  private readonly _delegateVote: Vote | null
  private readonly _delegate: string | null

  constructor(
    vote: Vote | null,
    delegateVote: Vote | null,
    choices: string[],
    votes: Record<string, Vote> | null,
    account: string,
    delegate: string | null,
    delegators: string[] | null
  ) {
    this._choices = choices
    this._votes = votes
    this._account = account
    this._delegators = delegators
    this._vote = vote
    this._delegateVote = delegateVote
    this._delegate = delegate
  }

  build(): VotedChoice | null {
    let votedChoice = null
    const hasDelegators = !!this._delegators && this._delegators.length > 0

    if (!this._delegate) {
      if (!hasDelegators) {
        if (this._vote) {
          votedChoice = {
            id: 'page.proposal_detail.voted_choice',
            values: { choice: this._choices[this._vote.choice - 1] },
          }
        }
      }
      if (hasDelegators) {
        const totalDelegators = this._delegators!.length
        if (this._vote) {
          votedChoice = {
            id: 'page.proposal_detail.voted_choice',
            values: { choice: this._choices[this._vote.choice - 1] },
            voteCount: this.votedChoiceVoteCount(this._choices, this._votes, this._account, this._delegators!),
            totalVotes: totalDelegators,
          }
        }
      }
    }

    if (this._delegate) {
      if (!this._vote) {
        if (this._delegateVote) {
          votedChoice = {
            id: 'page.proposal_detail.delegate_voted_choice',
            values: { choice: this._choices[this._delegateVote.choice - 1] },
            delegate: this._delegate,
          }
        }
      }
      if (this._vote) {
        if (!this._delegateVote) {
          votedChoice = {
            ...votedChoice,
            id: 'page.proposal_detail.voted_choice',
            values: { choice: this._choices[this._vote.choice - 1] },
          }
        }
        if (this._delegateVote) {
          if (this._vote.choice === this._delegateVote.choice) {
            votedChoice = {
              ...votedChoice,
              id: !hasDelegators ? 'page.proposal_detail.both_voted_choice' : 'page.proposal_detail.voted_choice',
              values: { choice: this._choices[this._vote.choice - 1] },
              delegate: this._delegate,
            }
          } else {
            votedChoice = {
              ...votedChoice,
              id: 'page.proposal_detail.voted_choice',
              values: { choice: this._choices[this._vote.choice - 1] },
            }
          }
        }
        if (hasDelegators) {
          const totalDelegators = this._delegators!.length
          votedChoice = {
            ...votedChoice,
            voteCount: this.votedChoiceVoteCount(this._choices, this._votes, this._account, this._delegators!),
            totalVotes: totalDelegators,
          }
        }
      }
    }

    return votedChoice
  }

  votedChoiceVoteCount(
    choices: string[],
    votes: Record<string, Vote> | null,
    account: string,
    delegators: string[]
  ): number {
    if (!votes) return 0

    let delegatorsWhoVotedTheSame = 0
    let delegatorsThatVoted = 0
    delegators.map((delegator) => {
      if (votes[delegator]) {
        delegatorsThatVoted += 1
        if (votes[delegator].choice === votes[account].choice) delegatorsWhoVotedTheSame += 1
      }
    })
    const representedByUser = delegators.length - delegatorsThatVoted
    return representedByUser + delegatorsWhoVotedTheSame
  }
}
