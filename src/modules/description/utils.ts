import { COMMUNITY, INBOX, SAB } from 'modules/app/types'
import { Network } from 'modules/wallet/types'
import { ProposalDescription } from './types'

export function getProposalInitialAddress(description?: ProposalDescription) {
  if (!description?.firstDescribedSteps?.length) {
    return undefined
  }

  switch (description.firstDescribedSteps[0].to) {
    case SAB[Network.MAINNET]:
    case SAB[Network.RINKEBY]:
    case COMMUNITY[Network.MAINNET]:
    case COMMUNITY[Network.RINKEBY]:
    case INBOX[Network.MAINNET]:
    case INBOX[Network.RINKEBY]:
      return undefined

    default:
      return description.firstDescribedSteps[0].to
  }
}
