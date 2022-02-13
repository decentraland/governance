import { ProposalAttributes, ProposalStatus } from '../types'
import { Vote } from '../../Votes/types'
import { calculateResult } from '../../Votes/utils'

export function getUpdateMessage(proposal: ProposalAttributes, votes: Record<string, Vote>) {
  let updatingUser: string | null

  let statusDisplayName = proposal.status.toUpperCase()
  if (proposal.enacted) {
    updatingUser = proposal.enacted_by
    if (!updatingUser) {
      throw Error('Proposal can\'t be enacted without an enacting user')
    }
    let description: string | null = "";
    if (proposal.vesting_address) { // It's optional
      description += "Vesting Contract Address: " + proposal.vesting_address;
    }
    if (proposal.enacted_description) {
      description += description === "" ? "" : "\n"
      description += proposal.enacted_description;
    }
    if (description === "") {
      description = null;
    }
    return getUserTriggeredUpdateMessage('ENACTED', updatingUser, description, proposal)
  } else if (proposal.status === ProposalStatus.Passed) {
    updatingUser = proposal.passed_by
    return updatingUser ? getUserTriggeredUpdateMessage(statusDisplayName, updatingUser, proposal.passed_description, proposal) : getJobTriggeredUpdateMessage(statusDisplayName, proposal, votes)
  } else if (proposal.status === ProposalStatus.Rejected) {
    updatingUser = proposal.rejected_by
    return updatingUser ? getUserTriggeredUpdateMessage(statusDisplayName, updatingUser, proposal.rejected_description, proposal) : getJobTriggeredUpdateMessage(statusDisplayName, proposal, votes)
  } else if (proposal.status === ProposalStatus.Finished) {
    return getJobTriggeredUpdateMessage(statusDisplayName, proposal, votes)
  } else {
    throw new Error(`Proposal update message builder received an invalid status: ${proposal.status}`)
  }
}

function getJobTriggeredUpdateMessage(statusDisplayName: string, proposal: ProposalAttributes, votes: Record<string, Vote>) {
  let resultsByChoices = calculateResult(getProposalChoices(proposal), votes, proposal.required_to_pass || 0)
  let votingResults = getVotingResultsMessage(resultsByChoices)
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
  let parsedConfig = getParsedConfig(proposal)
  let choices = parsedConfig.choices
  return (choices || []).map((choice: string) => choice.toLowerCase())
}

function getUserTriggeredUpdateMessage(statusDisplayName: string, updatingUser: string, updatingDescription: string | null, proposal: ProposalAttributes) {
  updatingDescription = updatingDescription || ""
  return `${proposal.title}\n\n` +
    `This proposal has been ${statusDisplayName} by a DAO Committee Member (${updatingUser})\n\n` +
    `${updatingDescription}`
}

function getVotingResultsMessage(resultsByChoices: ({ color: 'approve' | 'reject' | number; progress: number; votes: number; power: number; choice: string })[]) {
  let votingResults = `Voting Results:\n`
  resultsByChoices.forEach(choiceResult => {
    let formattedChoice = formatChoice(choiceResult.choice)
    votingResults += `* ${formattedChoice} ${choiceResult.progress}% ${choiceResult.power.toLocaleString()} VP (${choiceResult.votes} votes)\n`
  })
  return votingResults
}

export function formatChoice(choice: string) {
  return choice.charAt(0).toUpperCase() + choice.slice(1)
}

