import { all, takeLatest, call, select, put } from 'redux-saga/effects'
import { FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
import { createWalletSaga } from 'decentraland-dapps/dist/modules/wallet/sagas'
import { CONNECT_WALLET_SUCCESS, CHANGE_ACCOUNT, CHANGE_NETWORK } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getData, getMana, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getManaMiniMeContract, getLandContract, getEstateContract, getManaContract } from 'modules/common/selectors'
import { Contract, BigNumber } from 'ethers'
import {
  loadBalanceRequest,
  LOAD_BALANCE_REQUEST,
  loadBalanceFailure,
  loadBalanceSuccess,
  ALLOW_LAND_REQUEST,
  allowLandSuccess,
  allowLandFailure,
  ALLOW_ESTATE_REQUEST,
  allowEstateSuccess,
  allowEstateFailure,
  WRAP_MANA_REQUEST,
  wrapManaFailure,
  WrapManaRequestAction,
  wrapManaSuccess,
  UnwrapManaRequestAction,
  UNWRAP_MANA_REQUEST,
  unwrapManaSuccess,
  unwrapManaFailure,
  ALLOW_MANA_REQUEST,
  allowManaSuccess,
  allowManaFailure
} from './actions'
import { Wallet, Network } from './types'
import { getNetwork } from './selectors'
import { MANAMiniMeToken } from 'modules/common/contracts'
import { getUnwrapParams } from 'routing/selectors'
import { push } from 'connected-react-router'
import { locations } from 'routing/locations'
import { UnwrapParams } from 'routing/types'

const VOTING_POWER_BY_LAND = 2_000
const MAX_ALLOWANCE_AMOUNT = BigNumber.from('0x0f' + '0'.repeat(62))
const EMPTY_ALLOWANCE_AMOUNT = BigNumber.from(0)
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
  yield takeLatest(ALLOW_MANA_REQUEST, allowManaBalance)
  yield takeLatest(ALLOW_LAND_REQUEST, allowLandBalance)
  yield takeLatest(ALLOW_ESTATE_REQUEST, allowEstateBalance)
  yield takeLatest(WRAP_MANA_REQUEST, wrapMana)
  yield takeLatest(UNWRAP_MANA_REQUEST, unwrapMana)
}

function* requestBalance() {
  yield put(loadBalanceRequest())
}

function* getBalance(): any {
  const wallet: Wallet | null = yield select(getData)

  if (wallet) {
    try {
      const address: string = yield select(getAddress)
      const network: Network = yield select(getNetwork)
      const wrapAddress = MANAMiniMeToken[network]
      const manaContract: Contract = yield select(getManaContract)
      const manaMiniMeContract: Contract = yield select(getManaMiniMeContract)
      const landContract = yield select(getLandContract)
      const estateContract = yield select(getEstateContract)
      let [
        [ manaAllowance ],
        manaMiniMe,
        land,
        landCommit,
        estate,
        estateSize,
        estateCommit
      ] = yield call(() => Promise.all([
        manaContract.functions.allowance(address, wrapAddress),
        manaMiniMeContract.balanceOf(wallet.address).catch(console.error),
        landContract.balanceOf(wallet.address).catch(console.error),
        landContract.registeredBalance(wallet.address).catch(console.error),
        estateContract.balanceOf(wallet.address).catch(console.error),
        estateContract.getLANDsSize(wallet.address).catch(console.error),
        estateContract.registeredBalance(wallet.address).catch(console.error)
      ]))

      const manaCommit = manaAllowance.gte(MAX_ALLOWANCE_AMOUNT)
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
        manaCommit,
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

    } catch (err) {
      yield put(loadBalanceFailure(err.message))
    }
  } else {
    yield put(loadBalanceSuccess(wallet))
  }
}

function* allowManaBalance() {
  try {
    const address: string = yield select(getAddress)
    const network: Network = yield select(getNetwork)
    const wrapAddress = MANAMiniMeToken[network]
    const manaContract: Contract = yield select(getManaContract)

    const [ allowed ]: [ BigNumber ] = yield call(() => manaContract.functions.allowance(address, wrapAddress))

    if (!allowed.eq(MAX_ALLOWANCE_AMOUNT) && !allowed.eq(EMPTY_ALLOWANCE_AMOUNT)) {
      const clearTx = yield call(() => manaContract.functions.approve(wrapAddress, EMPTY_ALLOWANCE_AMOUNT))
      yield call(() => clearTx.wait(1))
    }

    if (!allowed.eq(MAX_ALLOWANCE_AMOUNT)) {
      const approveTx = yield call(() => manaContract.functions.approve(wrapAddress, MAX_ALLOWANCE_AMOUNT))
      yield put(allowManaSuccess(approveTx.hash))
    } else {
      yield put(allowManaSuccess())
    }

  } catch (err) {
    yield put(allowManaFailure(err.message))
  }
}

function* allowLandBalance() {
  try {
    const landContract = yield select(getLandContract)
    const tx = yield call(() => landContract.registerBalance())
    yield put(allowLandSuccess(tx.hash))
  } catch (err) {
    yield put(allowLandFailure(err.message))
  }
}

function* allowEstateBalance() {
  try {
    const estateContract = yield select(getEstateContract)
    const tx = yield call(() => estateContract.registerBalance())
    yield put(allowEstateSuccess(tx.hash))
  } catch (err) {
    yield put(allowEstateFailure(err.message))
  }
}

function* wrapMana(action: WrapManaRequestAction) {
  try {
    const mana: number = yield select(getMana)
    const amount: number = Math.max(Math.min(action.payload.amount || 0, mana), 0)
    const manaMiniMeContract: Contract = yield select(getManaMiniMeContract)

    const value = BigInt(amount) * BigInt(1e18)
    const depositTx = yield call(() => manaMiniMeContract.functions.deposit(value))
    yield put(wrapManaSuccess(depositTx.hash))

  } catch (err) {
    yield put(wrapManaFailure(err.message))
  }
}

function* unwrapMana(action: UnwrapManaRequestAction) {
  try {
    const mana: number = yield select(getMana)
    const amount: number = Math.max(Math.min(action.payload.amount || 0, mana), 0)
    const manaMiniMeContract: Contract = yield select(getManaMiniMeContract)

    const value = BigInt(amount) * BigInt(1e18)
    const depositTx = yield call(() => manaMiniMeContract.functions.withdraw(value))

    yield put(unwrapManaSuccess(depositTx.hash))
    const query: UnwrapParams = yield select(getUnwrapParams)
    yield put(push(locations.wrapping({ ...query, completed: true })))
  } catch (err) {
    yield put(unwrapManaFailure(err.message))
  }
}
