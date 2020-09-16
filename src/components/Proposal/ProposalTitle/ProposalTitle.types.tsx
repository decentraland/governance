import { ProposalDescription } from 'modules/description/types'
import { Proposal } from 'modules/proposal/types'
import { Network } from 'modules/wallet/types'

export type DefaultProps = {
  proposal?: Proposal
}

export type Props = DefaultProps & {
  description?: ProposalDescription
  network: Network
}

export type MapStateProps = Pick<Props, 'description' | 'network'>
export type MapDispatchProps = {}
export type MapDispatch = {}
