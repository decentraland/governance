import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { intersection } from 'lodash'
import isUUID from 'validator/lib/isUUID'
import { SnapshotVote } from '../../api/Snapshot'
import { ChoiceColor, Vote } from './types'

export function toProposalIds(ids?: undefined | null | string | string[]) {
  if (!ids) {
    return []
  }

  const list = Array.isArray(ids) ? ids : [ids]

  return list.filter((id) => isUUID(String(id)))
}

export function createVotes(votes: SnapshotVote[], balances: Record<string, number>) {
  const balance = new Map(
    Object.keys(balances).map((address) => [address.toLowerCase(), balances[address] || 0] as const)
  )
  return votes.reduce((result, vote) => {
    const address = vote.voter.toLowerCase()
    result[address] = {
      choice: vote.choice,
      vp: balance.get(address) || 0,
      timestamp: Number(vote.created),
    }
    return result
  }, {} as Record<string, Vote>)
}

export function calculateResult(choices: string[], votes: Record<string, Vote>, requiredVotingPower: number = 0) {
  let totalPower = 0
  const balance: Record<string, number> = {}
  const choiceCount: Record<string, number> = {}
  for (const choice of choices) {
    balance[choice] = 0
    choiceCount[choice] = 0
  }

  const voters = Object.keys(votes || {})
  for (const voter of voters) {
    const vote = votes![voter]!
    if (vote) {
      totalPower += vote.vp
      balance[choices[vote.choice - 1]] += vote.vp
      choiceCount[choices[vote.choice - 1]] += 1
    }
  }

  let rest = 100
  let maxProgress = 0
  let totalPowerProgress = Math.max(totalPower, requiredVotingPower)
  const result = choices.map((choice, i) => {
    const color = calculateChoiceColor(choice, i)
    const power = balance[choice] || 0
    const votes = choiceCount[choice] || 0

    if (totalPower === 0) {
      return {
        choice,
        color,
        votes,
        power: 0,
        progress: 0,
      }
    }

    if (power === 0) {
      return {
        choice,
        color,
        votes,
        power: 0,
        progress: 0,
      }
    }

    if (power === totalPowerProgress) {
      return {
        choice,
        color,
        votes,
        power,
        progress: 100,
      }
    }

    let progress = Math.floor((power / totalPowerProgress) * 100)
    if (progress === 0) {
      progress = 1
    }

    rest -= progress

    if (progress > maxProgress) {
      maxProgress = progress
    }

    return {
      choice,
      power,
      votes,
      color,
      progress,
    }
  })

  if (rest !== 0 && rest !== 100 && totalPower >= requiredVotingPower) {
    const maxChoiceResults = result.filter((choiceResult) => choiceResult.progress === maxProgress)
    for (const choiceResult of maxChoiceResults) {
      choiceResult.progress += rest / maxChoiceResults.length
    }
  }

  return result
}

export function calculateChoiceColor(value: string, index: number): ChoiceColor {
  switch (value.toLowerCase()) {
    case 'yes':
    case 'for':
    case 'approve':
      return 'approve'

    case 'no':
    case 'against':
    case 'reject':
      return 'reject'

    default:
      return index % 8
  }
}

export function calculateResultWinner(choices: string[], votes: Record<string, Vote>, requiredVotingPower: number = 0) {
  const result = calculateResult(choices, votes, requiredVotingPower)

  return result.reduce((winner, current) => {
    if (winner.power < current.power) {
      return current
    }

    return winner
  }, result[0])
}

const SI_SYMBOL = ['', 'k', 'M', 'G', 'T', 'P', 'E']

export function abbreviateNumber(vp: number) {
  const tier = (Math.log10(Math.abs(vp)) / 3) | 0

  if (tier == 0) return vp

  const suffix = SI_SYMBOL[tier]
  const scale = Math.pow(10, tier * 3)

  const scaled = vp / scale

  return scaled.toFixed(1) + suffix
}

export interface VotedChoice {
  id?: string
  values?: any
  delegate?: string
  voteCount?: number
  totalVotes?: number
}

export interface DelegationsLabelProps {
  delegateLabel?: { id: string; values?: any }
  delegatorsLabel?: { id: string; values?: any }
}

