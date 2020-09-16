import { connect } from 'react-redux'
import { push, replace } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

import { RootState } from 'modules/root/types'
import { getLoading as getLoadingOrganization } from 'modules/organization/selectors'
import { getLoading as getLoadingApps } from 'modules/app/selectors'
import { LOAD_APPS_REQUEST } from 'modules/app/actions'
import { getLoading as getLoadingVotes } from 'modules/proposal/selectors'
import { LOAD_PROPOSALS_REQUEST } from 'modules/proposal/actions'
import { getData as getVoteDescription, getError as getVoteDescriptionError } from 'modules/description/selectors'
import ProposalSummary from './ProposalSummary'
import { MapDispatchProps, MapStateProps, MapDispatch, DefaultProps } from './ProposalSummary.types'

const mapState = (state: RootState, props: DefaultProps): MapStateProps => {
  const description = props.proposal && getVoteDescription(state)[props.proposal.id]
  const descriptionError = props.proposal && getVoteDescriptionError(state)[props.proposal.id]

  return {
    description,
    descriptionError,
    isLoading: (
      getLoadingOrganization(state) ||
      isLoadingType(getLoadingApps(state), LOAD_APPS_REQUEST) ||
      isLoadingType(getLoadingVotes(state), LOAD_PROPOSALS_REQUEST)
    )
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: (href: string, r: boolean = false) => dispatch(r ? replace(href) : push(href))
})

export default connect(mapState, mapDispatch)(ProposalSummary)
