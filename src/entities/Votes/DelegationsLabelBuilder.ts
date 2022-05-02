import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { intersection } from 'lodash'
import { Vote } from './types'
import { DelegationsLabelProps } from './utils'

export class DelegationsLabelBuilder {
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
    this.votes = votes
    this.account = account
    this.delegators = delegators
    this.vote = vote
    this.delegateVote = delegateVote
    this.delegate = delegate
  }

  build(): DelegationsLabelProps | null {
    let delegationsLabel = null
    delegationsLabel = this.delegatorsLabel(delegationsLabel)
    delegationsLabel = this.addDelegateLabel(delegationsLabel)
    return delegationsLabel
  }

  private hasDelegators() {
    return !!this.delegators && this.delegators.length > 0
  }

  private addDelegateLabel(delegationsLabel: DelegationsLabelProps | null) {
    if (this.delegate) {
      if (!this.delegateVote) {
        delegationsLabel = this.addDelegateNotVotedLabel(delegationsLabel)
      } else {
        if (this.vote && !this.hasDelegators() && this.vote.choice !== this.delegateVote.choice) {
          delegationsLabel = this.addDelegateVotedDifferentlyLabel(delegationsLabel)
        } else {
          delegationsLabel = this.addDelegateVotedLabel(delegationsLabel)
        }
      }
    }
    return delegationsLabel
  }

  private delegatorsLabel(delegationsLabel: DelegationsLabelProps | null) {
    if (this.hasDelegators()) {
      const { delegatorsVotes, totalDelegators } = this.calculateDelegatorsVotes()
      const delegatorsVoted = delegatorsVotes > 0
      if (this.vote) {
        delegationsLabel = this.userVotedForDelegatorsLabel(totalDelegators, delegatorsVotes)
      } else {
        if (delegatorsVoted) {
          delegationsLabel = this.delegatorsVotedLabel(delegatorsVotes, totalDelegators)
        } else {
          delegationsLabel = this.delegatorsRepresentedLabel(totalDelegators)
        }
      }
    }
    return delegationsLabel
  }

  private addDelegateNotVotedLabel(delegationsLabel: DelegationsLabelProps | null) {
    return {
      ...delegationsLabel,
      delegateLabel: { id: 'page.proposal_detail.delegate_not_voted' },
    }
  }

  private addDelegateVotedDifferentlyLabel(delegationsLabel: DelegationsLabelProps | null) {
    return {
      ...delegationsLabel,
      delegateLabel: { id: 'page.proposal_detail.delegate_voted_differently' },
    }
  }

  private delegatorsVotedLabel(delegatorsVotes: number, totalDelegators: number) {
    return {
      delegatorsLabel: {
        id: 'page.proposal_detail.delegators_voted',
        values: { votes: delegatorsVotes, total: totalDelegators },
      },
    }
  }

  private userVotedForDelegatorsLabel(totalDelegators: number, delegatorsVotes: number) {
    return {
      delegatorsLabel: {
        id: 'page.proposal_detail.user_voted_for_delegators',
        values: { amountRepresented: totalDelegators - delegatorsVotes },
      },
    }
  }

  private delegatorsRepresentedLabel(totalDelegators: number) {
    return {
      delegatorsLabel: {
        id: 'page.proposal_detail.delegators_represented',
        values: { total: totalDelegators },
      },
    }
  }

  private addDelegateVotedLabel(delegationsLabel: DelegationsLabelProps | null) {
    if (!this.delegateVote) return delegationsLabel
    return {
      ...delegationsLabel,
      delegateLabel: {
        id: 'page.proposal_detail.delegate_voted',
        values: { date: Time.from(this.delegateVote.timestamp).fromNow() },
      },
    }
  }

  private calculateDelegatorsVotes() {
    const votesAddresses = Object.keys(this.votes || {})
    const delegatorsVotes = intersection(votesAddresses, this.delegators).length
    const totalDelegators = this.delegators!.length
    return { delegatorsVotes, totalDelegators }
  }
}
