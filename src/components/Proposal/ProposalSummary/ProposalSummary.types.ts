import { Dispatch } from 'redux'

import { Proposal } from 'modules/proposal/types'
import { CallHistoryMethodAction } from 'connected-react-router'
import { ProposalDescription } from 'modules/description/types'

export type DefaultProps = {
  proposal: Proposal
}

export type Props = DefaultProps & {
  description: ProposalDescription
  descriptionError: string
  isLoading: boolean
  onNavigate: (path: string, replace?: boolean) => void
}

export type MapStateProps = Pick<Props, 'description' | 'descriptionError' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
