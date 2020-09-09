import { put, call, takeEvery, select, fork } from 'redux-saga/effects'
import { Vote, Cast } from '@aragon/connect-voting'
import { LOAD_CASTS_REQUEST, LoadCastsRequestAction, loadCastsSuccess, loadCastsFailure } from './actions'
import { getData } from 'modules/vote/selectors'

export function* castSaga() {
  yield takeEvery(LOAD_CASTS_REQUEST, loadAllCasts)
}

function* loadAllCasts(action: LoadCastsRequestAction) {
  const votes: Record<string, Vote> = yield select(getData)
  for (const id of action.payload.votes) {
    const vote = votes[id]
    if (vote) {
      yield fork(loadCasts, vote)
    }
  }
}

function* loadCasts(vote: Vote) {
  try {
    const casts: Cast[] = yield call(() => vote.casts())
    yield put(loadCastsSuccess({ [vote.id]: casts }))
  } catch (err) {
    yield put(loadCastsFailure({ [vote.id]: err.message }))
  }
}
