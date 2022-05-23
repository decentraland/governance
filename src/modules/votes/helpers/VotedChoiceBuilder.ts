import { VotedChoice } from '../../../components/Section/ProposalVoting/VotedChoiceButton'
import { Vote } from '../../../entities/Votes/types'

export class VotedChoiceBuilder {
  private readonly choices: string[] = []
  private readonly votes: Record<string, Vote> | null | undefined
  private readonly account: string
  private readonly delegators: string[] | null
  private readonly vote: Vote | null
  private readonly delegateVote: Vote | null
  private readonly delegate: string | null

  constructor(
    vote: Vote | null,
    delegateVote: Vote | null,
    choices: string[],
    votes: Record<string, Vote> | null | undefined,
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
    const delegateVoted = this.delegate && this.delegateVote

    if (!this.votes || (!this.vote && !this.delegateVote) || (!this.vote && hasDelegators)) return null

    if (this.vote) {
      if (delegateVoted) {
        votedChoice = this.bothVoted(hasDelegators)
        votedChoice = this.addDelegatorsVotesInfo(hasDelegators, votedChoice)
      } else {
        votedChoice = this.userVotedChoice()
        votedChoice = this.addDelegatorsVotesInfo(hasDelegators, votedChoice)
      }
    } else {
      if (delegateVoted) {
        votedChoice = this.delegateVotedChoice(hasDelegators)
      }
    }

    return votedChoice
  }

  private bothVoted(hasDelegators: boolean): VotedChoice | null {
    if (!this.vote || !this.delegate || !this.delegateVote) return null
    if (this.vote.choice === this.delegateVote.choice) {
      const votedChoice: VotedChoice = {
        id: !hasDelegators ? 'page.proposal_detail.both_voted_choice' : 'page.proposal_detail.voted_choice',
        values: { choice: this.votedChoiceName(this.vote) },
      }
      if (hasDelegators) votedChoice.delegate = this.delegate
      return votedChoice
    } else {
      return this.userVotedChoice()
    }
  }

  private addDelegatorsVotesInfo(hasDelegators: boolean, votedChoice: VotedChoice | null) {
    if (hasDelegators) {
      const totalDelegators = this.delegators!.length
      votedChoice = {
        ...votedChoice,
        voteCount: this.votedChoiceVoteCount(this.choices, this.votes!, this.account, this.delegators!),
        totalVotes: totalDelegators,
      }
    }
    return votedChoice
  }

  private delegateVotedChoice(hasDelegators: boolean): VotedChoice | null {
    if (!this.delegateVote || !this.delegate) return null
    const votedChoice: VotedChoice = {
      id: 'page.proposal_detail.delegate_voted_choice',
      values: { choice: this.votedChoiceName(this.delegateVote) },
    }
    if (hasDelegators) votedChoice.delegate = this.delegate
    return votedChoice
  }

  private userVotedChoice() {
    if (!this.vote) return null
    return {
      id: 'page.proposal_detail.voted_choice',
      values: { choice: this.votedChoiceName(this.vote) },
    }
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
