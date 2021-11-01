import { ProposalAttributes, ProposalStatus } from "./types"
import { Vote } from "../Votes/types"
import { calculateResult } from "../Votes/utils"

export class DiscourseProposalUpdateMessageBuilder {
  private readonly proposal: ProposalAttributes<any>
  private readonly votes: Record<string, Vote>

  constructor(proposal: ProposalAttributes<any>, votes: Record<string, Vote>) {
    this.proposal = proposal
    this.votes = votes
  }

  getUpdateMessage() {
    let updatingUser: string | null
    let statusDisplayName = this.proposal.status.toUpperCase()
    if (this.proposal.enacted) {
      updatingUser = this.proposal.enacted_by
      if (!updatingUser){
        throw Error("Proposal can't be enacted without an enacting user")
      }
      return this.getUserTriggeredUpdateMessage("ENACTED", updatingUser, this.proposal.enacted_description)
    } else if (this.proposal.status === ProposalStatus.Passed) {
      updatingUser = this.proposal.passed_by
      return updatingUser ? this.getUserTriggeredUpdateMessage(statusDisplayName, updatingUser, this.proposal.passed_description) : this.getJobTriggeredUpdateMessage(statusDisplayName)
    } else if (this.proposal.status === ProposalStatus.Rejected) {
      updatingUser = this.proposal.rejected_by
      return updatingUser ? this.getUserTriggeredUpdateMessage(statusDisplayName, updatingUser, this.proposal.rejected_description) : this.getJobTriggeredUpdateMessage(statusDisplayName)
    } else {
      throw new Error(`Proposal update message builder received an invalid status: ${this.proposal.status}`)
    }
  }

  private getJobTriggeredUpdateMessage(statusDisplayName: string) {
    let resultsByChoices = calculateResult(this.proposal.configuration.choices, this.votes, this.proposal.required_to_pass || 0)
    let votingResults = this.getVotingResultsMessage(resultsByChoices)
    return `${this.proposal.title}\n\n` + `This proposal is now in status: ${statusDisplayName}.\n\n` + votingResults
  }

  private getUserTriggeredUpdateMessage(statusDisplayName: string, updatingUser: string, updatingDescription: string | null) {
    return `${this.proposal.title}\n\n` +
      `This proposal has been ${statusDisplayName} by a DAO Committee Member (${updatingUser})\n\n` +
      `${updatingDescription}`
  }

  private getVotingResultsMessage(resultsByChoices: ({ color: "approve" | "reject" | number; progress: number; votes: number; power: number; choice: string })[]) {
    let votingResults = `Voting Results:\n`;
    resultsByChoices.forEach(choiceResult => {
      let formattedChoice = this.formatChoice(choiceResult.choice)
      votingResults+= `* ${formattedChoice} ${choiceResult.progress}% ${choiceResult.power.toLocaleString()} VP (${choiceResult.votes} votes)\n`
    })
    return votingResults
  }

  private formatChoice(choice: string) {
    return choice.charAt(0).toUpperCase() + choice.slice(1)
  }
}
