import Time from 'decentraland-gatsby/dist/utils/date/Time';
import { intersection } from 'lodash';



import { DelegationsLabelProps } from '../../../components/Section/ProposalVoting/DelegationsLabel';
import { Vote } from '../../../entities/Votes/types';


export class DelegationsLabelBuilder {
  private readonly votes: Record<string, Vote> | null | undefined
  private readonly account: string
  private readonly ownVotingPower: number
  private readonly delegatedVotingPower: number
  private readonly delegators: string[] | null
  private readonly vote: Vote | null
  private readonly delegateVote: Vote | null
  private readonly delegate: string | null
  private readonly voteDifference: number | null

  constructor(
    account: string,
    ownVotingPower: number,
    delegatedVotingPower: number,
    vote: Vote | null,
    delegate: string | null,
    delegateVote: Vote | null,
    voteDifference: number | null,
    delegators: string[] | null,
    votes: Record<string, Vote> | null | undefined
  ) {
    this.account = account
    this.ownVotingPower = ownVotingPower
    this.delegatedVotingPower = delegatedVotingPower
    this.vote = vote
    this.delegate = delegate
    this.delegateVote = delegateVote
    this.voteDifference = voteDifference
    this.delegators = delegators
    this.votes = votes
  }

  build(): DelegationsLabelProps | null {
    let delegationsLabel = null
    delegationsLabel = this.delegatorsLabel(delegationsLabel)
    delegationsLabel = this.addDelegateLabel(delegationsLabel)
    if (delegationsLabel) delegationsLabel.infoMessage = this.getInfoMessage()
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
        id: delegatorsVotes === totalDelegators ? 'page.proposal_detail.all_delegators_voted' : 'page.proposal_detail.delegators_voted',
        values: { votes: delegatorsVotes, total: totalDelegators },
      },
    }
  }

  private userVotedForDelegatorsLabel(totalDelegators: number, delegatorsVotes: number) {
    const amountRepresented = totalDelegators - delegatorsVotes
    return {
      delegatorsLabel: {
        id: amountRepresented === 0 ? 'page.proposal_detail.all_delegators_voted' : 'page.proposal_detail.user_voted_for_delegators',
        values: { amountRepresented },
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
        values: { date: DelegationsLabelBuilder.dateFormat(this.delegateVote.timestamp) },
      },
    }
  }

  private calculateDelegatorsVotes() {
    const votesAddresses = Object.keys(this.votes || {})
    const delegatorsVotes = intersection(votesAddresses, this.delegators).length
    const totalDelegators = this.delegators!.length
    return { delegatorsVotes, totalDelegators }
  }

  private getInfoMessage() {
    let infoMessage

    if (!this.vote) {
      if (this.delegate) {
        if (this.delegateVote) {
          if (this.hasDelegators()) {
            const { delegatorsVotes, totalDelegators } = this.calculateDelegatorsVotes()
            const delegatorsVoted = delegatorsVotes > 0
            if (delegatorsVoted) {
              const delegatorsWithoutVote = totalDelegators - delegatorsVotes
              if(delegatorsWithoutVote === 0){
                infoMessage = {
                  id: 'page.proposal_detail.info.user_has_not_voted_delegate_voted_all_delegators_voted',
                  values: {
                    delegate: this.delegate,
                    own_vp: this.ownVotingPower,
                  },
                }
              } else {
                infoMessage = {
                  id: 'page.proposal_detail.info.user_has_not_voted_delegate_voted_some_delegators_voted',
                  values: {
                    delegate: this.delegate,
                    own_vp: this.ownVotingPower,
                    delegators_that_voted: delegatorsVotes,
                    total_delegators: totalDelegators,
                    delegators_without_vote: delegatorsWithoutVote,
                  },
                }
              }
            } else {
              infoMessage = {
                id: 'page.proposal_detail.info.user_has_not_voted_delegate_voted_delegators_have_not_voted',
                values: {
                  delegate: this.delegate,
                  own_vp: this.ownVotingPower,
                  total_delegators: totalDelegators,
                  delegated_vp: this.delegatedVotingPower,
                },
              }
            }
          }
          if (!this.hasDelegators()) {
            infoMessage = {
              id: 'page.proposal_detail.info.user_has_not_voted_delegate_voted_without_delegators',
              values: { delegate: this.delegate, own_vp: this.ownVotingPower },
            }
          }
        }
        if (!this.delegateVote) {
          if (this.hasDelegators()) {
            const { delegatorsVotes, totalDelegators } = this.calculateDelegatorsVotes()
            const delegatorsVoted = delegatorsVotes > 0
            if (delegatorsVoted) {
              infoMessage = {
                id: 'page.proposal_detail.info.user_has_not_voted_delegate_has_not_voted_some_delegators_voted',
                values: { delegate: this.delegate, delegators_without_vote: totalDelegators - delegatorsVotes },
              }
            } else {
              infoMessage = {
                id: 'page.proposal_detail.info.user_has_not_voted_delegate_has_not_voted_delegators_have_not_voted',
                values: {
                  own_vp: this.ownVotingPower,
                  delegate: this.delegate,
                  total_delegators: totalDelegators,
                  delegated_vp: this.delegatedVotingPower,
                },
              }
            }
          }
          if (!this.hasDelegators()) {
            infoMessage = {
              id: 'page.proposal_detail.info.user_has_not_voted_delegate_has_not_voted_without_delegators',
              values: { delegate: this.delegate },
            }
          }
        }
      }
      if (!this.delegate) {
        if (this.hasDelegators()) {
          const { delegatorsVotes, totalDelegators } = this.calculateDelegatorsVotes()
          const delegatorsVoted = delegatorsVotes > 0
          if (delegatorsVoted) {
            infoMessage = {
              id: 'page.proposal_detail.info.user_has_not_voted_no_delegate_some_delegators_voted',
              values: { delegators_without_vote: totalDelegators - delegatorsVotes },
            }
          } else {
            infoMessage = {
              id: 'page.proposal_detail.info.user_has_not_voted_no_delegate_all_delegators_have_not_voted',
            }
          }
        }
        if (!this.hasDelegators()) {
          infoMessage = undefined
        }
      }
    }
    if (this.vote) {
      if (this.delegate) {
        if (this.delegateVote) {
          const votedTheSame = this.vote.choice === this.delegateVote.choice
          if (votedTheSame) {
            if (this.hasDelegators()) {
              const { delegatorsVotes, totalDelegators } = this.calculateDelegatorsVotes()
              infoMessage = {
                id: 'page.proposal_detail.info.user_voted_delegate_voted_the_same_with_delegators',
                values: {
                  delegators_without_vote: totalDelegators - delegatorsVotes,
                  total_delegators: totalDelegators,
                  delegate: this.delegate,
                  delegators_info_id: this.getDelegatorsInfoId(totalDelegators),
                },
              }
            }
            if (!this.hasDelegators()) {
              infoMessage = {
                id: 'page.proposal_detail.info.user_voted_delegate_voted_the_same_without_delegators',
                values: { delegate: this.delegate },
              }
            }
          }
          if (!votedTheSame) {
            if (this.hasDelegators()) {
              const { delegatorsVotes, totalDelegators } = this.calculateDelegatorsVotes()
              infoMessage = {
                id: 'page.proposal_detail.info.user_voted_delegate_voted_differently_with_delegators',
                values: {
                  delegators_without_vote: totalDelegators - delegatorsVotes,
                  total_delegators: totalDelegators,
                  delegate: this.delegate,
                  vote_difference: this.voteDifference,
                  delegators_info_id: this.getDelegatorsInfoId(totalDelegators),
                },
              }
            }
            if (!this.hasDelegators()) {
              infoMessage = {
                id: 'page.proposal_detail.info.user_voted_delegate_voted_differently_without_delegators',
                values: {
                  delegate: this.delegate,
                  vote_difference: this.voteDifference,
                },
              }
            }
          }
        }
        if (!this.delegateVote) {
          if (this.hasDelegators()) {
            const { delegatorsVotes, totalDelegators } = this.calculateDelegatorsVotes()
            const delegatorsVoted = delegatorsVotes > 0
            if (delegatorsVoted) {
              const delegatorsWithoutVote = totalDelegators - delegatorsVotes
              if(delegatorsWithoutVote === 0){
                infoMessage = {
                  id: 'page.proposal_detail.info.user_voted_delegate_has_not_voted_all_delegators_voted',
                  values: {
                    delegate: this.delegate,
                  },
                }
              } else {
                infoMessage = {
                  id: 'page.proposal_detail.info.user_voted_delegate_has_not_voted_some_delegators_voted',
                  values: {
                    delegators_without_vote: delegatorsWithoutVote,
                    total_delegators: totalDelegators,
                    delegated_vp: this.delegatedVotingPower,
                    delegate: this.delegate,
                    delegators_info_id: this.getDelegatorsInfoId(totalDelegators),
                  },
                }
              }
            } else {
              infoMessage = {
                id: 'page.proposal_detail.info.user_voted_delegate_has_not_voted_delegators_have_not_voted',
                values: { total_delegators: totalDelegators, delegate: this.delegate },
              }
            }
          }
          if (!this.hasDelegators()) {
            infoMessage = {
              id: 'page.proposal_detail.info.user_voted_delegate_has_not_voted_without_delegators',
              values: { delegate: this.delegate },
            }
          }
        }
      }
      if (!this.delegate) {
        if (this.hasDelegators()) {
          const { delegatorsVotes } = this.calculateDelegatorsVotes()
          const delegatorsVoted = delegatorsVotes > 0
          if (delegatorsVoted) {
            infoMessage = {
              id: 'page.proposal_detail.info.user_voted_no_delegate_some_delegators_voted',
            }
          } else {
            infoMessage = {
              id: 'page.proposal_detail.info.user_voted_no_delegate_delegators_have_not_voted',
            }
          }
        }
        if (!this.hasDelegators()) {
          infoMessage = undefined
        }
      }
    }
    return infoMessage
  }

  private getDelegatorsInfoId(totalDelegators: number) {
    return totalDelegators >  1 ? 'many_delegators' : 'single_delegator'
  }

  public static dateFormat(timestamp: number) {
    return Time(timestamp).fromNow().replace('a few ', '')
  }
}
