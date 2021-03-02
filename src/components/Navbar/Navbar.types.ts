import { Dispatch } from 'redux'
import { Profile } from 'decentraland-dapps/dist/modules/profile/types'
import { NavbarProps } from 'decentraland-ui/dist/components/Navbar/Navbar'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Wallet } from 'modules/wallet/types'

export type Props = Partial<NavbarProps> & {
  isConnected: boolean
  isConnecting: boolean
  wallet?: Wallet | null
  pathname: string
  address?: string
  profile?: Profile
  onNavigate: (target: string) => void
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'pathname' | 'address' | 'wallet' | 'profile'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
