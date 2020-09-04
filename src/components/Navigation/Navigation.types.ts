import { Network } from 'modules/wallet/types'

export enum NavigationTab {
  Proposals = 'proposals',
  Wrapping = 'wrapping'
}

export type Props = {
  activeTab?: NavigationTab
  isFullscreen?: boolean
  network?: Network
}

export type MapStateProps = Pick<Props, 'network'>
export type MapDispatchProps = {}
export type MapDispatch = {}
