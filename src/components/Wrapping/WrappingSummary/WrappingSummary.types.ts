import { Dispatch } from 'redux'

// import { openModal, OpenModalAction } from 'modules/modal/actions'
// import { SortBy } from 'modules/ui/dashboard/types'
// import { PaginationOptions } from 'routing/utils'
// import { LoginRequestAction, loginRequest } from 'modules/identity/actions'
import { enableWalletRequest, EnableWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'

export type DefaultProps = {
}

export type Props = DefaultProps & {
  isConnected: boolean
  isConnecting: boolean
  isLoading: boolean
  onConnect: typeof enableWalletRequest
  // page: number
  // sortBy: SortBy
  // totalPages: number
  // onOpenModal: typeof openModal
  // onPageChange: (options: PaginationOptions) => void
  // onNavigate: (path: string) => void
  // onLogin: typeof loginRequest
  // votes: Vote[] | null
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onConnect'>
export type MapDispatch = Dispatch<EnableWalletRequestAction>
