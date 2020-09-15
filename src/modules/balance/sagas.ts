import { call, put, select, takeEvery } from 'redux-saga/effects'
import { getData as getVotes } from 'modules/vote/selectors'
import { getData as getWallet } from 'modules/wallet/selectors'
import { getData as getBalance } from './selectors'
import {
  LOAD_BALANCE_REQUEST,
  LoadBalanceRequestAction,
  loadBalanceSuccess,
  loadBalanceFailure
} from './actions'
import { getAragonAggregatorContract } from 'modules/common/selectors'
import { Wallet } from 'modules/wallet/types'
import { Balance } from './type'
import { Vote } from 'modules/vote/types'
import { BigNumber } from 'ethers'

export function* balanceSaga() {
  yield takeEvery(LOAD_BALANCE_REQUEST, loadBalance)
}

function* loadBalance(action: LoadBalanceRequestAction): any {

  const wallet: Wallet | null = yield select(getWallet)
  if (wallet) {
    const aragonAggregatorContract = yield select(getAragonAggregatorContract)
    const balance: Record<string, Balance> = yield select(getBalance)
    const votes: Record<string, Vote> = yield select(getVotes)

    const errors: [string, string][] = []
    const data: [string, Balance][] = []

    for (const voteId of action.payload.votes) {
      if (balance[voteId]) {
        continue
      }

      const vote = votes[voteId]
      if (!vote) {
        continue
      }

      try {
        const votingPower: BigNumber = yield call(() => aragonAggregatorContract.balanceOfAt(wallet.address, vote.snapshotBlock))
        data.push([voteId, Number(votingPower.toString().slice(0, -18))])

      } catch (err) {
        errors.push([voteId, err.message])
      }
    }

    if (data.length) {
      yield put(loadBalanceSuccess(Object.fromEntries(data)))
    }

    if (errors.length) {
      yield put(loadBalanceFailure(Object.fromEntries(errors)))
    }
  }
}
