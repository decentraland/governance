import { Network } from 'modules/wallet/types'

export enum NavigationTab {
  Proposals = 'proposals',
  Wrapping = 'wrapping'
}

export type Props = {
  activeTab?: NavigationTab
  isConnected?: boolean
  isFullscreen?: boolean
  network?: Network
}

export type MapStateProps = Pick<Props, 'network' | 'isConnected'>
export type MapDispatchProps = {}
export type MapDispatch = {}
