import upperFirst from 'lodash/upperFirst'

import { DelegationsLabelProps } from '../../components/Proposal/View/ProposalVoting/DelegationsLabel'
import { VotedChoice } from '../../components/Proposal/View/ProposalVoting/VotedChoiceButton'
import { Vote, VoteByAddress } from '../../entities/Votes/types'
import { Scores } from '../../entities/Votes/utils'

import { DelegationsLabelBuilder } from './helpers/DelegationsLabelBuilder'
import { VotedChoiceBuilder } from './helpers/VotedChoiceBuilder'

export interface VotingSectionConfigProps {
  vote: Vote | null
  delegateVote: Vote | null
  delegationsLabel: DelegationsLabelProps | null
  votedChoice: VotedChoice | null
  showChoiceButtons: boolean
}

export function getVotingSectionConfig(
  votes: VoteByAddress | null | undefined,
  choices: string[],
  delegate: string | null,
  delegators: string[] | null,
  account: string | null,
  ownVotingPower: number,
  delegatedVotingPower: number,
  voteDifference: number | null
): VotingSectionConfigProps {
  const vote = (account && votes?.[account]) || null
  const delegateVote = (delegate && votes?.[delegate]) || null
  const hasDelegators = !!delegators && delegators.length > 0
  const hasChoices = choices.length > 0

  if (!account || !hasChoices) {
    return {
      vote,
      delegateVote,
      showChoiceButtons: false,
      delegationsLabel: null,
      votedChoice: null,
    }
  }

  const votedChoice = new VotedChoiceBuilder(vote, delegateVote, choices, votes, account, delegate, delegators).build()
  const delegationsLabel = new DelegationsLabelBuilder(
    ownVotingPower,
    delegatedVotingPower,
    vote,
    delegate,
    delegateVote,
    voteDifference,
    delegators,
    votes
  ).build()

  return {
    vote,
    delegateVote,
    votedChoice: votedChoice || null,
    delegationsLabel: delegationsLabel || null,
    showChoiceButtons: !vote && (!delegate || !delegateVote || hasDelegators),
  }
}

export function getPartyVotes(
  delegators: string[],
  votes: VoteByAddress | null | undefined,
  choices: string[]
): { votesByChoices: Scores; totalVotes: number } {
  let totalVotes = 0
  const votesByChoices: Scores = {}

  if (delegators.length === 0) return { votesByChoices, totalVotes }

  choices.map((_value, index) => (votesByChoices[index] = 0))

  delegators.map((delegator) => {
    if (votes && votes[delegator]) {
      totalVotes += 1
      const choiceIndex = votes[delegator].choice - 1
      votesByChoices[choiceIndex] += 1
    }
  })

  return { votesByChoices, totalVotes }
}

export function formatChoice(choice: string) {
  return upperFirst(choice)
}
