import { PayloadAction } from 'typesafe-actions/dist/types'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { select, takeEvery } from 'redux-saga/effects'
import { getData } from 'modules/wallet/selectors'

import { CONNECT_WALLET_FAILURE, CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { CREATE_CAST_FAILURE, CREATE_CAST_SUCCESS, LOAD_CASTS_FAILURE } from 'modules/cast/actions'
import { LOCATION_CHANGE } from 'connected-react-router'
import {
  ALLOW_ESTATE_FAILURE,
  ALLOW_ESTATE_REQUEST,
  ALLOW_ESTATE_SUCCESS,
  ALLOW_LAND_FAILURE,
  ALLOW_LAND_REQUEST,
  ALLOW_LAND_SUCCESS,
  ALLOW_MANA_FAILURE,
  ALLOW_MANA_REQUEST,
  ALLOW_MANA_SUCCESS,
  LOAD_BALANCE_SUCCESS,
  UNWRAP_MANA_FAILURE,
  UNWRAP_MANA_REQUEST,
  UNWRAP_MANA_SUCCESS,
  WRAP_MANA_FAILURE,
  WRAP_MANA_REQUEST,
  WRAP_MANA_SUCCESS
} from 'modules/wallet/actions'
import { LOAD_VOTES_FAILURE } from 'modules/vote/actions'
import { LOAD_APPS_FAILURE } from 'modules/app/actions'

export function* segmentSaga() {
  yield takeEvery(CONNECT_WALLET_SUCCESS, segmentTrack)
  yield takeEvery(CONNECT_WALLET_FAILURE, segmentTrack)
  yield takeEvery(CREATE_CAST_FAILURE, segmentTrack)
  yield takeEvery(CREATE_CAST_SUCCESS, segmentTrack)
  yield takeEvery(LOCATION_CHANGE, segmentTrack)
  yield takeEvery(LOAD_VOTES_FAILURE, segmentTrack)
  yield takeEvery(LOAD_CASTS_FAILURE, segmentTrack)
  yield takeEvery(LOAD_APPS_FAILURE, segmentTrack)
  yield takeEvery(LOAD_BALANCE_SUCCESS, segmentTrack)
  yield takeEvery(ALLOW_LAND_REQUEST, segmentTrack)
  yield takeEvery(ALLOW_LAND_SUCCESS, segmentTrack)
  yield takeEvery(ALLOW_LAND_FAILURE, segmentTrack)
  yield takeEvery(ALLOW_ESTATE_REQUEST, segmentTrack)
  yield takeEvery(ALLOW_ESTATE_SUCCESS, segmentTrack)
  yield takeEvery(ALLOW_ESTATE_FAILURE, segmentTrack)
  yield takeEvery(ALLOW_MANA_REQUEST, segmentTrack)
  yield takeEvery(ALLOW_MANA_SUCCESS, segmentTrack)
  yield takeEvery(ALLOW_MANA_FAILURE, segmentTrack)
  yield takeEvery(WRAP_MANA_REQUEST, segmentTrack)
  yield takeEvery(WRAP_MANA_SUCCESS, segmentTrack)
  yield takeEvery(WRAP_MANA_FAILURE, segmentTrack)
  yield takeEvery(UNWRAP_MANA_REQUEST, segmentTrack)
  yield takeEvery(UNWRAP_MANA_SUCCESS, segmentTrack)
  yield takeEvery(UNWRAP_MANA_FAILURE, segmentTrack)
}

function* segmentTrack(action: PayloadAction<string, Record<string, any>>) {
  const { type, payload } = action
  const name = getName(type)
  if (!name) {
    return
  }

  const wallet = yield select(getData)
  const data = {
    ...payload,
    ...wallet
  }

  getAnalytics().track(name, data)
}

function getName(type: string) {
  const match = type.match(/^\[(\w+)\](.+)$/i)
  if (match) {
    const [ , action, event ] = match
    return `${event} ${action}`.trim().toUpperCase().replace(/\W+/gi, '_')
  }
  return undefined
}
