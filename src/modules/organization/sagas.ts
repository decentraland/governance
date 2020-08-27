import { put, call, takeLatest } from 'redux-saga/effects'
import { connect } from '@aragon/connect'
import { loadOrganizationFailure, loadOrganizationSuccess, LOAD_ORGANIZATION_REQUEST } from './actions'
import { STORAGE_LOAD } from 'decentraland-dapps/dist/modules/storage/actions'
import { env } from 'decentraland-commons'
import { loadAppsRequest } from 'modules/app/actions'

const ORGANIZATION_LOCATION = env.get('REACT_APP_ORGANIZATION_LOCATION', '')
const ORGANIZATION_CONNECTOR = env.get('REACT_APP_ORGANIZATION_CONNECTOR', '')
const ORGANIZATION_NETWORK = Number(env.get('REACT_APP_ORGANIZATION_NETWORK', 4))

export function* organizationSaga() {
  yield takeLatest(STORAGE_LOAD, connectAragon)
  yield takeLatest(LOAD_ORGANIZATION_REQUEST, connectAragon)
}

function* connectAragon() {
  try {
    const organization = yield call(() => connect(ORGANIZATION_LOCATION, ORGANIZATION_CONNECTOR, {
      network: ORGANIZATION_NETWORK,
    }))
    yield put(loadOrganizationSuccess(organization))
    yield put(loadAppsRequest())
  } catch (e) {
    yield put(loadOrganizationFailure(e.message))
  }
}
