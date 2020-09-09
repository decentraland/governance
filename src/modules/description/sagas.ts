import { put, call, select, fork, takeEvery } from 'redux-saga/effects'
import { describePath, decodeForwardingPath, App } from '@aragon/connect'
import { Vote } from '@aragon/connect-voting'
import { loadVoteDescriptionFailure, loadVoteDescriptionSuccess } from './actions'
import { getOrganization } from 'modules/organization/selectors'
import { Organization } from 'modules/organization/types'
import { ForwardingPathDescription, VoteDescription, Annotation } from './types'
import { getData as getVoteDescriptions } from './selectors'
import { concurrent } from './utils'
import { LOAD_VOTES_SUCCESS, LoadVotesSuccessAction } from 'modules/vote/actions'
import { getApps } from 'modules/app/selectors'

export function* voteDescriptionSaga() {
  yield takeEvery(LOAD_VOTES_SUCCESS, loadVotesDescriptions)
}

function* loadVotesDescriptions(action: LoadVotesSuccessAction) {
  const voteDescriptions: Record<string, VoteDescription> = yield select(getVoteDescriptions)
  for (const [id, vote] of Object.entries(action.payload.votes)) {
    const voteDescription = voteDescriptions[id]
    if (vote && !voteDescription) {
      yield fork(loadVoteDescription, vote)
    }
  }
}

function* loadVoteDescription(vote: Vote) {
  try {
    const org: Organization = yield select(getOrganization)
    const apps: App[] = yield select(getApps)
    const describedSteps: ForwardingPathDescription['describedSteps'] = yield call(concurrent(() => {
      return describePath(decodeForwardingPath(vote.script), apps, org.connection.ethersProvider)
    }))
    let firstDescribedSteps = describedSteps
    while (firstDescribedSteps.length && firstDescribedSteps[0].children) {
      firstDescribedSteps = firstDescribedSteps[0].children as any
    }

    let firstDescriptionAnnotated: Annotation[] = []
    for (const step of firstDescribedSteps) {
      if (step.annotatedDescription) {
        firstDescriptionAnnotated = firstDescriptionAnnotated.concat(step.annotatedDescription)
      }
    }

    const description = firstDescribedSteps
      .map((step) => step.description)
      .filter(Boolean)
      .join("\n")

    yield put(loadVoteDescriptionSuccess({ [vote.id]: { description, describedSteps, firstDescribedSteps, firstDescriptionAnnotated } }))
  } catch (err) {
    yield put(loadVoteDescriptionFailure({ [vote.id]: err.message }))
  }
}
