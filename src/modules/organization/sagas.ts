import { put, call, takeLatest, select } from 'redux-saga/effects'
import { connect } from '@aragon/connect'
import { loadOrganizationFailure, loadOrganizationSuccess, LOAD_ORGANIZATION_REQUEST, loadOrganizationRequest } from './actions'
import { CHANGE_ACCOUNT, CHANGE_NETWORK } from 'decentraland-dapps/dist/modules/wallet/actions'
import { STORAGE_LOAD } from 'decentraland-dapps/dist/modules/storage/actions'
import { getNetwork } from 'modules/wallet/selectors'
import { ORGANIZATION_LOCATION, ORGANIZATION_CONNECTOR, Organization } from './types'
import { Network } from 'modules/wallet/types'

export function* organizationSaga() {
  yield takeLatest(LOAD_ORGANIZATION_REQUEST, connectAragon)
  yield takeLatest(STORAGE_LOAD, connectAragon)
  yield takeLatest(CHANGE_ACCOUNT, reconnectAragon)
  yield takeLatest(CHANGE_NETWORK, reconnectAragon)
}

function* reconnectAragon() {
  yield put(loadOrganizationRequest())
}

function* connectAragon() {
  try {
    const network: Network = yield select(getNetwork)

    const organization: Organization = yield call(() => connect(
      ORGANIZATION_LOCATION[network],
      ORGANIZATION_CONNECTOR[network],
      { network }
    ))

    yield put(loadOrganizationSuccess(organization))
  } catch (e) {
    yield put(loadOrganizationFailure(e.message))
  }
}
