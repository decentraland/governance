import { Dispatch } from 'redux'

// import { openModal, OpenModalAction } from 'modules/modal/actions'
// import { SortBy } from 'modules/ui/dashboard/types'
// import { PaginationOptions } from 'routing/utils'
// import { LoginRequestAction, loginRequest } from 'modules/identity/actions'
// import { connectWalletRequest, ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { App } from 'modules/app/types'
import { Vote } from 'modules/vote/types'

export type DefaultProps = {
  vote: Vote
}

export type Props = DefaultProps & {
  app: App
  isLoading: boolean
  // page: number
  // sortBy: SortBy
  // totalPages: number
  // onOpenModal: typeof openModal
  // onPageChange: (options: PaginationOptions) => void
  // onNavigate: (path: string) => void
  // onLogin: typeof loginRequest
  // votes: Vote[] | null
}

export type MapStateProps = Pick<Props, 'app' | 'isLoading'>
export type MapDispatchProps = {} //Pick<Props, 'onConnect'>
export type MapDispatch = Dispatch<any>
