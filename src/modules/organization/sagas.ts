import { put, call, takeLatest, select } from 'redux-saga/effects'
import { connect } from '@aragon/connect'
import { CHANGE_ACCOUNT, CHANGE_NETWORK } from 'decentraland-dapps/dist/modules/wallet/actions'
import { STORAGE_LOAD } from 'decentraland-dapps/dist/modules/storage/actions'
import { getProvider } from 'decentraland-dapps/dist/lib/eth'
import { loadOrganizationFailure, loadOrganizationSuccess, LOAD_ORGANIZATION_REQUEST, loadOrganizationRequest } from './actions'
import { getNetwork } from 'modules/wallet/selectors'
import { ORGANIZATION_LOCATION, ORGANIZATION_CONNECTOR, ORGANIZATION_OPTIONS, Organization } from './types'
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
    const ethereum = yield call(getProvider)

    const organization: Organization = yield call(() => connect(
      ORGANIZATION_LOCATION[network],
      ORGANIZATION_CONNECTOR[network],
      {
        ...ORGANIZATION_OPTIONS[network],
        ethereum: ethereum || undefined
      }
    ))

    yield put(loadOrganizationSuccess(organization))
  } catch (e) {
    yield put(loadOrganizationFailure(e.message))
  }
}
