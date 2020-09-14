import { PayloadAction } from 'typesafe-actions/dist/types'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { select, takeEvery } from 'redux-saga/effects'
import { getData } from 'modules/wallet/selectors'

import { ConnectWalletSuccessAction, CONNECT_WALLET_FAILURE, CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { CREATE_CAST_FAILURE, CREATE_CAST_REQUEST, CREATE_CAST_SUCCESS, LOAD_CASTS_FAILURE } from 'modules/cast/actions'
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
import {
  CREATE_BAN_FAILURE,
  CREATE_BAN_REQUEST,
  CREATE_BAN_SUCCESS,
  CREATE_CATALYST_FAILURE,
  CREATE_CATALYST_REQUEST,
  CREATE_CATALYST_SUCCESS,
  CREATE_POI_REQUEST,
  CREATE_POI_FAILURE,
  CREATE_POI_SUCCESS,
  CREATE_QUESTION_REQUEST,
  CREATE_QUESTION_FAILURE,
  CREATE_QUESTION_SUCCESS,
  LOAD_VOTES_FAILURE
} from 'modules/vote/actions'
import { LOAD_APPS_FAILURE } from 'modules/app/actions'

export function* segmentSaga() {
  yield takeEvery(CONNECT_WALLET_SUCCESS, segmentIdentify)
  yield takeEvery(CONNECT_WALLET_FAILURE, segmentTrack)
  yield takeEvery(CREATE_CAST_REQUEST, segmentTrack)
  yield takeEvery(CREATE_CAST_FAILURE, segmentTrack)
  yield takeEvery(CREATE_CAST_SUCCESS, segmentTrack)
  yield takeEvery(CREATE_BAN_REQUEST, segmentTrack)
  yield takeEvery(CREATE_BAN_SUCCESS, segmentTrack)
  yield takeEvery(CREATE_BAN_FAILURE, segmentTrack)
  yield takeEvery(CREATE_CATALYST_REQUEST, segmentTrack)
  yield takeEvery(CREATE_CATALYST_SUCCESS, segmentTrack)
  yield takeEvery(CREATE_CATALYST_FAILURE, segmentTrack)
  yield takeEvery(CREATE_POI_REQUEST, segmentTrack)
  yield takeEvery(CREATE_POI_FAILURE, segmentTrack)
  yield takeEvery(CREATE_POI_SUCCESS, segmentTrack)
  yield takeEvery(CREATE_QUESTION_REQUEST, segmentTrack)
  yield takeEvery(CREATE_QUESTION_FAILURE, segmentTrack)
  yield takeEvery(CREATE_QUESTION_SUCCESS, segmentTrack)
  yield takeEvery(CREATE_CAST_SUCCESS, segmentTrack)
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

function segmentIdentify(action: ConnectWalletSuccessAction) {
  getAnalytics().identify(action.payload.wallet.address)
}

function* segmentTrack(action: PayloadAction<string, Record<string, any>>) {
  const { type, payload } = action
  const name = getName(type)
  if (!name) {
    return
  }

  const wallet = yield select(getData)
  console.log(wallet)
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
