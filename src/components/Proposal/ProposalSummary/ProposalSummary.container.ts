import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

import { RootState } from 'modules/root/types'
import { /* getData, */ getLoading as getLoadingOrganization } from 'modules/organization/selectors'
import { getData as getApps, getLoading as getLoadingApps } from 'modules/app/selectors'
import { LOAD_APPS_REQUEST } from 'modules/app/actions'
import { getLoading as getLoadingVotes } from 'modules/vote/selectors'
import { LOAD_VOTES_REQUEST } from 'modules/vote/actions'
import { getData as getVoteDescription, getError as getVoteDescriptionError } from 'modules/description/selectors'
import ProposalSummary from './ProposalSummary'
import { MapDispatchProps, MapStateProps, MapDispatch, DefaultProps } from './ProposalSummary.types'

const mapState = (state: RootState, props: DefaultProps): MapStateProps => {
  const address = '' as any // props.vote.appAddress
  const app = props.vote && getApps(state)[address]
  const creator = props.vote && getApps(state)[props.vote.creator]
  const description = props.vote && getVoteDescription(state)[props.vote.id]
  const descriptionError = props.vote && getVoteDescriptionError(state)[props.vote.id]

  return {
    app,
    creator,
    description,
    descriptionError,
    isLoading: (
      getLoadingOrganization(state) ||
      isLoadingType(getLoadingApps(state), LOAD_APPS_REQUEST) ||
      isLoadingType(getLoadingVotes(state), LOAD_VOTES_REQUEST)
    )
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: (href: string) => dispatch(push(href))
})

export default connect(mapState, mapDispatch)(ProposalSummary)
