import { put, call, takeLatest, select, all } from 'redux-saga/effects'
import { App } from '@aragon/connect'
import { loadProposalDescriptionRequest } from 'modules/description/actions'
import { getData as getVoteDescription } from 'modules/description/selectors'
import { getData as getApps } from 'modules/app/selectors'
import { ProposalDescription } from 'modules/description/types'
import { LOAD_APPS_SUCCESS } from 'modules/app/actions'
import { SAB, COMMUNITY, INBOX, BanName, Catalyst, POI } from 'modules/app/types'
import { getNetwork, getProvider } from 'modules/wallet/selectors'
import { Network } from 'modules/wallet/types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Web3Provider } from '@ethersproject/providers'
import { replace } from 'connected-react-router'
import { locations } from 'routing/locations'
import { getNewProposalParams } from 'routing/selectors'
import { NewProposalParams } from 'routing/types'
import { /* subscribeDelayingRequest, */ subscribeVotingRequest } from 'modules/subscription/actions'
import {
  loadProposalsFailure,
  loadProposalsSuccess,
  LOAD_PROPOSALS_REQUEST,
  loadProposalsRequest,
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
  createBanSuccess,
  EXECUTE_SCRIPT_REQUEST,
  ExecuteScriptRequestAction,
  executeScriptFailure,
  executeScriptSuccess,
  EXECUTE_VOTE_REQUEST,
  ExecuteVoteRequestAction,
  executeVoteSuccess,
  executeVoteFailure
} from './actions'
import { AggregatedDelayedScript, AggregatedVote, Proposal, Voting } from './types'
import { createVoting, getProposalIdentifier, loadDelayScriptsOnChain, loadVotes } from './utils'
import { flatArray } from 'modules/common/utils'
import { getDelayContract } from 'modules/common/selectors'
import { Contract, ethers } from 'ethers'
import { Transaction } from 'decentraland-dapps/dist/modules/transaction/types'

export function* proposalSaga() {
  yield takeLatest(LOAD_APPS_SUCCESS, reloadProposals)
  yield takeLatest(LOAD_PROPOSALS_REQUEST, loadProposals)
  yield takeLatest(CREATE_QUESTION_REQUEST, createQuestion)
  yield takeLatest(CREATE_BAN_REQUEST, createBan)
  yield takeLatest(CREATE_CATALYST_REQUEST, createCatalyst)
  yield takeLatest(CREATE_POI_REQUEST, createPoi)
  yield takeLatest(EXECUTE_SCRIPT_REQUEST, executeScript)
  yield takeLatest(EXECUTE_VOTE_REQUEST, executeVote)
}

function* reloadProposals() {
  yield put(loadProposalsRequest())
}

function* loadProposals(): any {
  try {
    const network: Network = yield select(getNetwork)
    const voteDescriptions: Record<string, ProposalDescription> = yield select(getVoteDescription)
    const delayContract: Contract = yield select(getDelayContract)
    const apps: Record<string, App> = yield select(getApps)
    const sabApp = apps[SAB[network]]
    const communityApp = apps[COMMUNITY[network]]
    const inboxApp = apps[INBOX[network]]

    // const delayApp = apps[Delay[network]]
    // const scriptDelaying = yield call(createDelaying, delayApp)
    // const scripts = yield call(loadDelayScripts, scriptDelaying)
    // console.log(delayApp, scriptDelaying, scripts)

    const [
      sabVoting,
      communityVoting,
      inboxVoting // ,
      // scriptDelaying
    ]: [ Voting, Voting, Voting /*, Delaying */ ] = yield all([
      call(createVoting, sabApp),
      call(createVoting, communityApp),
      call(createVoting, inboxApp)// ,
      // call(createDelaying, delayApp)
    ])

    const [
      sabVotes,
      communityVotes,
      inboxVotes,
      delayScripts
    ]: [ AggregatedVote[], AggregatedVote[], AggregatedVote[], AggregatedDelayedScript[] ] = yield all([
      call(loadVotes, sabVoting),
      call(loadVotes, communityVoting),
      call(loadVotes, inboxVoting),
      // call(loadDelayScripts, scriptDelaying)
      call(loadDelayScriptsOnChain, delayContract)
    ])

    const proposals = flatArray<Proposal>([sabVotes, communityVotes, inboxVotes, delayScripts])
    const record: Record<string, Proposal> = Object.fromEntries(proposals.map(vote => [vote.id, vote]))
    yield put(loadProposalsSuccess(record))

    const pendingVotes = proposals
      .filter((vote) => !voteDescriptions[vote.id])
      .map(vote => vote.id)

    yield put(loadProposalDescriptionRequest(pendingVotes))
    // console.log(delayScripts)

    // Subscription
    yield put(subscribeVotingRequest({
      [sabApp.address]: sabVoting,
      [communityApp.address]: communityVoting,
      [inboxApp.address]: inboxVoting
    }))

    // yield put(subscribeDelayingRequest({
    //   [delayApp.address]: scriptDelaying
    // }))

  } catch (e) {
    yield put(loadProposalsFailure(e.message))
  }
}

export function* updateProposal(vote: AggregatedVote) {
  yield put(loadProposalsSuccess({ [vote.id]: vote }))
}

function* createQuestion(action: CreateQuestionRequestAction) {
  try {
    const script = '0x00000001'
    const actAs: string = yield select(getAddress)
    const provider: Web3Provider = yield select(getProvider)
    const network: Network = yield select(getNetwork)
    const apps: Record<string, App> = yield select(getApps)
    const app = apps[COMMUNITY[network]]

    yield call(async () => {
      const path = await app.intent('newVote', [script, action.payload.question], { actAs })
      return path.sign((tx) => provider.send('eth_sendTransaction', [tx]))
    })

    yield put(createQuestionSuccess())
    const query: NewProposalParams = yield select(getNewProposalParams)
    yield put(replace(locations.root({ ...query, completed: true })))
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
    const query: NewProposalParams = yield select(getNewProposalParams)
    yield put(replace(locations.root({ ...query, completed: true })))
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

    const query: NewProposalParams = yield select(getNewProposalParams)
    yield put(replace(locations.root({ ...query, completed: true })))
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

    const query: NewProposalParams = yield select(getNewProposalParams)
    yield put(replace(locations.root({ ...query, completed: true })))
  } catch (err) {
    yield put(createPoiFailure(err.message))
  }
}

function* executeVote(action: ExecuteVoteRequestAction) {
  const { appAddress, voteId } = getProposalIdentifier({ id: action.payload.voteId || '' })

  try {
    const apps: Record<string, App> = yield select(getApps)
    const app = apps[appAddress]
    const provider: ethers.providers.Web3Provider | undefined = yield select(getProvider)
    const contract = new Contract(app.address, app.abi, provider?.getSigner(0))
    const tx: Transaction = yield call(() => contract.executeVote(voteId))
    yield put(executeVoteSuccess(action.payload.voteId, tx.hash))
  } catch (err) {
    yield put(executeVoteFailure(err.message))
  }
}

function* executeScript(action: ExecuteScriptRequestAction) {
  const { scriptId } = getProposalIdentifier({ id: action.payload.scriptId || '' })

  try {
    const delayContract: Contract = yield select(getDelayContract)
    const tx: Transaction = yield call(() => delayContract.execute(scriptId))
    yield put(executeScriptSuccess(action.payload.scriptId, tx.hash))
  } catch (err) {
    yield put(executeScriptFailure(err.message))
  }
}
