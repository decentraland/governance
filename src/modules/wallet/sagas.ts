import { all, takeLatest } from 'redux-saga/effects'
import { createWalletSaga } from 'decentraland-dapps/dist/modules/wallet/sagas'
// import { getEth } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { CONNECT_WALLET_SUCCESS, CHANGE_ACCOUNT, CHANGE_NETWORK } from 'decentraland-dapps/dist/modules/wallet/actions'
// import { getInjectedProvider } from 'decentraland-dapps/dist/providers/WalletProvider/utils'
import { STORAGE_LOAD } from 'decentraland-dapps/dist/modules/storage/actions'

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
  // const provider = getInjectedProvider()
  // const wallet = getWallet()

  // try {
  //   // console.log(provider)
  // } catch (err) {
  //   console.log(err)
  // }
}