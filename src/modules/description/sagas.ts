import { put, call, select, fork, takeEvery } from 'redux-saga/effects'
import { describePath, decodeForwardingPath, App } from '@aragon/connect'
import { loadProposalDescriptionFailure, loadProposalDescriptionSuccess } from './actions'
import { getOrganization } from 'modules/organization/selectors'
import { Organization } from 'modules/organization/types'
import { ForwardingPathDescription, ProposalDescription, Annotation } from './types'
import { getData as getVoteDescriptions } from './selectors'
import { LOAD_PROPOSALS_SUCCESS, LoadProposalsSuccessAction } from 'modules/proposal/actions'
import { getApps } from 'modules/app/selectors'
import { isApp } from 'modules/app/utils'
import { Catalyst, BanName, POI } from 'modules/app/types'
import { concurrent } from 'modules/common/utils'
import { Proposal } from 'modules/proposal/types'

const EMPTY_SCRIPT = '0x00000001'

export function* voteDescriptionSaga() {
  yield takeEvery(LOAD_PROPOSALS_SUCCESS, loadProposalDescriptions)
}

function* loadProposalDescriptions(action: LoadProposalsSuccessAction) {
  const proposalDescriptions: Record<string, ProposalDescription> = yield select(getVoteDescriptions)
  for (const [id, proposal] of Object.entries(action.payload.votes)) {
    const proposalDescription = proposalDescriptions[id]
    if (proposal && !proposalDescription) {
      yield fork(loadProposalDescription, proposal)
    }
  }
}

function* loadProposalDescription(proposal: Proposal) {
  try {
    const org: Organization = yield select(getOrganization)
    const apps: App[] = yield select(getApps)

    const script = proposal.script || ''
    if (script.length < EMPTY_SCRIPT.length || script === EMPTY_SCRIPT) {
      yield put(loadProposalDescriptionSuccess({ [proposal.id]: {} }))
    } else {
      const describedSteps: ForwardingPathDescription['describedSteps'] = yield call(concurrent(() => {
        return describePath(decodeForwardingPath(proposal.script), apps, org.connection.ethersProvider)
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
                  const [x, y] = position.split(',').map(Number)
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

      yield put(loadProposalDescriptionSuccess({ [proposal.id]: { description, describedSteps, firstDescribedSteps, firstDescriptionAnnotated } }))
    }
  } catch (err) {
    yield put(loadProposalDescriptionFailure({ [proposal.id]: err.message }))
  }
}
