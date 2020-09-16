import { all, takeLatest, call, select, put } from 'redux-saga/effects'
// import { FETCH_TRANSACTION_SUCCESS, FetchTransactionSuccessAction } from 'decentraland-dapps/dist/modules/transaction/actions'
// import { Transaction, TransactionStatus } from 'decentraland-dapps/dist/modules/transaction/types'
import { getData as getTransactions } from 'decentraland-dapps/dist/modules/transaction/selectors'
import { createWalletSaga } from 'decentraland-dapps/dist/modules/wallet/sagas'
import { CONNECT_WALLET_SUCCESS, CHANGE_ACCOUNT, CHANGE_NETWORK } from 'decentraland-dapps/dist/modules/wallet/actions'
import { getData, getMana, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getManaMiniMeContract, getLandContract, getEstateContract, getManaContract } from 'modules/common/selectors'
import { Contract, BigNumber, utils } from 'ethers'
import {
  extendWalletRequest,
  EXTEND_WALLET_REQUEST,
  extendWalletFailure,
  extendWalletSuccess,
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
  allowManaFailure, EXTEND_WALLET_SUCCESS
} from './actions'
import { Wallet, Network } from './types'
import { getNetwork } from './selectors'
import { MANAMiniMeToken } from 'modules/common/contracts'
import { getUnwrapParams } from 'routing/selectors'
import { replace } from 'connected-react-router'
import { locations } from 'routing/locations'
import { UnwrapParams } from 'routing/types'
import { FetchTransactionSuccessAction, FETCH_TRANSACTION_SUCCESS } from 'decentraland-dapps/dist/modules/transaction/actions'
import { Transaction, TransactionStatus } from 'decentraland-dapps/dist/modules/transaction/types'

const VOTING_POWER_BY_LAND = 2_000
const MAX_ALLOWANCE_AMOUNT = BigNumber.from('0x' + 'f'.repeat(64))
const REQUIRE_ALLOWANCE_AMOUNT = BigNumber.from('0x01' + '0'.repeat(62))
const EMPTY_ALLOWANCE_AMOUNT = BigNumber.from(0)
const baseWalletSaga = createWalletSaga()

export function* walletSaga() {
  yield all([baseWalletSaga(), projectWalletSaga()])
}

function* projectWalletSaga() {
  yield takeLatest(CONNECT_WALLET_SUCCESS, requestBalance)
  yield takeLatest(CHANGE_ACCOUNT, requestBalance)
  yield takeLatest(CHANGE_NETWORK, requestBalance)
  yield takeLatest(FETCH_TRANSACTION_SUCCESS, checkBalance)
  yield takeLatest(EXTEND_WALLET_REQUEST, getBalance)
  yield takeLatest(ALLOW_MANA_REQUEST, allowManaBalance)
  yield takeLatest(ALLOW_LAND_REQUEST, allowLandBalance)
  yield takeLatest(ALLOW_ESTATE_REQUEST, allowEstateBalance)
  yield takeLatest(WRAP_MANA_REQUEST, wrapMana)
  yield takeLatest(UNWRAP_MANA_REQUEST, unwrapMana)
}

function* checkBalance(action: FetchTransactionSuccessAction) {
  const transactions: Transaction[] = yield select(getTransactions)
  const transaction = transactions.find(tx => tx.hash === action?.payload?.transaction?.hash)
  if (
    transaction?.status === TransactionStatus.CONFIRMED &&
    transaction?.actionType !== EXTEND_WALLET_SUCCESS
  ) {
    yield put(extendWalletRequest())
  }
}

function* requestBalance() {
  yield put(extendWalletRequest())
}

function* getBalance(): any {
  const wallet: Wallet | null = yield select(getData)

  if (wallet) {
    try {
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
        manaContract.functions.allowance(wallet.address, wrapAddress),
        manaMiniMeContract.balanceOf(wallet.address).catch(console.error),
        landContract.balanceOf(wallet.address).catch(console.error),
        landContract.registeredBalance(wallet.address).catch(console.error),
        estateContract.balanceOf(wallet.address).catch(console.error),
        estateContract.getLANDsSize(wallet.address).catch(console.error),
        estateContract.registeredBalance(wallet.address).catch(console.error)
      ]))

      const manaCommit = manaAllowance.gte(REQUIRE_ALLOWANCE_AMOUNT)
      manaMiniMe = Number(utils.formatEther(manaMiniMe || 0))
      land = BigNumber.from(land || 0).toNumber()
      landCommit = !!landCommit
      estate = BigNumber.from(estate || 0).toNumber()
      estateSize = BigNumber.from(estateSize || 0).toNumber()
      estateCommit = !!estateCommit

      const manaVotingPower = manaMiniMe
      const landVotingPower = landCommit ? land * VOTING_POWER_BY_LAND : 0
      const estateVotingPower = estate * estateSize * VOTING_POWER_BY_LAND
      const votingPower = manaVotingPower + landVotingPower + estateVotingPower

      yield put(extendWalletSuccess({
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
      yield put(extendWalletFailure(err.message))
    }
  } else {
    yield put(extendWalletSuccess(wallet))
  }
}

function* allowManaBalance() {
  try {
    const address: string = yield select(getAddress)
    const network: Network = yield select(getNetwork)
    const wrapAddress = MANAMiniMeToken[network]
    const manaContract: Contract = yield select(getManaContract)

    const [ allowed ]: [ BigNumber ] = yield call(() => manaContract.functions.allowance(address, wrapAddress))

    if (!allowed.gte(REQUIRE_ALLOWANCE_AMOUNT) && !allowed.eq(EMPTY_ALLOWANCE_AMOUNT)) {
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
    const depositTx = yield call(() => manaMiniMeContract.functions.deposit(utils.parseEther(amount.toString())))
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
    const depositTx = yield call(() => manaMiniMeContract.functions.withdraw(utils.parseEther(amount.toString())))

    yield put(unwrapManaSuccess(depositTx.hash))
    const query: UnwrapParams = yield select(getUnwrapParams)
    yield put(replace(locations.wrapping({ ...query, completed: true })))
  } catch (err) {
    yield put(unwrapManaFailure(err.message))
  }
}
