import { ChainId } from '@dcl/schemas'

import { DelegationsLabelProps } from '../../components/Section/ProposalVoting/DelegationsLabel'
import { VotedChoice } from '../../components/Section/ProposalVoting/VotedChoiceButton'
import { Vote } from '../../entities/Votes/types'
import { Scores } from '../../entities/Votes/utils'

import { DelegationsLabelBuilder } from './helpers/DelegationsLabelBuilder'
import { VotedChoiceBuilder } from './helpers/VotedChoiceBuilder'

export function getEnvironmentChainId() {
  const CHAIN_ID = Number(process.env.GATSBY_DEFAULT_CHAIN_ID)
  switch (CHAIN_ID) {
    case ChainId.ETHEREUM_MAINNET.valueOf():
      return ChainId.ETHEREUM_MAINNET
    case ChainId.ETHEREUM_RINKEBY:
      return ChainId.ETHEREUM_RINKEBY
    default:
      throw new Error(`GATSBY_DEFAULT_CHAIN_ID is not Mainnet or Rinkeby: ${process.env.GATSBY_DEFAULT_CHAIN_ID}`)
  }
}

export interface VotingSectionConfigProps {
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
  account: string | null,
  ownVotingPower: number,
  delegatedVotingPower: number,
  voteDifference: number | null
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

  if (!account || !hasChoices) return configuration

  const votedChoice = new VotedChoiceBuilder(vote, delegateVote, choices, votes, account, delegate, delegators).build()
  const delegationsLabel = new DelegationsLabelBuilder(
    account,
    ownVotingPower,
    delegatedVotingPower,
    vote,
    delegate,
    delegateVote,
    voteDifference,
    delegators,
    votes
  ).build()

  if (votedChoice) configuration.votedChoice = votedChoice
  if (delegationsLabel) configuration.delegationsLabel = delegationsLabel
  if (!vote && (!delegate || !delegateVote || hasDelegators)) {
    configuration.showChoiceButtons = true
  }
  return configuration
}

export function getPartyVotes(
  delegators: string[],
  votes: Record<string, Vote> | null | undefined,
  choices: string[]
): { votesByChoices: Scores; totalVotes: number } {
  let totalVotes = 0
  const votesByChoices: Scores = {}

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
