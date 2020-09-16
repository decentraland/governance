import { connect } from 'react-redux'

import { RootState } from 'modules/root/types'
import { getData as getVoteDescription } from 'modules/description/selectors'
import ProposalTitle from './ProposalTitle'
import { MapDispatchProps, MapStateProps, MapDispatch, DefaultProps } from './ProposalTitle.types'
import { getNetwork } from 'modules/wallet/selectors'

const mapState = (state: RootState, props: DefaultProps): MapStateProps => {
  const description = props.proposal && getVoteDescription(state)[props.proposal.id]

  return {
    description,
    network: getNetwork(state)
  }
}

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(ProposalTitle)
