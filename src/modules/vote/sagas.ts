import { put, call, takeLatest, select } from 'redux-saga/effects'
import connectVoting, { Voting, Vote as AragonVote } from '@aragon/connect-voting'
import { loadVotesFailure, loadVotesSuccess, LOAD_VOTES_REQUEST } from './actions'
import { getOrganization } from 'modules/organization/selectors'
import { Organization } from 'modules/organization/types'
import { Vote } from './types'
import { App } from '@aragon/connect'

export function* voteSaga() {
  yield takeLatest(LOAD_VOTES_REQUEST, loadVotes)
}

function* loadVotes() {
  try {
    const org: Organization = yield select(getOrganization)
    const votingApps: App[] = yield call(() => org.apps('voting'))
    const aragonVoting: Voting[] = yield call(() => Promise.all(votingApps.map(app => connectVoting(app as any))))
    const aragonVotes: AragonVote[] = yield call(async () => {
      let votes: AragonVote[] = []
      for (const voting of aragonVoting) {
        const newVotes = await voting.votes()
        votes = votes.concat(newVotes)
      }
      return votes
    })

    const votes: Vote[] = yield call(() => {
      const aggregators: Promise<Vote>[] = []
      for (const vote of aragonVotes) {

        const aggregator: Promise<any>[] = []
        aggregator.push(org.describeScript(vote.script)
          .then((descriptionPath) => {
            const description = descriptionPath.describedSteps
              .map((step) => step.description)
              .filter(Boolean)
              .join("\n")

            Object.assign(vote, { description, descriptionPath })
          })
          .catch(console.error)
        )

        aggregator.push(vote.casts()
          .then((casted) => Object.assign(vote, { casted }))
          .catch(console.error)
        )

        aggregators.push(Promise.all(aggregator).then(() => vote))
      }

      return Promise.all(aggregators)
    })

    const record = {} as Record<string, Vote>
    for (const vote of votes) {
      record[vote.id] = vote
    }

    yield put(loadVotesSuccess(record))
  } catch (e) {
    yield put(loadVotesFailure(e.message))
  }
}