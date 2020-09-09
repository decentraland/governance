import { put, call, takeLatest, select } from 'redux-saga/effects'
import { App } from '@aragon/connect'
import connectVoting, { Voting, Vote } from '@aragon/connect-voting'
import { getOrganization } from 'modules/organization/selectors'
import { Organization } from 'modules/organization/types'
import { loadVoteDescriptionRequest } from 'modules/description/actions'
import { getData as getVoteDescription } from 'modules/description/selectors'
import { loadVotesFailure, loadVotesSuccess, LOAD_VOTES_REQUEST, loadVotesRequest } from './actions'
import { VoteDescription } from 'modules/description/types'
import { LOAD_APPS_SUCCESS } from 'modules/app/actions'

export function* voteSaga() {
  yield takeLatest(LOAD_APPS_SUCCESS, reloadVotes)
  yield takeLatest(LOAD_VOTES_REQUEST, loadVotes)
}

function* reloadVotes() {
  yield put(loadVotesRequest())
}

function* loadVotes() {
  try {
    const org: Organization = yield select(getOrganization)
    const voteDescriptions: Record<string, VoteDescription> = yield select(getVoteDescription)
    const votingApps: App[] = yield call(async () => org.apps(['voting', 'delay' ]))
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
