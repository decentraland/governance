import { all, takeLatest, call, select } from 'redux-saga/effects'
import { createWalletSaga } from 'decentraland-dapps/dist/modules/wallet/sagas'
// import { getEth } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { CONNECT_WALLET_SUCCESS, CHANGE_ACCOUNT, CHANGE_NETWORK } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getInjectedProvider } from 'decentraland-dapps/dist/providers/WalletProvider/utils'
import { STORAGE_LOAD } from 'decentraland-dapps/dist/modules/storage/actions'
import { MANAToken, LANDProxy, LANDRegistry, MANAMiniMeToken } from 'modules/common/contracts'
import { getNetwork } from './selectors'
import { Network } from './types'

const baseWalletSaga = createWalletSaga()

export function* walletSaga() {
  yield all([baseWalletSaga(), projectWalletSaga()])
}

function* projectWalletSaga() {
  yield takeLatest(CONNECT_WALLET_SUCCESS, getBalance)
  yield takeLatest(CHANGE_ACCOUNT, getBalance)
  yield takeLatest(CHANGE_NETWORK, getBalance)
  yield takeLatest(STORAGE_LOAD, getBalance)
}

function* getBalance () {
  const provider = getInjectedProvider()!

  if (provider) {
    try {
      const network: Network = yield select(getNetwork)
      const balance = yield call(() => Promise.all([
        provider.send('eth_getBalance', [ MANAToken[network], 'latest' ]),
        provider.send('eth_getBalance', [ MANAMiniMeToken[network], 'latest' ]),
        provider.send('eth_getBalance', [ LANDProxy[network], 'latest' ]),
        provider.send('eth_getBalance', [ LANDRegistry[network], 'latest' ])
      ]))
      console.log(balance)
    } catch (err) {
      console.log(err)
    }
  }
}
