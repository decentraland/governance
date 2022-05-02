import { Vote } from './types'
import { VotedChoice } from './utils'

export class VotedChoiceBuilder {
  private readonly choices: string[] = []
  private readonly votes: Record<string, Vote> | null
  private readonly account: string
  private readonly delegators: string[] | null
  private readonly vote: Vote | null
  private readonly delegateVote: Vote | null
  private readonly delegate: string | null

  constructor(
    vote: Vote | null,
    delegateVote: Vote | null,
    choices: string[],
    votes: Record<string, Vote> | null,
    account: string,
    delegate: string | null,
    delegators: string[] | null
  ) {
    this.choices = choices
    this.votes = votes
    this.account = account
    this.delegators = delegators
    this.vote = vote
    this.delegateVote = delegateVote
    this.delegate = delegate
  }

  build(): VotedChoice | null {
    let votedChoice = null
    const hasDelegators = !!this.delegators && this.delegators.length > 0

    if (!this.delegate) {
      if (!hasDelegators) {
        if (this.vote) {
          votedChoice = {
            id: 'page.proposal_detail.voted_choice',
            values: { choice: this.votedChoiceName(this.vote) },
          }
        }
      }
      if (hasDelegators) {
        const totalDelegators = this.delegators!.length
        if (this.vote) {
          votedChoice = {
            id: 'page.proposal_detail.voted_choice',
            values: { choice: this.votedChoiceName(this.vote) },
            voteCount: this.votedChoiceVoteCount(this.choices, this.votes, this.account, this.delegators!),
            totalVotes: totalDelegators,
          }
        }
      }
    }

    if (this.delegate) {
      if (!this.vote) {
        if (this.delegateVote) {
          votedChoice = {
            id: 'page.proposal_detail.delegate_voted_choice',
            values: { choice: this.votedChoiceName(this.delegateVote) },
            delegate: this.delegate,
          }
        }
      }
      if (this.vote) {
        if (!this.delegateVote) {
          votedChoice = {
            ...votedChoice,
            id: 'page.proposal_detail.voted_choice',
            values: { choice: this.votedChoiceName(this.vote) },
          }
        }
        if (this.delegateVote) {
          if (this.vote.choice === this.delegateVote.choice) {
            votedChoice = {
              ...votedChoice,
              id: !hasDelegators ? 'page.proposal_detail.both_voted_choice' : 'page.proposal_detail.voted_choice',
              values: { choice: this.votedChoiceName(this.vote) },
              delegate: this.delegate,
            }
          } else {
            votedChoice = {
              ...votedChoice,
              id: 'page.proposal_detail.voted_choice',
              values: { choice: this.votedChoiceName(this.vote) },
            }
          }
        }
        if (hasDelegators) {
          const totalDelegators = this.delegators!.length
          votedChoice = {
            ...votedChoice,
            voteCount: this.votedChoiceVoteCount(this.choices, this.votes, this.account, this.delegators!),
            totalVotes: totalDelegators,
          }
        }
      }
    }

    return votedChoice
  }

  private votedChoiceName(vote: Vote) {
    return this.choices[vote.choice - 1]
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
