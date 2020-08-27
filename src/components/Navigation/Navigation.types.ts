export enum NavigationTab {
  Proposals = 'proposals',
  Wrapping = 'wrapping'
}

export type Props = {
  activeTab?: NavigationTab
  isFullscreen?: boolean
}

export type MapStateProps = {}
export type MapDispatchProps = {}
