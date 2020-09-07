import { all, takeLatest, call, select, put } from 'redux-saga/effects'
import { FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
import { createWalletSaga } from 'decentraland-dapps/dist/modules/wallet/sagas'
import { CONNECT_WALLET_SUCCESS, CHANGE_ACCOUNT, CHANGE_NETWORK } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getData } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { getManaMiniMeContract, getLandContract, getEstateContract } from 'modules/common/selectors'
import { Contract, BigNumber } from 'ethers'
import { loadBalanceRequest, LOAD_BALANCE_REQUEST, loadBalanceFailure, loadBalanceSuccess, REGISTER_LAND_BALANCE_REQUEST, registerLandBalanceSuccess, registerLandBalanceFailure, REGISTER_ESTATE_BALANCE_REQUEST, registerEstateBalanceSuccess, registerEstateBalanceFailure } from './actions'

const VOTING_POWER_BY_LAND = 2_000
const baseWalletSaga = createWalletSaga()

export function* walletSaga() {
  yield all([baseWalletSaga(), projectWalletSaga()])
}

function* projectWalletSaga() {
  yield takeLatest(CONNECT_WALLET_SUCCESS, requestBalance)
  yield takeLatest(CHANGE_ACCOUNT, requestBalance)
  yield takeLatest(CHANGE_NETWORK, requestBalance)
  yield takeLatest(FETCH_TRANSACTION_SUCCESS, requestBalance)
  yield takeLatest(LOAD_BALANCE_REQUEST, getBalance)
  yield takeLatest(REGISTER_LAND_BALANCE_REQUEST, registerLandBalance)
  yield takeLatest(REGISTER_ESTATE_BALANCE_REQUEST, registerEstateBalance)
}

function* requestBalance() {
  yield put(loadBalanceRequest())
}

function* getBalance(): any {
  const wallet: Wallet | null = yield select(getData)

  if (wallet) {
    try {
      const manaMiniMeContract: Contract = yield select(getManaMiniMeContract)
      const landContract = yield select(getLandContract)
      const estateContract = yield select(getEstateContract)
      let [
        manaMiniMe,
        land,
        landCommit,
        estate,
        estateSize,
        estateCommit
      ] = yield call(() => Promise.all([
        manaMiniMeContract.balanceOf(wallet.address).catch(console.error),
        landContract.balanceOf(wallet.address).catch(console.error),
        landContract.registeredBalance(wallet.address).catch(console.error),
        estateContract.balanceOf(wallet.address).catch(console.error),
        estateContract.getLANDsSize(wallet.address).catch(console.error),
        estateContract.registeredBalance(wallet.address).catch(console.error)
      ]))

      manaMiniMe = (manaMiniMe || 0) / 1e18
      land = BigNumber.from(land || 0).toNumber()
      landCommit = !!landCommit
      estate = BigNumber.from(estate || 0).toNumber()
      estateSize = BigNumber.from(estateSize || 0).toNumber()
      estateCommit = !!estateCommit

      const manaVotingPower = manaMiniMe
      const landVotingPower = landCommit ? land * VOTING_POWER_BY_LAND : 0
      const estateVotingPower = estate * estateSize * VOTING_POWER_BY_LAND
      const votingPower = manaVotingPower + landVotingPower + estateVotingPower

      yield put(loadBalanceSuccess({
        ...wallet,
        manaMiniMe,
        land,
        landCommit,
        estate,
        estateSize,
        estateCommit,
        manaVotingPower,
        landVotingPower,
        estateVotingPower,
        votingPower
      }))

      if (landCommit) {
        yield put(registerLandBalanceSuccess())
      }

      if (estateCommit) {
        yield put(registerEstateBalanceSuccess())
      }
    } catch (err) {
      yield put(loadBalanceFailure(err.message))
    }
  } else {
    yield put(loadBalanceSuccess(wallet))
  }
}

function* registerLandBalance() {
  try {
    const landContract = yield select(getLandContract)
    yield call(() => landContract.registerBalance())
  } catch (err) {
    yield put(registerLandBalanceFailure(err.message))
  }
}

function* registerEstateBalance() {
  try {
    const estateContract = yield select(getEstateContract)
    yield call(() => estateContract.registerBalance())
  } catch (err) {
    yield put(registerEstateBalanceFailure(err.message))
  }
}
