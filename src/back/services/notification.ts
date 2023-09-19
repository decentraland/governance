import { ethers } from 'ethers'

import { NOTIFICATIONS_SERVICE_ENABLED } from '../../constants'
import { ProposalAttributes } from '../../entities/Proposal/types'
import { isProdEnv } from '../../utils/governanceEnvs'
import { getCaipAddress } from '../../utils/notifications'

const PushAPI = NOTIFICATIONS_SERVICE_ENABLED ? require('@pushprotocol/restapi') : null

enum ENV {
  PROD = 'prod',
  STAGING = 'staging',
}

const CHAIN_ID = 5
const CHANNEL_ADDRESS = '0xBf363AeDd082Ddd8DB2D6457609B03f9ee74a2F1'
const PUSH_CHANNEL_OWNER_PK = process.env.PUSH_CHANNEL_OWNER_PK
const pkAddress = `0x${PUSH_CHANNEL_OWNER_PK}`
const signer = NOTIFICATIONS_SERVICE_ENABLED ? new ethers.Wallet(pkAddress) : undefined
const NotificationIdentityType = {
  DIRECT_PAYLOAD: 2,
}

export class NotificationService {
  static async sendNotification(type: number, title: string, body: string, recipient: string, url: string) {
    const response = await PushAPI.payloads.sendNotification({
      signer,
      type,
      identityType: NotificationIdentityType.DIRECT_PAYLOAD,
      notification: {
        title,
        body,
      },
      payload: {
        title,
        body,
        cta: url,
        img: '',
      },
      recipients: recipient ? getCaipAddress(recipient, CHAIN_ID) : undefined,
      channel: getCaipAddress(CHANNEL_ADDRESS, CHAIN_ID),
      env: isProdEnv() ? ENV.PROD : ENV.STAGING,
    })

    return response.data
  }

  static async proposalEnacted(proposal: ProposalAttributes) {
    /*
      Target recipient: Author / Coauthors of the Grant Proposal
      Copy: Title: "Grant Proposal Enacted"
      Description: "Congratulations! Your Grant Proposal has been successfully enacted and a Vesting Contract was added"
      Target URL: Grant Proposal URL
    */

    return true
  }

  static async coAuthorRequested(proposal: ProposalAttributes, coAuthors: string[]) {
    /*
      Trigger: A proposal got published and the user has been added as a coauthor.
      Target recipient: Proposed co author
      Copy: Title: "Co-author Request Received"
      Description: "You've been invited to collaborate as a co-author on a published proposal. Accept it or reject it here"
      Target URL: Proposal URL
    */

    return true
  }

  static async votingEndedAuthors(proposal: ProposalAttributes, authors: string[]) {
    /*
      TYPE SUBSET
      Trigger: A proposal ended
      Target recipient: Authors & Co authors of the proposal
      Copy: Title: "Voting Ended on Your Proposal [TITLE]"
      Description: "The votes are in! Find out the outcome of the voting on your proposal now."
      Target URL: Proposal URL
    */

    return true
  }

  static async votingEndedVoters(proposal: ProposalAttributes, voters: string[]) {
    /*
      TYPE SUBSET
      Trigger: A proposal ended
      Target recipient: Users who voted on the proposal
      Copy: Title: "Voting Ended on a Proposal You Voted On"
      Description: "Discover the results of the proposal you participated in as a voter. Your input matters!"
      Target URL: Proposal URL
    */

    return true
  }
}
