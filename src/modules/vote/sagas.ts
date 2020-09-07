import { put, call, takeLatest, select } from 'redux-saga/effects'
import { describeScript, App } from '@aragon/connect'
import connectVoting, { Voting, Vote as AragonVote } from '@aragon/connect-voting'
// import { ethers } from 'ethers'

import { loadVotesFailure, loadVotesSuccess, LOAD_VOTES_REQUEST } from './actions'
import { getOrganization } from 'modules/organization/selectors'
import { Organization } from 'modules/organization/types'
import { Vote } from './types'
import { loadAllVotes } from './utils'

export function* voteSaga() {
  yield takeLatest(LOAD_VOTES_REQUEST, loadVotes)
}

function* loadVotes() {
  try {
    const org: Organization = yield select(getOrganization)
    const apps: App[] = yield call(() => org.apps())
    const votingList: Voting[] = yield call(() => Promise.all(apps.filter(app => app.name === 'voting').map(app => connectVoting(app))))
    const allVotes: AragonVote[] = yield call(() => loadAllVotes(votingList))
    const votesWithDescription: Vote[] = yield call(() => {
      const loaders: Promise<Vote>[] = []
      for (const vote of allVotes) {

        const describe = describeScript(vote.script, apps)
        .then((scripts) => {
          const description = scripts.map(script => script.description).filter(Boolean).join('\n')
          return Object.assign(vote, { description }) as any
        })
        .catch((err) => {
          console.log(err)
          return Object.assign(vote, { description: err.message }) as any
        })

        const casts = vote.casts()
          .then((casted) => Object.assign(vote, { casted }) as any)
          .catch(console.error)

        loaders.push(Promise.all([describe, casts]).then(() => vote as any))
      }
      return Promise.all(loaders)
    })

    const record = {} as Record<string, Vote>
    for (const vote of votesWithDescription) {
      record[vote.id] = vote
    }

    yield put(loadVotesSuccess(record))
  } catch (e) {
    yield put(loadVotesFailure(e.message))
  }
}