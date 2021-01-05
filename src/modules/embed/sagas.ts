import { put, call, select, takeEvery, fork } from 'redux-saga/effects'
import linkify from 'react-linkify/dist/decorators/defaultMatchDecorator'
import { getData as getProposals } from 'modules/proposal/selectors'
import { AggregatedVote, Proposal } from 'modules/proposal/types'
import { loadEmbedFailure, LoadEmbedRequestAction, loadEmbedSuccess, LOAD_EMBED_REQUEST } from './actions'
import { Embed } from './types'
import { getData as getProposalEmbeds } from './selectors'
import { getEmbed } from './utils'

export function* proposalEmbedSaga() {
  yield takeEvery(LOAD_EMBED_REQUEST, loadProposalEmbeds)
}

function* loadProposalEmbeds(action: LoadEmbedRequestAction) {
  const proposals: Record<string, Proposal> = yield select(getProposals)
  const proposalEmbeds: Record<string, Embed[]> = yield select(getProposalEmbeds)
  for (const id of action.payload.proposals) {
    const proposal = proposals[id]
    const embeds = proposalEmbeds[id]
    if (proposal && !embeds) {
      yield fork(loadProposalEmbed, proposal)
    } else {
      yield put(loadEmbedSuccess({ [id]: embeds }))
    }
  }
}

function* loadProposalEmbed(proposal: Proposal) {
  try {

    const metadata = ((proposal as AggregatedVote).metadata || '').trim()
    if (!metadata) {
      yield put(loadEmbedSuccess({ [proposal.id]: [] }))
      return
    }

    const links = linkify(metadata)
    if (!links) {
      yield put(loadEmbedSuccess({ [proposal.id]: [] }))
      return
    }

    const embed = yield call(async () => Promise.all(
      links.map(link => getEmbed(link.url))
    ))

    yield put(loadEmbedSuccess({ [proposal.id]: embed.filter(Boolean) }))
  } catch (err) {
    yield put(loadEmbedFailure({ [proposal.id]: err.message }))
  }
}
