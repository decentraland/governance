import { all } from 'redux-saga/effects'

import { createAnalyticsSaga } from 'decentraland-dapps/dist/modules/analytics/sagas'
import { transactionSaga } from 'decentraland-dapps/dist/modules/transaction/sagas'

import { walletSaga } from 'modules/wallet/sagas'
import { translationSaga } from 'modules/translation/sagas'
import { organizationSaga } from 'modules/organization/sagas'
import { appSaga } from 'modules/app/sagas'
import { proposalSaga } from 'modules/proposal/sagas'
import { castSaga } from 'modules/cast/sagas'
import { voteDescriptionSaga } from 'modules/description/sagas'
import { subscriptionSaga } from 'modules/subscription/sagas'
import { segmentSaga } from 'modules/analytics/sagas'
import { balanceSaga } from 'modules/balance/sagas'

const analyticsSaga = createAnalyticsSaga()

export function* rootSaga() {
  yield all([
    analyticsSaga(),
    segmentSaga(),
    transactionSaga(),
    translationSaga(),
    organizationSaga(),
    appSaga(),
    proposalSaga(),
    voteDescriptionSaga(),
    castSaga(),
    walletSaga(),
    balanceSaga(),
    subscriptionSaga()
  ])
}