function votedChoiceVoteCount(
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

export function getPartyVotes(
  delegators: string[],
  votes: Record<string, Vote> | null | undefined,
  choices: string[]
): { votesByChoices: Record<string, number>; totalVotes: number } {
  let totalVotes = 0
  const votesByChoices: Record<string, number> = {}

  if (delegators.length === 0) return { votesByChoices, totalVotes }

  choices.map((value, index) => (votesByChoices[index] = 0))

  delegators.map((delegator) => {
    if (votes && votes[delegator]) {
      totalVotes += 1
      const choiceIndex = votes[delegator].choice - 1
      votesByChoices[choiceIndex] += 1
    }
  })

  return { votesByChoices, totalVotes }
}

interface VotingSectionConfigProps {
  vote: Vote | null
  delegateVote: Vote | null
  delegationsLabel: DelegationsLabelProps | null
  votedChoice: VotedChoice | null
  showChoiceButtons: boolean
}

export function getVotingSectionConfig(
  votes: Record<string, Vote> | null | undefined,
  choices: string[],
  delegate: string | null,
  delegators: string[] | null,
  account: string | null
): VotingSectionConfigProps {
  const vote = (account && votes?.[account]) || null
  const delegateVote = (delegate && votes?.[delegate]) || null
  const hasDelegators = delegators && delegators.length > 0
  const hasChoices = choices.length > 0

  const configuration: VotingSectionConfigProps = {
    vote: vote,
    delegateVote: delegateVote,
    showChoiceButtons: false,
    delegationsLabel: null,
    votedChoice: null,
  }

  if (!account || !hasChoices || !votes) return configuration

  if (!delegate) {
    if (!hasDelegators) {
      if (vote) {
        return {
          ...configuration,
          votedChoice: {
            id: 'page.proposal_detail.voted_choice',
            values: { choice: choices[vote.choice - 1] },
          },
        }
      } else {
        return {
          ...configuration,
          showChoiceButtons: true,
        }
      }
    }
    if (hasDelegators) {
      const votesAddresses = Object.keys(votes || {})
      const delegatorsVotes = intersection(votesAddresses, delegators).length
      const totalDelegators = delegators.length

      if (!vote) {
        configuration.showChoiceButtons = true

        if (delegatorsVotes > 0) {
          return {
            ...configuration,
            delegationsLabel: {
              delegatorsLabel: {
                id: 'page.proposal_detail.delegators_voted',
                values: { votes: delegatorsVotes, total: totalDelegators },
              },
            },
          }
        } else {
          return {
            ...configuration,
            delegationsLabel: {
              delegatorsLabel: {
                id: 'page.proposal_detail.delegators_represented',
                values: { total: totalDelegators },
              },
            },
          }
        }
      }
      if (vote) {
        return {
          ...configuration,
          votedChoice: {
            id: 'page.proposal_detail.voted_choice',
            values: { choice: choices[vote.choice - 1] },
            voteCount: votedChoiceVoteCount(choices, votes, account, delegators),
            totalVotes: totalDelegators,
          },
          delegationsLabel: {
            delegatorsLabel: {
              id: 'page.proposal_detail.user_voted_for_delegators',
              values: { amountRepresented: totalDelegators - delegatorsVotes },
            },
          },
        }
      }
    }
  }

  if (delegate) {
    if (!vote) {
      if (hasDelegators) {
        configuration.showChoiceButtons = true
        const votesAddresses = Object.keys(votes || {})
        const delegatorsVotes = intersection(votesAddresses, delegators).length
        const totalDelegators = delegators.length
        if(delegatorsVotes > 0){
          configuration.delegationsLabel = {
            delegatorsLabel: {
              id: 'page.proposal_detail.delegators_voted',
              values: { votes: delegatorsVotes, total: totalDelegators },
            },
          }
        } else {
          configuration.delegationsLabel = {
            delegatorsLabel: {
              id: 'page.proposal_detail.delegators_represented',
              values: { total: totalDelegators },
            },
          }
        }
      }
      if (!delegateVote) {
        return {
          ...configuration,
          showChoiceButtons: true,
          delegationsLabel: {
            ...configuration.delegationsLabel,
            delegateLabel: { id: 'page.proposal_detail.delegate_not_voted' },
          },
        }
      }
      if (delegateVote) {
        return {
          ...configuration,
          delegationsLabel: {
            ...configuration.delegationsLabel,
            delegateLabel: {
              id: 'page.proposal_detail.delegate_voted',
              values: { date: Time.from(delegateVote.timestamp).fromNow() },
            },
          },
          votedChoice: {
            id: 'page.proposal_detail.delegate_voted_choice',
            values: { choice: choices[delegateVote.choice - 1] },
            delegate: delegate,
          },
        }
      }
    }
    if (vote) {
      if (hasDelegators) {
        const votesAddresses = Object.keys(votes || {})
        const delegatorsVotes = intersection(votesAddresses, delegators).length
        const totalDelegators = delegators.length
        configuration.votedChoice = {
          ...configuration.votedChoice,
          voteCount: votedChoiceVoteCount(choices, votes, account, delegators),
          totalVotes: totalDelegators
        }
        configuration.delegationsLabel = {
          delegatorsLabel: {
            id: 'page.proposal_detail.user_voted_for_delegators',
            values: { amountRepresented: totalDelegators - delegatorsVotes },
          },
        }
      }
      if (!delegateVote) {
        return {
          ...configuration,
          delegationsLabel: {
            ...configuration.delegationsLabel,
            delegateLabel: { id: 'page.proposal_detail.delegate_not_voted' },
          },
          votedChoice: {
            ...configuration.votedChoice,
            id: 'page.proposal_detail.voted_choice',
            values: { choice: choices[vote.choice - 1] },
          },
        }
      }
      if (delegateVote) {
        if (vote.choice === delegateVote.choice) {
          configuration.delegationsLabel = {
            ...configuration.delegationsLabel,
            delegateLabel: {
              id: 'page.proposal_detail.delegate_voted',
              values: { date: Time.from(delegateVote.timestamp).fromNow() },
            },
          }
          return {
            ...configuration,
            votedChoice: {
              ...configuration.votedChoice,
              id: !hasDelegators ? 'page.proposal_detail.both_voted_choice' : 'page.proposal_detail.voted_choice',
              values: { choice: choices[vote.choice - 1] },
              delegate: delegate,
            },
          }
        } else {
          if(!hasDelegators){
            configuration.delegationsLabel = {
              ...configuration.delegationsLabel,
              delegateLabel: { id: 'page.proposal_detail.delegate_voted_differently' },
            }
          } else{
            configuration.delegationsLabel = {
              ...configuration.delegationsLabel,
              delegateLabel: {
                id: 'page.proposal_detail.delegate_voted',
                values: { date: Time.from(delegateVote.timestamp).fromNow() },
              },
            }
          }
          return {
            ...configuration,
            votedChoice: {
              ...configuration.votedChoice,
              id: 'page.proposal_detail.voted_choice',
              values: { choice: choices[vote.choice - 1] },
            },
          }
        }
      }
    }
  }
  return configuration
}
