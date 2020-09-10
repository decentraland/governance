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
import { isApp } from 'modules/app/utils'
import { Catalyst, BanName, POI } from 'modules/app/types'

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

    let firstDescriptionAnnotated: Annotation[][] = []
    for (const step of firstDescribedSteps) {
      if (step.annotatedDescription) {
        const newAnnotatedDescription: Annotation[] = (step.annotatedDescription || [])
          .flatMap((annotation, i) => {
            switch (true) {
              case isApp(step.to, POI) && i === 0: {
                const [first, position, last] = annotation.value.split('"', 3)
                const [ x, y ] = position.split(',').map(Number)
                return [
                  { type: 'text', value: first },
                  { type: 'dcl:position', value: { position, x, y } },
                  { type: 'text', value: last.slice(0, last.indexOf('.')) }
                ]
              }
              case isApp(step.to, BanName) && i === 0: {
                const [first, name, last] = annotation.value.split('"', 3)
                return [
                  { type: 'text', value: first },
                  { type: 'dcl:name', value: name },
                  { type: 'text', value: last }
                ]
              }
              case isApp(step.to, Catalyst) && annotation.value.startsWith('and domain '): {
                return [
                  { type: 'text', value: 'and domain ' },
                  { type: 'dcl:domain', value: annotation.value.slice('and domain '.length) }
                ]
              }
              default:
                return annotation
            }
          }) as any

        firstDescriptionAnnotated.push(newAnnotatedDescription)
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
