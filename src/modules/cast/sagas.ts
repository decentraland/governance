import { put, call, takeEvery, select, fork } from 'redux-saga/effects'
import { Vote, Cast } from '@aragon/connect-voting'
import { LOAD_CASTS_REQUEST, LoadCastsRequestAction, loadCastsSuccess, loadCastsFailure, CREATE_CAST_REQUEST, CreateCastRequestAction, createCastFailure, createCastSuccess } from './actions'
import { getData as getVotes } from 'modules/vote/selectors'
import { getData as getApps } from 'modules/app/selectors'
import { getVoteIdDetails, getVoteUrl } from 'modules/vote/utils'
import { App } from '@aragon/connect'
import { getQuery } from 'routing/selectors'
import { push } from 'connected-react-router'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getProvider } from 'modules/wallet/selectors'
import { Web3Provider } from '@ethersproject/providers'

export function* castSaga() {
  yield takeEvery(LOAD_CASTS_REQUEST, loadAllCasts)
  yield takeEvery(CREATE_CAST_REQUEST, createCast)
}

function* loadAllCasts(action: LoadCastsRequestAction) {
  const votes: Record<string, Vote> = yield select(getVotes)
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

function* createCast(action: CreateCastRequestAction) {
  const { voteId, support } = action.payload
  const votes: Record<string, Vote> = yield select(getVotes)
  const vote = votes[action.payload.voteId]
  if (!vote) {
    yield yield put(createCastFailure({ [voteId]: `Missing vote "${voteId}"` }))
    return
  }

  const details = getVoteIdDetails(vote)
  const apps: Record<string, App> = yield select(getApps)
  const app = apps[details.appAddress]
  if (!app) {
    yield yield put(createCastFailure({ [voteId]: `Missing app "${details.appAddress}"` }))
    return
  }

  try {
    const actAs: string = yield select(getAddress)
    const provider: Web3Provider = yield select(getProvider)

    const tx = yield call(async () => {
      const path = await app.intent('vote', [ details.voteId, support, true ], { actAs })
      return path.sign((tx) => provider.send('eth_sendTransaction', [tx]))
    })
    yield put(createCastSuccess([ tx ]))

    const query: Record<string, string> = yield select(getQuery)
    yield put(push(getVoteUrl(vote, { ...query, completed: true })))

  } catch (err) {
    yield put(createCastFailure({ [vote.id]: err.message }))
  }
}
