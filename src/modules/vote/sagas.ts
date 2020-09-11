import { put, call, takeLatest, select } from 'redux-saga/effects'
import { App } from '@aragon/connect'
import connectVoting, { Voting, Vote } from '@aragon/connect-voting'
import { loadVoteDescriptionRequest } from 'modules/description/actions'
import { getData as getVoteDescription } from 'modules/description/selectors'
import { getData as getApps } from 'modules/app/selectors'
import {
  loadVotesFailure,
  loadVotesSuccess,
  LOAD_VOTES_REQUEST,
  loadVotesRequest,
  CREATE_BAN_REQUEST,
  CREATE_CATALYST_REQUEST,
  CREATE_POI_REQUEST,
  CREATE_QUESTION_REQUEST,
  CreateBanRequestAction,
  CreateQuestionRequestAction,
  CreateCatalystRequestAction,
  CreatePoiRequestAction,
  createBanFailure,
  createQuestionFailure,
  createCatalystFailure,
  createPoiFailure,
  createQuestionSuccess,
  createCatalystSuccess,
  createPoiSuccess,
  createBanSuccess
} from './actions'
import { VoteDescription } from 'modules/description/types'
import { LOAD_APPS_SUCCESS } from 'modules/app/actions'
import { SAB, COMMUNITY, INBOX, Delay, BanName, Catalyst, POI } from 'modules/app/types'
import { getNetwork, getProvider } from 'modules/wallet/selectors'
import { Network } from 'modules/wallet/types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Web3Provider } from '@ethersproject/providers'
import { push } from 'connected-react-router'
import { locations } from 'routing/locations'
import { getQuery } from 'routing/selectors'

export function* voteSaga() {
  yield takeLatest(LOAD_APPS_SUCCESS, reloadVotes)
  yield takeLatest(LOAD_VOTES_REQUEST, loadVotes)
  yield takeLatest(CREATE_QUESTION_REQUEST, createQuestion)
  yield takeLatest(CREATE_BAN_REQUEST, createBan)
  yield takeLatest(CREATE_CATALYST_REQUEST, createCatalyst)
  yield takeLatest(CREATE_POI_REQUEST, createPoi)
}

function* reloadVotes() {
  yield put(loadVotesRequest())
}

function* loadVotes() {
  try {
    const network: Network = yield select(getNetwork)
    const voteDescriptions: Record<string, VoteDescription> = yield select(getVoteDescription)
    const apps: Record<string, App> = yield select(getApps)
    const votingApps: App[] = [
      apps[SAB[network]],
      apps[COMMUNITY[network]],
      apps[INBOX[network]],
      apps[Delay[network]]
    ]

    const aragonVoting: Voting[] = yield call(() => Promise.all(votingApps.map(app => connectVoting(app as any))))

    const votes: Vote[] = yield call(async () => {
      let result: Vote[] = []
      for (const voting of aragonVoting) {
        const newVotes = await voting.votes()
        result = result.concat(newVotes)
      }

      return result
    })

    const record = {} as Record<string, Vote>
    for (const vote of votes) {
      record[vote.id] = vote
    }

    yield put(loadVotesSuccess(record))

    const pendingVotes = votes
      .filter((vote) => !voteDescriptions[vote.id])
      .sort((voteA, voteB) => Number(voteB.startDate) - Number(voteA.startDate))
      .map(vote => vote.id)

    yield put(loadVoteDescriptionRequest(pendingVotes))
  } catch (e) {
    yield put(loadVotesFailure(e.message))
  }
}

function* createQuestion(action: CreateQuestionRequestAction) {
  try {
    const script = '0x00000001'
    const actAs: string = yield select(getAddress)
    const provider: Web3Provider = yield select(getProvider)
    const network: Network = yield select(getNetwork)
    const apps: Record<string, App> = yield select(getApps)
    const app = apps[INBOX[network]]

    yield call(async () => {
      const path = await app.intent('newVote', [script, action.payload.question, false, false], { actAs })
      return path.sign((tx) => provider.send('eth_sendTransaction', [tx]))
    })

    yield put(createQuestionSuccess())

    const query: Record<string, string> = yield select(getQuery)
    yield put(push(locations.root({ ...query, completed: true })))
  } catch (err) {
    yield put(createQuestionFailure(err.message))
  }
}

function* createBan(action: CreateBanRequestAction) {
  try {
    const actAs: string = yield select(getAddress)
    const provider: Web3Provider = yield select(getProvider)
    const network: Network = yield select(getNetwork)
    const apps: Record<string, App> = yield select(getApps)
    const app = apps[BanName[network]]

    yield call(async () => {
      const path = await app.intent('add', [action.payload.name], { actAs })
      return path.sign((tx) => provider.send('eth_sendTransaction', [tx]))
    })

    yield put(createBanSuccess())

    const query: Record<string, string> = yield select(getQuery)
    yield put(push(locations.root({ ...query, completed: true })))
  } catch (err) {
    yield put(createBanFailure(err.message))
  }
}

function* createCatalyst(action: CreateCatalystRequestAction) {
  try {
    const { owner, url } = action.payload
    const actAs: string = yield select(getAddress)
    const provider: Web3Provider = yield select(getProvider)
    const network: Network = yield select(getNetwork)
    const apps: Record<string, App> = yield select(getApps)
    const app = apps[Catalyst[network]]

    yield call(async () => {
      const path = await app.intent('addCatalyst', [owner, url], { actAs })
      return path.sign((tx) => provider.send('eth_sendTransaction', [tx]))
    })

    yield put(createCatalystSuccess())

    const query: Record<string, string> = yield select(getQuery)
    yield put(push(locations.root({ ...query, completed: true })))
  } catch (err) {
    yield put(createCatalystFailure(err.message))
  }
}

function* createPoi(action: CreatePoiRequestAction) {
  try {
    const { x,y } = action.payload
    const actAs: string = yield select(getAddress)
    const provider: Web3Provider = yield select(getProvider)
    const network: Network = yield select(getNetwork)
    const apps: Record<string, App> = yield select(getApps)
    const app = apps[POI[network]]

    yield call(async () => {
      const path = await app.intent('add', [[x,y].join(',')], { actAs })
      return path.sign((tx) => provider.send('eth_sendTransaction', [tx]))
    })

    yield put(createPoiSuccess())

    const query: Record<string, string> = yield select(getQuery)
    yield put(push(locations.root({ ...query, completed: true })))
  } catch (err) {
    yield put(createPoiFailure(err.message))
  }
}
