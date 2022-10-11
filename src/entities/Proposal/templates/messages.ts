import { formatChoice } from '../../../modules/votes/utils'
import { Vote } from '../../Votes/types'
import { calculateResult } from '../../Votes/utils'
import { ProposalAttributes, ProposalStatus } from '../types'

export function getUpdateMessage(proposal: ProposalAttributes, votes: Record<string, Vote>) {
  let updatingUser: string | null

  const statusDisplayName = proposal.status.toUpperCase()
  if (proposal.enacted) {
    updatingUser = proposal.enacted_by
    if (!updatingUser) {
      throw Error("Proposal can't be enacted without an enacting user")
    }
    let description: string | null = ''
    if (proposal.vesting_address) {
      description += 'Vesting Contract Address: ' + proposal.vesting_address
    }
    if (proposal.enacted_description) {
      description += description === '' ? '' : '\n'
      description += proposal.enacted_description
    }
    if (proposal.enacting_tx) {
      description += '\nEnacting Transaction: https://etherscan.io/tx/' + proposal.enacting_tx
    }
    if (description === '') {
      description = null
    }
    return getUserTriggeredUpdateMessage('ENACTED', updatingUser, description, proposal)
  } else if (proposal.status === ProposalStatus.Passed) {
    updatingUser = proposal.passed_by
    return updatingUser
      ? getUserTriggeredUpdateMessage(statusDisplayName, updatingUser, proposal.passed_description, proposal)
      : getJobTriggeredUpdateMessage(statusDisplayName, proposal, votes)
  } else if (proposal.status === ProposalStatus.Rejected) {
    updatingUser = proposal.rejected_by
    return updatingUser
      ? getUserTriggeredUpdateMessage(statusDisplayName, updatingUser, proposal.rejected_description, proposal)
      : getJobTriggeredUpdateMessage(statusDisplayName, proposal, votes)
  } else if (proposal.status === ProposalStatus.Finished) {
    return getJobTriggeredUpdateMessage(statusDisplayName, proposal, votes)
  } else {
    throw new Error(`Proposal update message builder received an invalid status: ${proposal.status}`)
  }
}

function getJobTriggeredUpdateMessage(
  statusDisplayName: string,
  proposal: ProposalAttributes,
  votes: Record<string, Vote>
) {
  const resultsByChoices = calculateResult(getProposalChoices(proposal), votes)
  const votingResults = getVotingResultsMessage(resultsByChoices)
  return `${proposal.title}\n\n` + `This proposal is now in status: ${statusDisplayName}.\n\n` + votingResults
}

function getParsedConfig(proposal: ProposalAttributes) {
  try {
    return JSON.parse(proposal.configuration)
  } catch (e) {
    return proposal.configuration
  }
}

function getProposalChoices(proposal: ProposalAttributes) {
  const parsedConfig = getParsedConfig(proposal)
  const choices = parsedConfig.choices
  return (choices || []).map((choice: string) => choice.toLowerCase())
}

function getUserTriggeredUpdateMessage(
  statusDisplayName: string,
  updatingUser: string,
  updatingDescription: string | null,
  proposal: ProposalAttributes
) {
  updatingDescription = updatingDescription || ''
  return (
    `${proposal.title}\n\n` +
    `This proposal has been ${statusDisplayName} by a DAO Committee Member (${updatingUser})\n\n` +
    `${updatingDescription}`
  )
}

function getVotingResultsMessage(
  resultsByChoices: {
    color: 'approve' | 'reject' | number
    progress: number
    votes: number
    power: number
    choice: string
  }[]
) {
  let votingResults = `Voting Results:\n`
  resultsByChoices.forEach((choiceResult) => {
    const formattedChoice = formatChoice(choiceResult.choice)
    votingResults += `* ${formattedChoice} ${choiceResult.progress}% ${choiceResult.power.toLocaleString()} VP (${
      choiceResult.votes
    } votes)\n`
  })
  return votingResults
}
