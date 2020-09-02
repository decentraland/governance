import { put, call, takeLatest, select } from 'redux-saga/effects'
import { describeScript, App } from '@aragon/connect'
import { Voting } from '@aragon/connect-thegraph-voting'
// import { ethers } from 'ethers'

import { loadVotesFailure, loadVotesSuccess, LOAD_VOTES_REQUEST } from './actions'
import { getOrganization } from 'modules/organization/selectors'
import { Organization } from 'modules/organization/types'
import { getVoting, getVotingApps } from 'modules/app/selectors'
import { Vote, AragonVote } from './types'

export function* voteSaga() {
  yield takeLatest(LOAD_VOTES_REQUEST, loadVotes)
}

function* loadVotes() {
  try {
    const org: Organization = yield select(getOrganization)
    const votingApps: App[] = yield select(getVotingApps)
    const votingList: Voting[] = yield select(getVoting)
    const votesPerVoting: AragonVote[][] = yield call(() => Promise.all(votingList.map(voting => voting.votes())))
    const votesWithDescription: Vote[] = yield call(() => {
      const loaders: Promise<Vote>[] = []
      for (const votes of votesPerVoting) {
        for (const vote of votes) {
          const loader = describeScript(vote.script, votingApps, org.connection.ethersProvider)
          .then((scripts) => {
            const description = scripts.map(script => script.description).filter(Boolean).join('\n')
            return Object.assign(vote, { description }) as any
          })

          loaders.push(loader)
        }
      }
      return Promise.all(loaders)
    })

    const record = {} as Record<string, Vote>
    for (const vote of votesWithDescription) {
      record[vote.id] = vote
    }

    // const intet = org.appIntent(votingApps[0].address, 'vote', ['11', true, true])
    // const path = yield call(() => intet.paths('0x8Cff6832174091DAe86F0244e3Fd92d4CeD2Fe07'))
    // for (const transaction of path.transactions) {
    //   yield call(() => provider.sendTransaction(transaction))
    // }

    yield put(loadVotesSuccess(record))
  } catch (e) {
    yield put(loadVotesFailure(e.message))
  }
}
